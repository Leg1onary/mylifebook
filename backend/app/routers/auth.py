from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.personal_context import PersonalContext
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut, UserUpdate
from app.security.passwords import hash_password, verify_password
from app.security.auth import authenticate_user
from app.security.jwt import create_access_token
from app.config import get_settings

router = APIRouter()
settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    # Normalize email to lowercase to prevent duplicates
    email = payload.email.lower().strip()
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        display_name=payload.display_name,
        timezone=payload.timezone,
    )
    db.add(user)
    await db.flush()  # get user.id before commit

    # Create empty personal context for new user
    context = PersonalContext(user_id=user.id)
    db.add(context)

    return user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, payload: UserLogin, db: AsyncSession = Depends(get_db)):
    # Authenticate always against normalized email
    user = await authenticate_user(db, payload.email.lower().strip(), payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    expire_delta = timedelta(minutes=settings.access_token_expire_minutes)
    token = create_access_token(
        subject=user.id,
        expires_delta=expire_delta,
    )
    return TokenResponse(
        access_token=token,
        expires_in=int(expire_delta.total_seconds()),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: User = Depends(get_current_user)):
    """
    Stateless JWT — logout is handled client-side by discarding the token.
    This endpoint exists so the frontend can call a real URL and clear state cleanly.
    In the future a token blocklist can be added here.
    """
    return


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Issue a fresh token for an already-authenticated user."""
    expire_delta = timedelta(minutes=settings.access_token_expire_minutes)
    token = create_access_token(
        subject=current_user.id,
        expires_delta=expire_delta,
    )
    return TokenResponse(
        access_token=token,
        expires_in=int(expire_delta.total_seconds()),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_me(
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.display_name is not None:
        current_user.display_name = payload.display_name
    if payload.timezone is not None:
        current_user.timezone = payload.timezone
    if payload.new_password is not None:
        if not payload.current_password:
            raise HTTPException(status_code=400, detail="current_password required")
        if not verify_password(payload.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Wrong current password")
        current_user.hashed_password = hash_password(payload.new_password)
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.delete(current_user)
