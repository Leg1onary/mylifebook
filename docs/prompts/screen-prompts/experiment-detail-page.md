# Screen Prompt — ExperimentsPage + ExperimentDetailPage

## Файлы
- `frontend/src/pages/experiments/ExperimentsPage.tsx`
- `frontend/src/pages/experiments/ExperimentDetailPage.tsx`

## Контекст
Поведенческие эксперименты — инструмент для реального проверки старых законов.
Создаются из ThoughtRecordDetailPage или напрямую через + modal.
Имеют жизненный цикл: planned → active → complete.

## ExperimentsPage — что реализовать

URL: `/experiments`

**Layout:**
- Секция «Активные» (status: planned | active) — список карточек
- Секция «Завершённые» (status: complete) — список карточек (collapsible)
- Кнопка [+ Новый эксперимент] вверху

**Карточка эксперимента (в списке):**
- Старый закон (truncated)
- Что попробую: action_plan (truncated)
- Дата планируемая (если есть)
- Fear badge: fear_before (для активных)
- Для завершённых: fear_before → fear_after + outcome snippet

**Пустой стейт:**
«Экспериментов пока нет. Создай первый после разбора мысли.» + CTA [Новый эксперимент]

## ExperimentDetailPage — что реализовать

URL: `/experiments/:id`, `/experiments/new`, `/experiments/:id/edit`

**Форма создания/редактирования:**
- «Старый закон» (textarea + suggestions из personal_context)
- «Чего я боюсь» (textarea)
- «Что попробую сделать иначе» (textarea)
- «Прогноз: что случится» (textarea)
- «Страх до» (slider 0–10)
- «Запланировать дату» (date picker, опционально)

**Режим просмотра (status: complete или active):**
Левая колонка — что планировал:
- Старый закон, план действий, прогноз, страх до

Правая колонка / блок follow-up:
- Если follow-up не заполнен → форма follow-up:
  - «Что реально произошло?» (textarea)
  - «Что сбылось из прогноза?» (textarea)
  - «Что не сбылось?» (textarea)
  - «Чему это учит?» (textarea)
  - «Страх после» (slider 0–10)
  - Кнопка [Завершить эксперимент]
- Если follow-up заполнен → read-only + сравнение страх до/после (визуально)

**Связи:**
- Если `linked_thought_record_id` → ссылка на ThoughtRecord
- Кнопка [Удалить] с подтверждением

## API
```
GET  /api/v1/experiments           — список
POST /api/v1/experiments           — создать
GET  /api/v1/experiments/:id       — детали
PUT  /api/v1/experiments/:id       — обновить / follow-up
DELETE /api/v1/experiments/:id     — удалить
```
