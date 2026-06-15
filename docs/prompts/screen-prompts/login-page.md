# Screen Prompt — LoginPage

## Файл
`frontend/src/pages/auth/LoginPage.tsx`

## Контекст
Единственный публичный экран. Один пользователь, нет регистрации.
После успешного логина → редирект на /today через GuestGuard.

## Что реализовать

Компонент `LoginPage` — полноэкранная форма авторизации.

**Layout:**
- Вертикально центрирован на экране
- Логотип / название MyLifeBook сверху
- Форма по центру, ширина max 400px на desktop, 100% на mobile
- Тёмный фон, акцентный цвет из `--color-primary`

**Форма:**
- Поле `username` (text input, label «Имя пользователя»)
- Поле `password` (password input, label «Пароль», toggle показать/скрыть)
- Кнопка [Войти] — полная ширина, акцентный цвет
- Кнопка блокируется и показывает спиннер во время запроса

**Валидация (Zod + React Hook Form):**
- username: required, minLength 1
- password: required, minLength 1
- Inline ошибки под каждым полем
- Общая ошибка «Неверный логин или пароль» под формой при 401

**После успеха:**
- Сохранить токены через `authStore.setToken()`
- React Router navigate('/today')

**Состояния:**
- default, loading (кнопка заблокирована), error (inline message)

## API
```
POST /api/v1/auth/login
Body: { username, password }
Response: { access_token, refresh_token, token_type }
```

## Зависимости
- `frontend/src/api/auth.ts` — функция `login()`
- `frontend/src/store/authStore.ts` — `setToken()`
- `frontend/src/app/guards/GuestGuard.tsx` — редирект если уже залогинен
