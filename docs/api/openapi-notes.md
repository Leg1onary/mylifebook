# OpenAPI Notes — MyLifeBook

> Заметки по API: форматы запросов/ответов, примеры, edge cases.
> Базовый URL: `https://mylifebook.ru/api/v1`
> Все защищённые endpoints требуют: `Authorization: Bearer <access_token>`

---

## Auth

### POST /auth/login

```json
// Request
{
  "username": "admin",
  "password": "yourpassword"
}

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}

// Response 401
{ "detail": "Invalid credentials" }
```

---

### POST /auth/refresh

```json
// Request
{
  "refresh_token": "eyJ..."
}

// Response 200
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}

// Response 401
{ "detail": "Refresh token expired or invalid" }
```

---

### POST /auth/logout

```json
// Request — Authorization header required
// Body: empty {}

// Response 200
{ "detail": "Logged out" }
```

---

## Today

### GET /today

Агрегированный snapshot для TodayPage. Не требует параметров.

```json
// Response 200
{
  "date": "2026-06-15",
  "checkin": {
    "id": 42,
    "mood": 7,
    "energy": 6,
    "anxiety": 4,
    "shame": 3,
    "loneliness": 5,
    "anger": 2,
    "emotion_tags": ["тревога", "усталость"],
    "note_main": "Важная встреча",
    "note_pain": null,
    "note_support": null,
    "note_need": "Тишина вечером",
    "had_trigger": false,
    "created_at": "2026-06-15T08:30:00Z"
  },
  "checkin_done": true,
  "active_experiments_count": 2,
  "unfinished_thought_records_count": 1,
  "current_week_focus": "Не подчиняться закону молчания в ответ на конфликт",
  "active_old_law": "Моя ценность = моя польза",
  "streak_days": 7
}

// Если чекин ещё не создан:
{
  "date": "2026-06-15",
  "checkin": null,
  "checkin_done": false,
  ...
}
```

---

## Daily Check-ins

### GET /daily-checkins

```
Query params:
  from: date (YYYY-MM-DD), default: 30 дней назад
  to:   date (YYYY-MM-DD), default: сегодня
  limit: int, default: 30, max: 365
```

```json
// Response 200
{
  "items": [
    {
      "id": 42,
      "date": "2026-06-15",
      "mood": 7,
      "energy": 6,
      "anxiety": 4,
      "shame": 3,
      "loneliness": 5,
      "anger": 2,
      "emotion_tags": ["тревога"],
      "note_main": "...",
      "note_pain": null,
      "note_support": null,
      "note_need": null,
      "had_trigger": false,
      "created_at": "2026-06-15T08:30:00Z",
      "updated_at": "2026-06-15T08:30:00Z"
    }
  ],
  "total": 1
}
```

---

### POST /daily-checkins

```json
// Request
{
  "date": "2026-06-15",
  "mood": 7,
  "energy": 6,
  "anxiety": 4,
  "shame": 3,
  "loneliness": 5,
  "anger": 2,
  "emotion_tags": ["тревога", "усталость"],
  "note_main": "Важная встреча",
  "note_pain": null,
  "note_support": "Разговор с другом",
  "note_need": "Тишина вечером",
  "had_trigger": false
}

// Response 201 — созданный объект (см. GET /daily-checkins)

// Response 409 — чекин за эту дату уже есть
{ "detail": "Check-in for 2026-06-15 already exists. Use PUT to update." }
```

**Edge cases:**
- Все поля кроме `date` — опциональны
- `date` уникально на пользователя (UNIQUE constraint)
- `mood`, `energy`, `anxiety`, `shame`, `loneliness`, `anger` — int 1–10
- `emotion_tags` — массив строк, допустимо пустой массив

---

### PUT /daily-checkins/:id

```json
// Request — только изменяемые поля (partial update)
{
  "note_pain": "Устал от молчания",
  "had_trigger": true
}

// Response 200 — обновлённый объект
// Response 404 — не найден
```

---

### GET /daily-checkins/:id

```json
// Response 200 — полный объект (см. выше)
// Response 404 — { "detail": "Not found" }
```

---

### DELETE /daily-checkins/:id

```json
// Response 204 — No Content
// Response 404 — { "detail": "Not found" }
```

---

## Triggers

### GET /triggers

```
Query params:
  from:     date
  to:       date
  category: string (фильтр по категории)
  limit:    int, default: 50
  offset:   int, default: 0
```

```json
// Response 200
{
  "items": [
    {
      "id": 10,
      "created_at": "2026-06-15T14:00:00Z",
      "situation": "Не ответили на сообщение три часа",
      "auto_thought": "Я им не важен",
      "emotion_tags": ["тревога", "стыд"],
      "emotion_intensity": 8,
      "body_response": "Сжатие в груди",
      "impulse": "Написать снова и извиниться",
      "old_law": "Моя ценность = моя польза",
      "category": "отношения",
      "linked_thought_record_id": null
    }
  ],
  "total": 1
}
```

---

### POST /triggers

```json
// Request
{
  "situation": "Не ответили на сообщение три часа",
  "auto_thought": "Я им не важен",
  "emotion_tags": ["тревога", "стыд"],
  "emotion_intensity": 8,
  "body_response": "Сжатие в груди",
  "impulse": "Написать снова и извиниться",
  "old_law": "Моя ценность = моя польза",
  "category": "отношения"
}

// Response 201 — созданный объект
```

**Edge cases:**
- Обязательные поля: `situation`
- Все остальные — опциональны
- `emotion_intensity`: int 0–10
- `category`: свободная строка, без enum ограничения

---

### PUT /triggers/:id

```json
// Partial update — любые поля
// linked_thought_record_id может быть установлен здесь или автоматически сервисом
```

---

## Thought Records

### GET /thought-records

```
Query params:
  from:   date
  to:     date
  status: "draft" | "complete" | "all" (default: "all")
  limit:  int, default: 30
```

```json
// Response 200
{
  "items": [
    {
      "id": 5,
      "created_at": "2026-06-14T20:00:00Z",
      "updated_at": "2026-06-14T21:30:00Z",
      "status": "complete",
      "situation": "Не ответили на сообщение",
      "auto_thought": "Я им не важен",
      "meaning": "Значит я бесполезен",
      "emotions": [{"tag": "стыд", "intensity": 8}],
      "body_response": "Сжатие в груди",
      "old_law": "Моя ценность = моя польза",
      "evidence_for": "Пауза была долгой",
      "evidence_against": "Обычно отвечают, человек мог быть занят",
      "distortions": ["чтение мыслей", "катастрофизация"],
      "new_perspective": "Пауза — это не отвержение",
      "new_action": "Не писать повторно, подождать",
      "ai_reframe": "Старый закон сработал...",
      "followup_text": "Ответили через час, всё нормально",
      "followup_emotion_after": [{"tag": "облегчение", "intensity": 6}],
      "linked_trigger_id": 10
    }
  ],
  "total": 1
}
```

---

### POST /thought-records

```json
// Request — создание или черновик (status: "draft" | "complete")
{
  "status": "draft",
  "situation": "Не ответили на сообщение",
  "auto_thought": "Я им не важен",
  "linked_trigger_id": 10
  // остальные поля опциональны для черновика
}

// Полный complete request включает все 11 полей шагов
// ai_reframe заполняется отдельно через /ai/reframe

// Response 201 — созданный объект
```

**Edge cases:**
- `status: "draft"` — обязательны только `situation` или `auto_thought`
- `status: "complete"` — рекомендуются все поля, но не enforced
- `distortions`: массив строк из фиксированного списка (но backend не валидирует enum)
- `emotions`: `[{"tag": "string", "intensity": 0-10}]`

---

### PUT /thought-records/:id

```json
// Partial update. Используется для:
// — пошагового сохранения wizard (каждый шаг PUT с новым полем)
// — добавления followup после завершения
// — смены status draft → complete

{
  "evidence_against": "Человек мог быть занят",
  "status": "complete"
}
```

---

## Experiments

### GET /experiments

```
Query params:
  status: "planned" | "active" | "complete" | "all" (default: "all")
```

```json
// Response 200
{
  "items": [
    {
      "id": 3,
      "created_at": "2026-06-14T21:30:00Z",
      "updated_at": "2026-06-15T10:00:00Z",
      "status": "complete",
      "old_law": "Моя ценность = моя польза",
      "fear_description": "Подумают что я бесполезен",
      "action_plan": "Попросить о помощи первым",
      "forecast": "Откажут или осудят",
      "fear_before": 8,
      "planned_date": "2026-06-15",
      "result": "Помогли без вопросов",
      "what_worked": "Оказалось, просьба воспринята нормально",
      "what_didnt": "Ожидание отказа не сбылось",
      "conclusion": "Просить помощь не делает меня слабым",
      "fear_after": 3,
      "linked_thought_record_id": 5
    }
  ],
  "total": 1
}
```

---

### POST /experiments

```json
// Request
{
  "old_law": "Моя ценность = моя польза",
  "fear_description": "Подумают что я бесполезен",
  "action_plan": "Попросить о помощи первым",
  "forecast": "Откажут или осудят",
  "fear_before": 8,
  "planned_date": "2026-06-15",
  "linked_thought_record_id": 5
}
// Response 201
```

---

### PUT /experiments/:id — follow-up

```json
{
  "status": "complete",
  "result": "Помогли без вопросов",
  "what_worked": "Просьба воспринята нормально",
  "what_didnt": "Ожидание отказа не сбылось",
  "conclusion": "Просить помощь не делает меня слабым",
  "fear_after": 3
}
```

---

## Weekly Reviews

### GET /weekly-reviews

```
Query params:
  limit: int, default: 10
```

```json
// Response 200
{
  "items": [
    {
      "id": 8,
      "week_start": "2026-06-09",
      "week_end": "2026-06-15",
      "checkins_count": 6,
      "triggers_count": 4,
      "tr_count": 2,
      "experiments_count": 1,
      "avg_mood": 6.2,
      "avg_anxiety": 5.1,
      "avg_shame": 3.8,
      "avg_loneliness": 4.5,
      "top_old_laws": [
        {"law": "Моя ценность = моя польза", "count": 3}
      ],
      "top_trigger_categories": [
        {"category": "отношения", "count": 3},
        {"category": "работа", "count": 1}
      ],
      "ai_summary": "На этой неделе...",
      "guided_q1": "Встреча в среду давила сильнее всего",
      "guided_q2": null,
      "guided_q3": null,
      "guided_q4": null,
      "guided_q5": null,
      "guided_q6": null,
      "conclusion": "Неделя была напряжённой, но...",
      "next_week_focus": "Попробовать просить помощи",
      "created_at": "2026-06-15T19:00:00Z",
      "updated_at": "2026-06-15T20:00:00Z"
    }
  ],
  "total": 1
}
```

---

### POST /weekly-reviews

```json
// Request — создать или обновить обзор за неделю
// Если обзор за week_start уже есть — обновить (upsert)
{
  "week_start": "2026-06-09",
  "guided_q1": "Встреча в среду давила сильнее всего",
  "conclusion": "Неделя была напряжённой",
  "next_week_focus": "Попробовать просить помощи"
}
// Числовые агрегаты (avg_mood и т.д.) сервис считает сам из данных недели
// Response 200 или 201 — полный объект
```

---

## Insights

### GET /insights

```
Query params:
  period: "7d" | "30d" | "90d" (default: "30d")
```

```json
// Response 200
{
  "period": "30d",
  "from": "2026-05-16",
  "to": "2026-06-15",
  "mood_trend": [
    {"date": "2026-05-16", "value": 5},
    {"date": "2026-05-17", "value": 7}
  ],
  "anxiety_trend": [...],
  "shame_trend": [...],
  "loneliness_trend": [...],
  "trigger_categories": [
    {"category": "отношения", "count": 12},
    {"category": "одиночество", "count": 7}
  ],
  "old_laws_frequency": [
    {"law": "Моя ценность = моя польза", "count": 18},
    {"law": "Если я слабый — меня бросят", "count": 5}
  ],
  "checkins_streak": 7,
  "checkins_total": 24,
  "triggers_total": 19,
  "tr_total": 8,
  "experiments_completed": 3,
  "experiments_active": 2
}
```

---

## Personal Context

### GET /personal-context

```json
// Response 200
{
  "id": 1,
  "triggers": [
    "Долгое молчание в переписке",
    "Отказ в просьбе"
  ],
  "old_laws": [
    "Моя ценность = моя польза",
    "Если я слабый — меня бросят"
  ],
  "typical_distortions": [
    "Чтение мыслей",
    "Катастрофизация",
    "Персонализация"
  ],
  "communication_prefs": "Предпочитает прямую обратную связь без смягчений",
  "growth_goals": [
    "Разорвать связь ценности и полезности",
    "Научиться просить помощи"
  ],
  "context_notes": "...",
  "updated_at": "2026-06-10T12:00:00Z"
}

// Если профиль не заполнен:
// Response 200 со всеми полями null
```

---

### PUT /personal-context

```json
// Request — partial update любых полей
{
  "old_laws": [
    "Моя ценность = моя польза",
    "Если я слабый — меня бросят",
    "Новый закон"
  ]
}
// Response 200 — обновлённый объект
```

---

### POST /personal-context/extract

```json
// Request
{
  "raw_text": "Длинный текст о себе из внешнего чата...",
  "merge": false
}
// merge: false — заменить профиль; true — объединить с текущим

// Response 200 — извлечённый профиль (структура как в GET)

// Response 503 — AI недоступен
{ "detail": "AI service unavailable. Try again or fill profile manually." }
```

---

## AI

### POST /ai/reframe

```json
// Request
{
  "thought_record_id": 5
}

// Response 200
{
  "reframe": "1. Что я вижу: Старый закон сработал...\n2. Альтернативный взгляд: ...\n3. На вынос: ...",
  "saved": true
}

// Response 400 — TR не найден или не complete
{ "detail": "Thought record not found or not complete" }

// Response 451 — кризисный контент обнаружен
{
  "crisis": true,
  "detail": "Обнаружены признаки кризисного состояния.",
  "resources": {
    "hotline": "8-800-2000-122",
    "text": "Пожалуйста, поговори с живым человеком прямо сейчас."
  }
}

// Response 503 — AI недоступен
{ "detail": "AI service unavailable" }
```

---

### POST /ai/weekly-summary

```json
// Request
{
  "week_start": "2026-06-09"
}

// Response 200
{
  "summary": "1. Картина недели: ...\n2. Паттерн: ...\n3. Знаки прогресса: ...\n4. Вопрос: ...",
  "saved": true
}

// Response 404 — нет данных за неделю
{ "detail": "No data found for this week" }
```

---

## Exports

### GET /exports/pdf

```
Query params:
  from: date (YYYY-MM-DD)
  to:   date (YYYY-MM-DD)

Response: application/pdf
Content-Disposition: attachment; filename="mylifebook-2026-06-09_2026-06-15.pdf"
```

---

### GET /exports/markdown

```
Response: text/markdown
Content-Disposition: attachment; filename="mylifebook-export.md"
```

---

### GET /exports/json

```json
// Response: application/json — полный dump за период
{
  "exported_at": "2026-06-15T20:00:00Z",
  "period": { "from": "2026-06-09", "to": "2026-06-15" },
  "checkins": [...],
  "triggers": [...],
  "thought_records": [...],
  "experiments": [...],
  "weekly_reviews": [...]
}
```

---

## Settings

### GET /settings

```json
// Response 200
{
  "theme": "dark",
  "ai_enabled": true,
  "openrouter_model": "anthropic/claude-3.5-haiku",
  "reminders": {
    "morning": { "enabled": true, "time": "08:00" },
    "evening": { "enabled": false, "time": "21:00" },
    "weekly":  { "enabled": true, "time": "19:00", "weekday": "sunday" },
    "experiment_followup": { "enabled": true }
  }
}
```

---

### PUT /settings

```json
// Partial update
{
  "ai_enabled": false,
  "reminders": {
    "morning": { "enabled": true, "time": "09:00" }
  }
}
// Response 200 — обновлённый объект
```

---

## Общие соглашения

### Формат дат
- Даты: `YYYY-MM-DD` (без времени)
- Timestamps: ISO 8601 UTC (`2026-06-15T14:00:00Z`)

### Пагинация
- `limit` + `offset` для списков
- Ответ всегда: `{ "items": [...], "total": N }`

### Ошибки
```json
// Все ошибки
{ "detail": "Human-readable описание" }

// Ошибки валидации (422)
{
  "detail": [
    {
      "loc": ["body", "mood"],
      "msg": "ensure this value is between 1 and 10",
      "type": "value_error"
    }
  ]
}
```

### HTTP статусы
| Код | Когда |
|---|---|
| 200 | Успешный GET, PUT |
| 201 | Успешный POST (создание) |
| 204 | Успешный DELETE |
| 400 | Неверный запрос (логическая ошибка) |
| 401 | Нет токена или токен невалиден |
| 404 | Объект не найден |
| 409 | Конфликт (уникальность) |
| 422 | Ошибка валидации Pydantic |
| 451 | Кризисный контент |
| 503 | AI сервис недоступен |
