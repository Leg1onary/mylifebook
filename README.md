# MyLifeBook 📓

> Персональный PWA-дневник для работы с паттернами поведения и когнитивными искажениями.
> Домен: **mylifebook.ru**

---

## Стек

| Слой | Технология |
|------|------------|
| Backend API | FastAPI 0.115 + Python 3.12 |
| ORM | SQLAlchemy 2.0 (async) |
| БД | PostgreSQL 16 |
| Миграции | Alembic |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| AI | OpenRouter API (claude-3.5-haiku по умолчанию) |
| Контейнеры | Docker + docker-compose |
| Frontend | React + TypeScript + Vite (PWA) — `/frontend` |

---

## Быстрый старт

```bash
# 1. Клонировать
git clone https://github.com/Leg1onary/mylifebook.git
cd mylifebook

# 2. Создать .env
cp .env.example .env
# Отредактировать .env: задать POSTGRES_PASSWORD и SECRET_KEY

# 3. Запустить
docker-compose up -d --build

# Миграции запускаются автоматически при старте контейнера backend.
# API доступно на http://localhost:8000
# Swagger (только DEBUG=true): http://localhost:8000/api/docs
```

---

## Структура проекта

```
mylifebook/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app factory
│   │   ├── config.py         # Pydantic Settings
│   │   ├── database.py       # Async SQLAlchemy engine
│   │   ├── deps.py           # FastAPI dependencies (get_db, get_current_user)
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # API route handlers
│   │   └── security/         # JWT + bcrypt helpers
│   ├── alembic/              # DB migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React PWA (TBD)
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## API эндпоинты

| Prefix | Модуль | Описание |
|--------|--------|----------|
| `/api/v1/auth` | auth | Регистрация, логин, профиль |
| `/api/v1/today` | today | Агрегированный экран «Сегодня» |
| `/api/v1/checkins` | daily_checkins | Ежедневный чек-ин |
| `/api/v1/thoughts` | thought_records | Дневник мыслей (CBT) |
| `/api/v1/experiments` | experiments | Поведенческие эксперименты |
| `/api/v1/triggers` | triggers | Быстрый лог триггеров |
| `/api/v1/weekly` | weekly_reviews | Недельные обзоры |
| `/api/v1/context` | personal_context | Личный контекст пользователя |
| `/api/v1/insights` | insights | Аналитика: тренды, паттерны |
| `/api/v1/ai` | ai | AI-инсайты через OpenRouter |
| `/api/v1/exports` | exports | Экспорт в Markdown для психолога |
| `/api/v1/settings` | settings | Настройки уведомлений и темы |

---

## Создать первую миграцию вручную

```bash
cd backend
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

---

## Переменные окружения

См. [`.env.example`](.env.example).

**Обязательные:**
- `DATABASE_URL` — asyncpg DSN
- `SECRET_KEY` — минимум 32 случайных байта (`openssl rand -hex 32`)
- `POSTGRES_PASSWORD` — пароль для PostgreSQL

**Опциональные:**
- `OPENROUTER_API_KEY` — нужен только для AI-инсайтов
- `DEBUG=true` — включает Swagger UI
