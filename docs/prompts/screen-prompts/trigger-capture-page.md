# Screen Prompt — TriggerCapturePage + TriggerDetailPage

## Файлы
- `frontend/src/pages/triggers/TriggerCapturePage.tsx`
- `frontend/src/pages/triggers/TriggerDetailPage.tsx`

## Контекст
Быстрый захват триггерного эпизода. Открывается из + modal или TodayPage.
После сохранения — опционально переход в ThoughtRecord wizard с pre-fill.

## TriggerCapturePage — что реализовать

**Цель UX:** быстро, не перегружено. Минимум обязательных полей.

**Форма (React Hook Form + Zod):**

### Обязательное
- «Что произошло?» (textarea, autofocus)

### Опциональные
- «Первая мысль» (textarea)
- Emotion tags — мультивыбор из списка (как в DailyCheckin)
- Интенсивность эмоций: slider 0–10 (один общий)
- «Реакция в теле» (textarea, placeholder: «сжатие в груди, пустота...»)
- «Что хочется сделать прямо сейчас?» (textarea)
- «Какой старый закон включился?» (textarea + suggestions из personal_context.old_laws)
- Категория: выпадающий список (отношения, работа, одиночество, семья, самооценка, другое)

**Кнопки:**
- [Сохранить] — сохранить и вернуться назад
- [Сохранить и разобрать →] — сохранить и перейти в /thought-records/new?trigger_id=:id

**Suggestions для old_law:**
- Загрузить из GET /personal-context → поле old_laws
- Показать как pill-подсказки под полем, клик вставляет текст

## TriggerDetailPage — что реализовать

URL: `/triggers/:id`

**Отображение:**
- Все поля триггера (read-only)
- Дата и время создания
- Связанный ThoughtRecord: если есть linked_thought_record_id → карточка-ссылка на /thought-records/:id
- Если нет → кнопка [Разобрать эту мысль] → /thought-records/new?trigger_id=:id
- Кнопка [Редактировать] → та же форма в режиме edit
- Кнопка [Удалить] с подтверждением

## API
```
POST /api/v1/triggers              — создать
GET  /api/v1/triggers/:id          — детали
PUT  /api/v1/triggers/:id          — обновить
GET  /api/v1/personal-context      — для suggestions
```
