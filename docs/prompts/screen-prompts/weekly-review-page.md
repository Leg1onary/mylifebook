# Screen Prompt — WeeklyReviewPage + InsightsPage

## Файлы
- `frontend/src/pages/weekly/WeeklyReviewPage.tsx`
- `frontend/src/pages/insights/InsightsPage.tsx`

## Контекст
Weekly Review — главный ритуал раз в неделю.
Insights — аналитика паттернов за период.
Оба доступны из [Week] таба в bottom nav.

## WeeklyReviewPage — что реализовать

URL: `/week`

**Навигация по неделям:**
- Стрелки ← → для переключения
- Заголовок: «9–15 июня 2026»
- По умолчанию: текущая (или последняя) неделя

**Блок 1 — Метрики (auto, read-only):**
- Карточки: чекинов N, триггеров N, TR N, экспериментов N
- Средние шкалы: mood, anxiety, shame, loneliness (bar или number)
- Топ-3 категории триггеров (pill tags с count)
- Топ-3 старых закона (список с count)

**Блок 2 — AI Summary (opt-in):**
- Кнопка [Получить AI summary недели]
- Loading: skeleton с текстом «AI анализирует неделю...»
- Ответ: 4 секции из ai-behavior.md (Картина / Паттерн / Прогресс / Вопрос)
- Если мало данных (< 3 чекинов): предупреждение, но кнопка всё равно доступна

**Блок 3 — Guided questions (6 вопросов, collapsible):**
1. «Где неделя ударила сильнее всего?»
2. «Какой старый закон включался чаще?»
3. «Где получилось не подчиниться ему?»
4. «Что оказалось не таким страшным?»
5. «Что хочу проверить на следующей неделе?»
6. «Мой итог этой недели одной фразой»
- Все поля: textarea, опциональны

**Блок 4 — Итог:**
- «Фокус следующей недели» (textarea)
- Кнопка [Сохранить обзор]

**Прошлые недели:** все блоки read-only, guided questions — collapsible

**Переход:** ссылка [Смотреть аналитику →] на InsightsPage

## InsightsPage — что реализовать

URL: `/insights`

**Переключатель периода:** 7д / 30д / 90д (tab-switcher вверху)

**Блоки (все с skeleton при загрузке):**

1. **Mood trend** — линейный график (Recharts LineChart)
   - X: дата, Y: 1–10, только mood
   - Tooltip с датой и значением

2. **Тревога / Стыд / Одиночество** — три линии на одном графике
   - Разные цвета, легенда

3. **Trigger categories** — горизонтальный BarChart
   - По клику на категорию → фильтрованный список триггеров (modal или navigate)

4. **Старые законы** — вертикальный список с count badges
   - По клику → список связанных TR

5. **Эксперименты** — двойной bar: активные vs завершённые

6. **Streak** — число дней подряд + простая dot-calendar за 30 дней

## API
```
GET /api/v1/weekly-reviews          — список
POST /api/v1/weekly-reviews         — upsert
GET /api/v1/insights?period=30d     — аналитика
POST /api/v1/ai/weekly-summary      — { week_start }
```
