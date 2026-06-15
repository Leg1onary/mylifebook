from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.deps import get_db, get_current_user
from app.models.user import User
from app.models.experiment import Experiment
from app.schemas.experiment import ExperimentCreate, ExperimentUpdate, ExperimentOut
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.post("/", response_model=ExperimentOut, status_code=status.HTTP_201_CREATED)
async def create_experiment(
    payload: ExperimentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    exp = Experiment(user_id=user.id, **payload.model_dump())
    db.add(exp)
    await db.flush()
    return exp


@router.get("/", response_model=PaginatedResponse[ExperimentOut])
async def list_experiments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(Experiment).where(Experiment.user_id == user.id)
    if status:
        q = q.where(Experiment.status == status)

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    q = q.order_by(Experiment.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    items = (await db.execute(q)).scalars().all()

    return PaginatedResponse(items=items, total=total, page=page, per_page=per_page,
                             has_next=(page * per_page) < total)


@router.get("/{exp_id}", response_model=ExperimentOut)
async def get_experiment(
    exp_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Experiment).where(Experiment.id == exp_id, Experiment.user_id == user.id)
    )
    exp = result.scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp


@router.patch("/{exp_id}", response_model=ExperimentOut)
async def update_experiment(
    exp_id: int,
    payload: ExperimentUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Experiment).where(Experiment.id == exp_id, Experiment.user_id == user.id)
    )
    exp = result.scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(exp, field, value)
    return exp


@router.delete("/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experiment(
    exp_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Experiment).where(Experiment.id == exp_id, Experiment.user_id == user.id)
    )
    exp = result.scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    await db.delete(exp)
