# OpenRouter Master Prompt — MyLifeBook

> Этот файл содержит готовый промпт для запуска реализации через OpenRouter или Perplexity Computer.
> Копируй секцию **PROMPT** целиком и вставляй в чат.
> Ниже — варианты промпта для разных фаз разработки.

---

## Как использовать

1. Выбери фазу (смотри `docs/prompts/implementation-pack.md`, раздел 7)
2. Скопируй нужный промпт
3. Вставь в OpenRouter или Perplexity Computer
4. Приложи нужные файлы из `docs/` (список указан в каждом промпте)

Рекомендуемая модель: `anthropic/claude-3.5-sonnet` (сложный код) или `anthropic/claude-3.5-haiku` (быстро и дёшево)

---

---

## ПРОМПТ 0 — Старт проекта (читает ТЗ, задаёт вопросы)

Используй перед первым кодом. Даёт LLM понять весь контекст.
Прикрепи: `mylifebook_tz_v3_private_mvp.md`, `screen-map.md`, `user-flows.md`, `ai-behavior.md`, `implementation-pack.md`

```
Ты опытный fullstack-разработчик. Тебе предстоит реализовать проект MyLifeBook — 
приватное single-user PWA-приложение на mylifebook.ru для работы с психологическими паттернами.

Я прикрепил все документы проекта:
- ТЗ (mylifebook_tz_v3_private_mvp.md)
- Карта экранов (screen-map.md)
- User flows (user-flows.md)
- Правила AI (ai-behavior.md)
- Пакет реализатора (implementation-pack.md)

Пожалуйста:
1. Прочитай все документы
2. Кратко подтверди: стек, архитектуру, порядок фаз, ключевые ограничения
3. Задай все вопросы, которые возникли — до того как начать писать код
4. После того как я отвечу — начнём с Фазы 1
```

---

## ПРОМПТ 1 — Фаза 1: Backend фундамент

Прикрепи: `implementation-pack.md`

```
Ты опытный Python/FastAPI разработчик. Реализуй Фазу 1 проекта MyLifeBook.

Контекст проекта (из implementation-pack.md — прикреплён):
- Single-user приватное приложение
- Стек: FastAPI + SQLAlchemy 2.0 async + SQLite (aiosqlite) + Alembic + Pydantic v2 + JWT
- БД файл: /data/lifebook.db (Docker volume)
- Один пользователь, credentials из .env

Реализуй следующие файлы полностью, без заглушек:

1. backend/app/database.py
   — async SQLAlchemy engine с aiosqlite
   — AsyncSession, get_async_session
   — Base для моделей

2. backend/app/models/user.py
   — таблица users: id, username, password_hash, created_at

3. backend/app/models/__init__.py
   — импорт всех моделей

4. backend/app/config.py
   — Pydantic Settings из .env
   — поля: DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS,
     OPENROUTER_API_KEY, OPENROUTER_MODEL, APP_USERNAME, APP_PASSWORD, CORS_ORIGINS

5. backend/app/security/passwords.py
   — hash_password(plain) → hashed
   — verify_password(plain, hashed) → bool

6. backend/app/security/auth.py
   — create_access_token(data, expires_delta)
   — create_refresh_token(data)
   — decode_token(token) → payload

7. backend/app/deps.py
   — get_db: AsyncSession dependency
   — get_current_user: декодирует JWT, возвращает User

8. backend/app/routers/auth.py
   — POST /auth/login → access_token + refresh_token
   — POST /auth/refresh → новый access_token по refresh
   — POST /auth/logout → инвалидация (достаточно 200 OK для MVP)

9. backend/app/main.py
   — FastAPI app
   — CORS из config
   — подключение роутера auth
   — startup: create_all tables
   — seed: создать пользователя из .env если не существует

10. backend/migrations/env.py
    — Alembic async setup

11. backend/requirements.txt
    — все зависимости с версиями

12. backend/Dockerfile
    — python:3.12-slim, uvicorn, expose 8000

После написания кода: покажи как запустить smoke test (curl команды для /auth/login).
```

---

## ПРОМПТ 2 — Фаза 2: Frontend фундамент

Прикрепи: `implementation-pack.md`, `screen-map.md`

```
Ты опытный React/TypeScript разработчик. Реализуй Фазу 2 проекта MyLifeBook.

Контекст:
- PWA, mobile-first, React 18 + TypeScript + Vite 5
- Стейт: Zustand. Запросы: TanStack Query v5. HTTP: Axios.
- Стили: CSS Modules + CSS Variables (никаких UI-библиотек вроде MUI или Ant)
- Контент растягивается на всю ширину, нет max-width на page-content
- Тёмная тема по умолчанию, переключатель light/dark
- Bottom navigation: Today | Journal | + | Week | Me

Реализуй:

1. frontend/vite.config.ts
   — vite-plugin-pwa с workbox, VITE_API_BASE_URL

2. frontend/public/manifest.webmanifest
   — name: MyLifeBook, display: standalone, theme_color: #0f0f0f

3. frontend/public/robots.txt
   — Disallow: /

4. frontend/src/styles/tokens.css
   — CSS переменные: цвета (dark/light), типографика, отступы (4px система), радиусы
   — тёмная тема: фон #0f0f0f, поверхность #1a1a1a, акцент #4f98a3
   — светлая тема: нейтральные тёплые тона

5. frontend/src/styles/globals.css
   — reset + base styles

6. frontend/src/components/layout/BottomNav.tsx
   — 5 вкладок: Today, Journal, + (modal trigger), Week, Me
   — активная вкладка подсвечивается акцентным цветом

7. frontend/src/components/layout/TopBar.tsx
   — заголовок страницы + кнопка dark/light toggle

8. frontend/src/components/layout/AppShell.tsx
   — TopBar + {children} + BottomNav
   — scroll только в области контента

9. frontend/src/app/router.tsx
   — все маршруты из screen-map.md
   — AuthGuard для приватных маршрутов

10. frontend/src/app/guards/AuthGuard.tsx
    — если нет токена → /login

11. frontend/src/app/guards/GuestGuard.tsx
    — если есть токен → /today

12. frontend/src/store/authStore.ts
    — Zustand: accessToken, isAuthenticated, setToken, clearToken

13. frontend/src/api/client.ts
    — Axios instance с baseURL из VITE_API_BASE_URL
    — interceptor: добавить Authorization header
    — interceptor: при 401 → попытка refresh → retry → clearToken + redirect /login

14. frontend/src/api/auth.ts
    — login(username, password) → { access_token, refresh_token }
    — logout()
    — refreshToken()

15. frontend/src/pages/auth/LoginPage.tsx
    — форма: username + password
    — React Hook Form + Zod валидация
    — inline error под полями
    — кнопка блокируется при запросе

16. frontend/src/pages/today/TodayPage.tsx
    — заглушка с текстом «Сегодня, [дата]» и кнопками быстрых действий
    — будет доработана в Фазе 3

17. frontend/package.json + tsconfig.json + frontend/Dockerfile

Smoke test: приложение запускается, форма логина работает, после логина редирект на /today.
```

---

## ПРОМПТ 3 — Фаза 3: Daily Check-in

Прикрепи: `implementation-pack.md`, `screen-map.md`, `user-flows.md`

```
Реализуй Фазу 3 проекта MyLifeBook: Daily Check-in.

Контекст: фундамент backend и frontend уже готов (Фазы 1–2).
Прикреплены implementation-pack.md, screen-map.md, user-flows.md.

Backend:
1. backend/app/models/daily_checkin.py — модель таблицы (все поля из ERD)
2. backend/app/schemas/daily_checkin.py — Pydantic схемы (Create, Update, Response)
3. backend/app/repositories/daily_repository.py — CRUD + get_by_date
4. backend/app/services/daily_service.py — бизнес-логика
5. backend/app/routers/daily_checkins.py — все endpoints
6. Alembic миграция для новой таблицы
7. Обновить backend/app/main.py: подключить роутер

Frontend:
8. frontend/src/types/daily.ts — TypeScript типы
9. frontend/src/api/daily.ts — запросы
10. frontend/src/pages/daily/DailyCheckinPage.tsx
    — шкалы 1–10 (mood, energy, anxiety, shame, loneliness, anger)
    — emotion tags (мультивыбор)
    — 4 текстовых поля
    — toggle «был триггер»
    — React Hook Form + Zod
    — draftStore интеграция (автосохранение каждые 1000ms)
11. frontend/src/pages/daily/DailyHistoryPage.tsx
    — список чекинов по дням
    — inline expand при клике
12. Обновить TodayPage:
    — показывать статус «день отмечен / не отмечен»
    — если отмечен: карточка со шкалами
    — если не отмечен: CTA [Отметить день]
```

---

## ПРОМПТ 4–6 — Шаблон для остальных фаз

```
Реализуй Фазу [N] проекта MyLifeBook: [название модуля].

Контекст: Фазы 1–[N-1] уже реализованы.
Прикреплены: implementation-pack.md, screen-map.md, user-flows.md.

Для этой фазы реализуй полностью (без заглушек):

Backend:
[список файлов из implementation-pack.md, раздел 7, соответствующей фазы]

Frontend:
[список файлов]

Требования:
- Все состояния: loading (skeleton), error (banner + retry), empty (с CTA)
- Формы: React Hook Form + Zod, inline errors, debounce autosave в draftStore
- После завершения покажи как проверить что всё работает
```

---

## ПРОМПТ 9 — AI Integration (отдельный, важный)

Прикрепи: `implementation-pack.md`, `ai-behavior.md`

```
Реализуй Фазу 9 проекта MyLifeBook: AI Integration через OpenRouter.

Контекст: Фазы 1–8 готовы. Прикреплены implementation-pack.md и ai-behavior.md.
AI ключ только в backend .env, никогда не уходит во frontend.

Backend:
1. backend/app/services/ai/openrouter_client.py
   — async httpx клиент к https://openrouter.ai/api/v1/chat/completions
   — retry при 429/503 (2 попытки, backoff)
   — timeout 30s
   — логирование в ai_logs таблицу

2. backend/app/services/ai/prompt_builder.py
   — build_reframe_prompt(personal_context, thought_record) → messages[]
   — build_weekly_summary_prompt(personal_context, week_data) → messages[]
   — build_profile_extraction_prompt(raw_text) → messages[]
   — обрезка данных при превышении лимита (приоритеты из ai-behavior.md)

3. backend/app/services/ai/reframing_service.py
   — async reframe(thought_record_id, user_id) → str
   — сохраняет результат в thought_record.ai_reframe

4. backend/app/services/ai/weekly_summary_service.py
   — async generate_summary(week_start, user_id) → str
   — сохраняет в weekly_review.ai_summary

5. backend/app/services/ai/profile_extractor.py
   — async extract_profile(raw_text) → PersonalContextSchema
   — парсит JSON из ответа AI

6. backend/app/models/ai_log.py — модель таблицы ai_logs
7. backend/app/routers/ai.py
   — POST /ai/reframe { thought_record_id }
   — POST /ai/weekly-summary { week_start }

8. Кризисная детекция в routers/ai.py:
   — перед отправкой в AI: проверка текста на триггерные фразы
   — если crisis: не отправлять в AI, вернуть специальный response с контактами
   — логировать crisis_flag=true в ai_logs

Frontend:
9. frontend/src/api/ai.ts — requestReframe(), requestWeeklySummary()
10. Шаг 12 в ThoughtRecordWizardPage — кнопка [Запросить у AI] + карточка с ответом
11. frontend/src/components/ai/AIReframeCard.tsx — отображение reframe (3 секции)
12. frontend/src/components/ai/AIWeeklySummaryCard.tsx — отображение summary (4 секции)
13. Обновить WeeklyReviewPage: кнопка [Получить AI summary]

Промпты используй строго из ai-behavior.md. Не изменяй их структуру.
```

---

## ПРОМПТ — Полный рефактор / code review

```
Проведи code review следующих файлов проекта MyLifeBook.

Контекст: прикреплён implementation-pack.md.

Проверь:
1. Соответствие стеку и архитектурным решениям из implementation-pack.md
2. Обработка всех состояний: loading, error, empty
3. Безопасность: нет ли AI ключа во frontend, нет ли plaintext паролей
4. Нет ли localStorage (запрещено — только Zustand in-memory)
5. Нет ли max-width на page-content
6. Все формы: React Hook Form + Zod, inline errors
7. Правильная обработка offline в draftStore

Файлы для проверки:
[вставь список файлов или прикрепи их]

По каждой проблеме: файл, строка, что не так, как исправить.
```

---

## Советы по работе с OpenRouter

### Выбор модели по задаче

| Задача | Модель | Почему |
|---|---|---|
| Архитектура, сложный код | `anthropic/claude-3.5-sonnet` | Лучшее качество рассуждений |
| Рутинные файлы (CRUD, типы) | `anthropic/claude-3.5-haiku` | Дёшево и быстро |
| Промпт 0 (читает ТЗ) | `anthropic/claude-3.5-sonnet` | Большой контекст |
| AI Integration (Фаза 9) | `anthropic/claude-3.5-sonnet` | Сложная логика |
| Frontend компоненты | `anthropic/claude-3.5-haiku` | Хватает |

### Как экономить токены

- Прикрепляй только нужные файлы, не все сразу
- Для CRUD-фаз (3–8) достаточно `implementation-pack.md` + нужный экран из `screen-map.md`
- Для AI-фазы обязательно прикрепляй `ai-behavior.md` — иначе промпты будут generic
- Если контекст накапливается → начинай новый чат с чистым промптом

### Если LLM сделал что-то не так

```
Стоп. В реализации есть проблема: [опиши].
Вот что должно быть согласно документации: [цитата из docs/].
Исправь только этот файл: [имя файла].
```

---

## Чеклист перед деплоем

- [ ] `.env` заполнен, не попал в git (есть в `.gitignore`)
- [ ] `robots.txt` содержит `Disallow: /`
- [ ] nginx добавляет `X-Robots-Tag: noindex, nofollow`
- [ ] OpenRouter API ключ только в backend `.env`
- [ ] Пароль пользователя — bcrypt hash в БД
- [ ] `data/lifebook.db` смонтирован как Docker volume
- [ ] Бэкап скрипт протестирован: `./infra/scripts/backup.sh`
- [ ] Приложение открывается с телефона, добавляется на home screen
- [ ] Dark mode работает корректно
- [ ] AI reframe возвращает ответ (тест с реальным ключом)
