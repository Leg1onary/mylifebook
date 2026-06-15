# Screen Prompt — ThoughtRecordWizardPage

## Файлы
- `frontend/src/pages/thought-records/ThoughtRecordWizardPage.tsx`
- `frontend/src/pages/thought-records/ThoughtRecordDetailPage.tsx`

## Контекст
Центральный и самый важный экран приложения.
12 шагов — каждый на отдельном view внутри одного компонента (не отдельные роуты).
Открывается из + modal, TriggerDetailPage или TodayPage.
Если передан `?trigger_id=N` — поля 1, 2, 4, 6 pre-filled из триггера.

## ThoughtRecordWizardPage — что реализовать

**Структура:**
- Один компонент с internal state: `currentStep: 0..11`
- Прогресс-бар: «Шаг N из 12»
- Название текущего шага
- Кнопки [← Назад] [Далее →] (на шаге 12 — [Завершить])
- Кнопка [Сохранить черновик] всегда видна

**Автосохранение черновика:**
- draftStore.setDraft('thought-record', allStepsData) при каждом onNext
- Если открыт с тем же trigger_id и есть черновик → восстановить

**Шаги:**

| № | Заголовок | Тип поля |
|---|---|---|
| 1 | Ситуация | textarea «Что произошло буквально?» |
| 2 | Автоматическая мысль | textarea «Что ударило первым?» |
| 3 | Значение | textarea «Что это значит про меня?» |
| 4 | Эмоции | emotion tags мультивыбор + intensity 0–10 для каждой |
| 5 | Тело | textarea «Как это ощущалось физически?» |
| 6 | Старый закон | textarea + suggestions из personal_context.old_laws |
| 7 | Доказательства за | textarea «Что подтверждает эту мысль?» |
| 8 | Доказательства против | textarea «Что я сейчас игнорирую?» |
| 9 | Искажения | мультивыбор из списка (ниже) |
| 10 | Новый взгляд | textarea «Какая формулировка честнее?» |
| 11 | Новый шаг | textarea «Что сделаю иначе?» |
| 12 | AI Reframe | кнопка [Запросить у AI] + карточка ответа |

**Список искажений (шаг 9):**
Чтение мыслей, Катастрофизация, Персонализация, Чёрно-белое мышление,
Обесценивание позитивного, Эмоциональное рассуждение, Долженствование,
Навешивание ярлыков, Сверхобобщение, Фильтрация негатива

**Шаг 12 — AI Reframe:**
- Кнопка [Запросить у AI] (opt-in, не автоматически)
- Во время запроса: skeleton карточка с текстом «AI анализирует...»
- Ответ приходит в виде трёх секций (из ai-behavior.md):
  1. Что я вижу
  2. Альтернативный взгляд
  3. На вынос
- Если AI недоступен: «AI сейчас недоступен. Можно завершить без него.»
- Кнопка [Попробовать снова]

**После [Завершить]:**
- POST /api/v1/thought-records (status: complete)
- navigate('/thought-records/:id')

## ThoughtRecordDetailPage — что реализовать

URL: `/thought-records/:id`

**Отображение:**
- Все 12 шагов — collapsible секции (по умолчанию свёрнуты, кроме summary)
- AI Reframe карточка (если есть)
- Follow-up блок внизу: textarea «Что произошло позже?» + emotion after + кнопка [Сохранить follow-up]
- Кнопка [Создать эксперимент на основе этого] — pre-fills old_law + new_action
- Кнопка [Редактировать] → wizard в режиме edit
- Связанный триггер: ссылка на /triggers/:id (если есть)

## API
```
POST /api/v1/thought-records        — создать (черновик или complete)
PUT  /api/v1/thought-records/:id    — обновить шаг или follow-up
GET  /api/v1/thought-records/:id    — детали
POST /api/v1/ai/reframe             — { thought_record_id }
GET  /api/v1/personal-context       — для suggestions
```
