# MyLifeBook

Приватное single-user PWA-приложение для работы с психологическими паттернами.

Живёт на **mylifebook.ru**. Только для личного использования — индексация запрещена, регистрация отсутствует.

---

## Что это

Инструмент для ежедневного наблюдения за собой и разрушения повторяющихся автоматических схем через:

- **Daily check-in** — ежедневная фиксация состояния (2 минуты)
- **Thought Records** — 12-шаговый разбор триггерных мыслей
- **Behavioral Experiments** — проверка старых законов в реальности
- **SOS mode** — быстрая фиксация острого момента за 60 секунд
- **Weekly Review** — еженедельный анализ паттернов с AI summary
- **Insights** — графики и статистика по периодам

---

## Стек

| Часть | Технологии |
|---|---|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 async, SQLite, Alembic, Pydantic v2 |
| Frontend | React 18, TypeScript, Vite 5, Zustand, TanStack Query v5, Recharts |
| PWA | vite-plugin-pwa (Workbox), Web Notifications API |
| AI | OpenRouter API (claude-3.5-haiku по умолчанию) |
| Инфра | Docker, docker-compose, Nginx |

---

## Структура проекта

```
mylifebook/
├── backend/        FastAPI приложение
├── frontend/       React PWA
├── infra/          Nginx, скрипты деплоя и бэкапа
├── data/           SQLite БД (Docker volume)
└── docs/           ТЗ, карта экранов, user flows, AI rules, промпты
```

Полное описание каждого файла — в `docs/TZ/mylifebook_tz_v3_private_mvp.md`, раздел «Структура проекта».

---

## Быстрый старт

### 1. Клонировать и настроить окружение

```bash
git clone <repo-url> mylifebook
cd mylifebook
cp .env.example .env
```

Заполнить `.env`:

```env
DATABASE_URL=sqlite+aiosqlite:///./data/lifebook.db
SECRET_KEY=<случайная строка 32+ символа>
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
OPENROUTER_API_KEY=<ключ от openrouter.ai>
OPENROUTER_MODEL=anthropic/claude-3.5-haiku
APP_USERNAME=<твой логин>
APP_PASSWORD=<твой пароль>
CORS_ORIGINS=https://mylifebook.ru,http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 2. Запустить через Docker

```bash
docker-compose up -d
```

Приложение доступно на `http://localhost`.

### 3. Запустить локально (разработка)

```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (в другом терминале)
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend API: `http://localhost:8000/api/v1`
Swagger docs: `http://localhost:8000/docs`

---

## Полезные команды (Makefile)

```bash
make dev          # запустить docker-compose в dev режиме
make build        # собрать образы
make deploy       # деплой на VPS (git pull + build + restart)
make backup       # бэкап БД в data/backups/
make restore      # восстановить из бэкапа
make logs         # хвост логов всех сервисов
make shell        # войти в контейнер backend
```

---

## Деплой на VPS

```bash
# На сервере (первый раз)
git clone <repo-url> /opt/mylifebook
cd /opt/mylifebook
cp .env.example .env
# Заполнить .env
docker-compose up -d

# Обновление
./infra/scripts/deploy.sh
```

Traefik labels — в `infra/traefik/labels.example.txt`.
Nginx конфиг — в `infra/nginx/mylifebook.conf`.

---

## Бэкап и восстановление

```bash
# Бэкап
./infra/scripts/backup.sh
# Создаёт: data/backups/lifebook_2026-06-15.db

# Восстановление
./infra/scripts/restore.sh data/backups/lifebook_2026-06-15.db
```

---

## Документация

| Файл | Содержимое |
|---|---|
| `docs/TZ/mylifebook_tz_v3_private_mvp.md` | Полное техническое задание |
| `docs/product/screen-map.md` | Карта всех экранов и навигации |
| `docs/product/user-flows.md` | Пользовательские сценарии (9 flows) |
| `docs/product/ai-behavior.md` | Правила поведения AI, промпты, edge cases |
| `docs/prompts/implementation-pack.md` | Пакет для реализатора: стек, порядок фаз, правила |
| `docs/prompts/openrouter-master-prompt.md` | Готовые промпты для OpenRouter по фазам |
| `docs/prompts/screen-prompts/` | Промпты под каждый экран отдельно |
| `docs/api/openapi-notes.md` | Форматы запросов/ответов всех API endpoints |

---

## Приватность

- `robots.txt`: `Disallow: /`
- Nginx: `X-Robots-Tag: noindex, nofollow` на все ответы
- AI: данные не кешируются, идентификаторы не передаются
- БД: хранится локально как Docker volume, не покидает сервер
- Пароль: только bcrypt hash в БД
