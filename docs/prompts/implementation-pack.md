# Implementation Pack — MyLifeBook

> Этот документ — главный вводный пакет для реализатора (человека или LLM).
> Читай его полностью перед тем как писать первую строку кода.
> Здесь собрано всё, что нужно знать о проекте, стеке, архитектуре и правилах.

---

## 1. Что это за проект

**MyLifeBook** — приватное single-user PWA-приложение для работы с психологическими паттернами.
Живёт на домене **mylifebook.ru**.

Пользователь один. Это не SaaS. Это личный инструмент.

Ключевая цель приложения: помочь пользователю замечать, фиксировать и переосмыслять
повторяющиеся автоматические мысли и поведенческие схемы через ежедневные записи,
thought records, поведенческие эксперименты и AI-assisted рефлексию.

### Обязательные документы перед началом
Прочитай все документы из `docs/` в следующем порядке:
1. `docs/TZ/mylifebook_tz_v3_private_mvp.md` — полное ТЗ
2. `docs/product/screen-map.md` — карта экранов
3. `docs/product/user-flows.md` — пользовательские сценарии
4. `docs/product/ai-behavior.md` — правила AI

---

## 2. Технологический стек

### Backend
| Компонент | Выбор | Версия |
|---|---|---|
| Runtime | Python | 3.12+ |
| Framework | FastAPI | 0.115+ |
| ORM | SQLAlchemy | 2.0 (async) |
| БД | SQLite | встроенная |
| Миграции | Alembic | latest |
| Валидация | Pydantic v2 | 2.x |
| Auth | JWT (python-jose) + bcrypt | — |
| HTTP-клиент | httpx | async |
| AI | OpenRouter API | — |
| Тесты | pytest + pytest-asyncio | — |
| Сервер | uvicorn | — |

### Frontend
| Компонент | Выбор | Версия |
|---|---|---|
| Framework | React | 18+ |
| Язык | TypeScript | 5.x |
| Сборщик | Vite | 5.x |
| PWA | vite-plugin-pwa | latest |
| Роутинг | React Router v6 | — |
| Стейт | Zustand | 4.x |
| Запросы | TanStack Query (react-query) | v5 |
| HTTP | Axios | — |
| Формы | React Hook Form + Zod | — |
| Графики | Recharts | — |
| Иконки | Lucide React | — |
| Стили | CSS Modules + CSS Variables | — |

### Инфраструктура
| Компонент | Выбор |
|---|---|
| Контейнеризация | Docker + docker-compose |
| Reverse proxy | Nginx (или Traefik если уже настроен) |
| БД файл | `/data/lifebook.db` (Docker volume) |
| Деплой | VPS, docker-compose up -d |

---

## 3. Архитектурные решения

### 3.1 Monorepo
Весь проект в одном репозитории `mylifebook/`.
Backend и Frontend — отдельные папки с отдельными Dockerfile.
docker-compose поднимает оба сервиса.

### 3.2 SQLite, не PostgreSQL
Проект single-user, нагрузки нет. SQLite достаточно.
БД монтируется как Docker volume → данные не теряются при пересборке.
Путь: `/data/lifebook.db`.
Бэкапы: `infra/scripts/backup.sh` копирует файл с датой.

### 3.3 Local-first черновики
Незавершённые формы (thought record wizard, чекин, SOS) хранятся в `draftStore` (Zustand).
Никакого localStorage — sandboxed окружения его блокируют.
Синхронизация с backend происходит при [Сохранить] или автосохранении.

### 3.4 Single-user auth
Один пользователь. Нет регистрации. Credentials задаются через `.env`.
JWT токены: access (15 мин) + refresh (30 дней).
Refresh реализован через interceptor в `api/client.ts`.

### 3.5 AI через OpenRouter
Все AI-запросы идут через `backend/app/services/ai/openrouter_client.py`.
Frontend никогда не обращается к OpenRouter напрямую — только через backend API.
API ключ OpenRouter хранится в `.env`, не попадает во frontend.

### 3.6 PWA
`manifest.webmanifest` настроен на `display: standalone`.
Service worker через `vite-plugin-pwa` (Workbox).
Offline: кешируем shell + последние данные. При нет сети — `offline.html`.
`robots.txt` содержит `Disallow: /` — индексация запрещена полностью.

---

## 4. Структура API

Базовый URL: `/api/v1`

### Auth
```
POST   /api/v1/auth/login          — получить access + refresh токены
POST   /api/v1/auth/logout         — инвалидировать refresh токен
POST   /api/v1/auth/refresh        — обновить access токен
```

### Today
```
GET    /api/v1/today               — агрегированный snapshot для TodayPage
```

### Daily Check-ins
```
GET    /api/v1/daily-checkins      — список (query: from, to, limit)
POST   /api/v1/daily-checkins      — создать
GET    /api/v1/daily-checkins/:id  — детали
PUT    /api/v1/daily-checkins/:id  — обновить
DELETE /api/v1/daily-checkins/:id  — удалить
```

### Triggers
```
GET    /api/v1/triggers            — список (query: from, to, category, limit)
POST   /api/v1/triggers            — создать
GET    /api/v1/triggers/:id        — детали
PUT    /api/v1/triggers/:id        — обновить
DELETE /api/v1/triggers/:id        — удалить
```

### Thought Records
```
GET    /api/v1/thought-records     — список (query: from, to, status)
POST   /api/v1/thought-records     — создать / сохранить черновик
GET    /api/v1/thought-records/:id — детали
PUT    /api/v1/thought-records/:id — обновить
DELETE /api/v1/thought-records/:id — удалить
```

### Experiments
```
GET    /api/v1/experiments         — список (query: status)
POST   /api/v1/experiments         — создать
GET    /api/v1/experiments/:id     — детали
PUT    /api/v1/experiments/:id     — обновить (включая follow-up)
DELETE /api/v1/experiments/:id     — удалить
```

### Weekly Reviews
```
GET    /api/v1/weekly-reviews      — список
POST   /api/v1/weekly-reviews      — создать / обновить за неделю
GET    /api/v1/weekly-reviews/:id  — детали
PUT    /api/v1/weekly-reviews/:id  — обновить
```

### Insights
```
GET    /api/v1/insights            — аналитика (query: period = 7d|30d|90d)
```

### Personal Context
```
GET    /api/v1/personal-context    — получить профиль
PUT    /api/v1/personal-context    — обновить профиль вручную
POST   /api/v1/personal-context/extract — извлечь из raw text через AI
```

### AI
```
POST   /api/v1/ai/reframe          — AI reframe для thought record
POST   /api/v1/ai/weekly-summary   — AI summary для weekly review
```

### Exports
```
GET    /api/v1/exports/pdf         — PDF (query: from, to)
GET    /api/v1/exports/markdown    — Markdown (query: from, to)
GET    /api/v1/exports/json        — JSON backup (query: from, to)
```

### Settings
```
GET    /api/v1/settings            — получить настройки
PUT    /api/v1/settings            — обновить настройки
```

---

## 5. Модели данных (краткий ERD)

```
users
  id, username, password_hash, created_at

personal_context
  id, user_id, triggers (JSON), old_laws (JSON),
  typical_distortions (JSON), communication_prefs, growth_goals (JSON),
  raw_text, updated_at

daily_checkins
  id, user_id, date (UNIQUE), mood, energy, anxiety, shame,
  loneliness, anger, emotion_tags (JSON), note_main, note_pain,
  note_support, note_need, had_trigger (bool), created_at, updated_at

trigger_events
  id, user_id, created_at, situation, auto_thought, emotion_tags (JSON),
  emotion_intensity, body_response, impulse, old_law, category,
  linked_thought_record_id (FK, nullable)

thought_records
  id, user_id, created_at, updated_at, status (draft|complete),
  situation, auto_thought, meaning, emotions (JSON), body_response,
  old_law, evidence_for, evidence_against, distortions (JSON),
  new_perspective, new_action, ai_reframe (text, nullable),
  followup_text, followup_emotion_after, linked_trigger_id (FK, nullable)

experiments
  id, user_id, created_at, updated_at, status (planned|active|complete),
  old_law, fear_description, action_plan, forecast, fear_before (0-10),
  planned_date, result, what_worked, what_didnt, conclusion,
  fear_after (0-10), linked_thought_record_id (FK, nullable)

weekly_reviews
  id, user_id, week_start (UNIQUE), week_end, checkins_count,
  triggers_count, tr_count, experiments_count, avg_mood, avg_anxiety,
  avg_shame, avg_loneliness, top_old_laws (JSON), top_trigger_categories (JSON),
  ai_summary (text, nullable), guided_q1..q6 (text, nullable),
  conclusion, next_week_focus, created_at, updated_at

reminders
  id, user_id, type (morning|evening|weekly|experiment),
  time, weekday (nullable), enabled (bool)

ai_logs
  id, user_id, type, input_hash, output, model,
  tokens_used, duration_ms, crisis_flag (bool), created_at
```

---

## 6. Правила разработки

### 6.1 Именование
- Python: `snake_case` для файлов, функций, переменных
- TypeScript: `camelCase` для переменных/функций, `PascalCase` для компонентов и типов
- URL: `kebab-case` (`/thought-records`, `/daily-checkins`)
- CSS классы: `kebab-case` (`.daily-checkin-form`, `.ai-reframe-card`)

### 6.2 Обязательные состояния в UI
Каждый экран с данными должен обрабатывать:
- `loading` — skeleton layout (не спиннер посередине)
- `error` — error banner с кнопкой «Попробовать снова»
- `empty` — empty state с описанием и CTA (не просто «нет данных»)

### 6.3 Формы
- Валидация через Zod схемы, подключенные к React Hook Form
- Inline ошибки под каждым полем, не toast
- Автосохранение черновика в draftStore при onChange (debounce 1000ms)
- Кнопка submit блокируется во время запроса

### 6.4 API клиент
- Один Axios instance в `api/client.ts`
- Interceptor для добавления Authorization header
- Interceptor для автоматического refresh при 401
- Все запросы обёрнуты в TanStack Query хуки

### 6.5 Обработка ошибок
- Backend: всегда возвращает `{ detail: string }` при ошибке
- Frontend: глобальный error handler в query client
- Toast только для фоновых/системных уведомлений
- Inline ошибки для форм и контекстных действий

### 6.6 Безопасность
- Все роуты (кроме /auth/login) требуют валидный JWT
- CORS: разрешить только mylifebook.ru и localhost в dev
- `robots.txt`: `Disallow: /`
- Заголовки: `X-Robots-Tag: noindex, nofollow` на все ответы nginx
- Пароль хранится только как bcrypt hash, никогда plaintext

### 6.7 Переменные окружения

Backend `.env`:
```
DATABASE_URL=sqlite+aiosqlite:///./data/lifebook.db
SECRET_KEY=<random 32+ chars>
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30
OPENROUTER_API_KEY=<ключ>
OPENROUTER_MODEL=anthropic/claude-3.5-haiku
APP_USERNAME=<логин>
APP_PASSWORD=<пароль>
CORS_ORIGINS=https://mylifebook.ru,http://localhost:5173
```

Frontend `.env`:
```
VITE_API_BASE_URL=https://mylifebook.ru/api/v1
```

---

## 7. Порядок реализации MVP

Реализуй в следующем порядке. Не прыгай вперёд.

### Фаза 1 — Фундамент (backend)
1. `database.py` — SQLAlchemy async engine, session, Base
2. Все `models/` — создать таблицы
3. `migrations/` — Alembic init, первая миграция
4. `security/` — JWT + bcrypt
5. `routers/auth.py` — login, refresh, logout
6. `deps.py` — get_db, get_current_user
7. Smoke test: POST /auth/login возвращает токены

### Фаза 2 — Фундамент (frontend)
1. Vite + React + TypeScript setup
2. PWA конфиг (manifest, service worker)
3. `styles/tokens.css` — CSS переменные (цвета, типографика, отступы)
4. `styles/globals.css` — reset + base
5. `components/layout/` — AppShell, BottomNav, TopBar, Page
6. `app/router.tsx` — все маршруты
7. `app/guards/` — AuthGuard, GuestGuard
8. `pages/auth/LoginPage.tsx` — форма логина
9. `api/client.ts` — Axios с interceptors
10. `store/authStore.ts` — auth state
11. Smoke test: логин работает, редирект на /today

### Фаза 3 — Daily Check-in
1. Backend: модель, схема, роутер, сервис, репозиторий
2. Frontend: DailyCheckinPage, DailyHistoryPage
3. TodayPage — базовый skeleton с статусом чекина
4. draftStore для незавершённого чекина

### Фаза 4 — Trigger Capture
1. Backend: trigger_events
2. Frontend: TriggerCapturePage, TriggerDetailPage
3. Подключить к + modal

### Фаза 5 — Thought Record Wizard
1. Backend: thought_records (с поддержкой черновиков)
2. Frontend: 12-шаговый wizard
3. Связь TR ↔ Trigger (pre-fill из триггера)
4. ThoughtRecordDetailPage

### Фаза 6 — Experiments
1. Backend: experiments
2. Frontend: ExperimentsPage, ExperimentDetailPage, форма follow-up
3. Связь Experiment ↔ ThoughtRecord

### Фаза 7 — SOS Modal
1. Frontend: SOS overlay (4 шага)
2. Сохранение как TriggerEvent draft
3. Переход в TR wizard с pre-fill

### Фаза 8 — Weekly Review + Insights
1. Backend: weekly_reviews, роутер insights с агрегацией
2. Frontend: WeeklyReviewPage, InsightsPage с Recharts

### Фаза 9 — AI Integration
1. Backend: openrouter_client, prompt_builder, reframing_service, weekly_summary_service
2. Роутер /ai/reframe и /ai/weekly-summary
3. Frontend: шаг 12 в TR wizard, AI summary на WeeklyReviewPage
4. Кризисная детекция в backend

### Фаза 10 — Personal Context
1. Backend: personal_context + profile_extractor
2. Frontend: PersonalContextPage

### Фаза 11 — Settings + Export
1. Backend: reminders, export_service (PDF/Markdown/JSON)
2. Frontend: SettingsPage

### Фаза 12 — Polish
1. Все empty states
2. Все error states
3. Все skeleton loaders
4. Push-напоминания (через браузерные Notifications API)
5. Offline поведение
6. Dark mode доводка

---

## 8. Частые ошибки — не делай так

| Ошибка | Правильно |
|---|---|
| Хранить AI ключ во frontend | Только в backend `.env` |
| Обращаться к OpenRouter из frontend | Только через `/api/v1/ai/...` |
| Использовать localStorage | Только in-memory (Zustand) |
| Делать одну большую форму для TR | 12 отдельных шагов в wizard |
| Спиннер посередине экрана при загрузке | Skeleton layout |
| Toast при ошибке формы | Inline error под полем |
| Хранить пароль plaintext | Только bcrypt hash |
| Один файл `main.py` со всей логикой | Роутеры / сервисы / репозитории раздельно |
| Игнорировать offline state | draftStore + sync при восстановлении |
| max-width на page-content | Контент растягивается на всю ширину |

---

## 9. Ключевые файлы для старта

Если ты LLM и начинаешь с нуля, начни с этих файлов в таком порядке:

```
1. backend/app/database.py
2. backend/app/models/*.py (все)
3. backend/migrations/env.py + первая миграция
4. backend/app/security/auth.py + passwords.py
5. backend/app/routers/auth.py
6. backend/app/main.py
7. frontend/vite.config.ts
8. frontend/src/styles/tokens.css
9. frontend/src/styles/globals.css
10. frontend/src/app/App.tsx + router.tsx
11. frontend/src/api/client.ts
12. frontend/src/pages/auth/LoginPage.tsx
```

После этого — smoke test. Потом фазы 3–12 по порядку.

---

## 10. Docker-compose структура

```yaml
version: '3.9'

services:
  backend:
    build: ./backend
    volumes:
      - ./data:/app/data
    env_file: .env
    restart: unless-stopped
    expose:
      - "8000"

  frontend:
    build: ./frontend
    expose:
      - "80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infra/nginx/mylifebook.conf:/etc/nginx/conf.d/default.conf
      - ./data/certs:/etc/nginx/certs
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  data:
```

---

## 11. Контакт с документацией

При любых вопросах сверяйся с документами в `docs/`:
- Нет ясности по экрану → `docs/product/screen-map.md`
- Нет ясности по сценарию → `docs/product/user-flows.md`
- Нет ясности по AI → `docs/product/ai-behavior.md`
- Нет ясности по требованиям → `docs/TZ/mylifebook_tz_v3_private_mvp.md`

Если ответа нет ни в одном из этих документов — это gap в документации,
не делай по своему усмотрению, зафиксируй вопрос.
