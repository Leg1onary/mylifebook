# Screen Map — MyLifeBook

## 1. Общая навигационная модель

Приложение использует **bottom navigation** (мобильная модель).
5 основных вкладок + дополнительные экраны через stack-навигацию.

```
Bottom Nav:
┌──────────────────────────────────────────────┐
│  Today  │  Journal  │  + (add)  │  Week  │  Me  │
└──────────────────────────────────────────────┘
```

- **Today** — главный экран дня
- **Journal** — лента всех записей
- **+ (add)** — центральная кнопка быстрого действия (modal-меню)
- **Week** — weekly review + insights
- **Me** — профиль, личный контекст, настройки

Экраны, которые не входят в bottom nav, открываются поверх (stack):
- LoginPage
- TriggerCapturePage
- ThoughtRecordWizardPage
- ExperimentDetailPage
- PersonalContextPage
- SettingsPage

---

## 2. Карта экранов

### AUTH

```
/login
└── LoginPage
    Поля: email/username, password
    После успеха → /today
    Нет регистрации (single-user)
```

---

### TODAY

```
/today
└── TodayPage
    Блоки:
    ├── Статус дня (check-in done / not done)
    ├── Карточка состояния (последний чекин, если есть)
    ├── Текущий фокус недели
    ├── Snippet активного старого закона (из weekly review)
    ├── Быстрые действия:
    │   ├── [Отметить день] → /daily/new
    │   ├── [Записать триггер] → /triggers/new
    │   ├── [Thought record] → /thought-records/new
    │   └── [SOS] → /sos (modal overlay)
    ├── AI reflection hint (если есть контекст)
    └── Mini streak / regularity indicator
```

---

### DAILY CHECK-IN

```
/daily/new
└── DailyCheckinPage (форма)
    Секции:
    ├── Шкалы 1–10: mood, energy, anxiety, shame, loneliness, anger
    ├── Emotion tags (мультивыбор)
    ├── Текстовые поля:
    │   ├── «Что сегодня было главным?»
    │   ├── «Что сейчас болит?»
    │   ├── «Что было опорой?»
    │   └── «Что мне сейчас нужно?»
    ├── Toggle: «Был триггер сегодня?»
    └── Кнопка сохранить → /today

/daily/history
└── DailyHistoryPage
    ├── Calendar heatmap (по mood)
    ├── Список чекинов по дням
    └── Клик на день → детальная карточка (inline expand)
```

---

### TRIGGER CAPTURE

```
/triggers/new
└── TriggerCapturePage (быстрая форма)
    Поля:
    ├── «Что произошло?» (textarea)
    ├── «Первая мысль» (textarea)
    ├── Emotion tags + интенсивность (0–10)
    ├── «Реакция в теле» (textarea, опционально)
    ├── «Что хочется сделать прямо сейчас?»
    ├── «Какой старый закон включился?» (text + suggestions)
    └── Кнопки:
        ├── [Сохранить и вернуться]
        └── [Сохранить и разобрать → ThoughtRecord]

/triggers/:id
└── TriggerDetailPage
    ├── Все поля триггера (read-only)
    ├── Связанный ThoughtRecord (если есть) или кнопка [Разобрать]
    └── Linked Experiment (если есть)
```

---

### SOS MODE

```
/sos  (modal overlay, открывается поверх любого экрана)
└── SOS flow (4 быстрых шага, по одному экрану)
    ├── Шаг 1: «Что случилось?» + «Что я сейчас думаю?»
    ├── Шаг 2: Эмоции 0–10 (быстрый слайдер)
    ├── Шаг 3: «Какой старый закон?» + стоп-фраза
    └── Шаг 4: Один grounding step + [Сохранить]
    После сохранения → предложение вернуться к full TR позже
```

---

### THOUGHT RECORD (WIZARD)

```
/thought-records/new
/thought-records/:id/edit
└── ThoughtRecordWizardPage
    Wizard: 12 шагов, по одному экрану, с прогресс-баром

    Шаг 1  — Ситуация: «Что произошло буквально?»
    Шаг 2  — Автоматическая мысль: «Что ударило первым?»
    Шаг 3  — Значение: «Что это значит "про меня"?»
    Шаг 4  — Эмоции: теги + интенсивность 0–10 (before)
    Шаг 5  — Тело: «Как это ощущалось физически?»
    Шаг 6  — Старый закон: текст + suggestions из профиля
    Шаг 7  — Доказательства за: «Что подтверждает мысль?»
    Шаг 8  — Доказательства против: «Что я сейчас игнорирую?»
    Шаг 9  — Искажения: мультивыбор из списка (катастрофизация и т.д.)
    Шаг 10 — Новый взгляд: «Какая формулировка честнее?»
    Шаг 11 — Новый шаг: «Что я сделаю иначе?»
    Шаг 12 — AI Reframe: запрос к AI (opt-in) → карточка с ответом

    В любой момент: [Сохранить черновик]
    После завершения → /thought-records/:id

/thought-records/:id
└── ThoughtRecordDetailPage
    ├── Все 12 шагов (read-only, collapsible)
    ├── AI Reframe карточка (если запрашивался)
    ├── Follow-up поле: «Что произошло позже?» + emotion after
    ├── Кнопка [Создать эксперимент на основе этого]
    └── Кнопка [Редактировать]

/thought-records/list
└── Список всех TR
    ├── Карточки: дата, ситуация (truncated), старый закон, статус
    ├── Фильтр: all / draft / complete / with-experiment
    └── Клик → /thought-records/:id
```

---

### JOURNAL (лента)

```
/journal
└── JournalPage
    ├── Лента всех записей (чекины + триггеры + TR + эксперименты + свободные заметки)
    ├── Фильтр по типу записи
    ├── Поиск по тексту
    └── Клик на запись → детальный экран соответствующего типа

/journal/notes/new
/journal/notes/:id
└── Free Note editor
    ├── Заголовок
    ├── Текст (markdown-lite)
    └── Теги
```

---

### EXPERIMENTS

```
/experiments
└── ExperimentsPage
    ├── Секция «Активные»: список экспериментов без результата
    ├── Секция «Завершённые»: список с outcome
    └── Кнопка [Новый эксперимент] (или через TR)

/experiments/new
/experiments/:id/edit
└── ExperimentForm
    Поля:
    ├── Старый закон
    ├── Чего я боюсь
    ├── Что попробую сделать иначе
    ├── Прогноз: что случится
    ├── Страх до (0–10)
    └── Запланировать дату

/experiments/:id
└── ExperimentDetailPage
    ├── Все поля (read-only)
    ├── Статус: запланирован / в процессе / завершён
    ├── Follow-up форма (если не заполнена):
    │   ├── Фактический результат
    │   ├── Что сбылось / не сбылось
    │   ├── Вывод
    │   └── Страх после (0–10)
    └── Связанный ThoughtRecord (если есть)
```

---

### WEEKLY REVIEW + INSIGHTS

```
/week
└── WeeklyReviewPage (текущая неделя по умолчанию)
    ├── Навигация по неделям (← →)
    ├── Секция метрик:
    │   ├── check-ins / triggers / TR / experiments count
    │   ├── Средние mood / anxiety / shame / loneliness
    │   └── Топ-3 триггерных категории
    ├── Секция паттернов:
    │   ├── Топ-3 старых закона
    │   └── Топ-3 автоматических мыслей
    ├── AI Weekly Summary (opt-in кнопка → карточка)
    ├── Guided questions (collapsible):
    │   └── 6 вопросов с textarea
    ├── Итоговый вывод недели (textarea)
    ├── Фокус следующей недели (textarea)
    └── [Сохранить обзор]

/insights
└── InsightsPage
    ├── Mood trend (линейный график, 30 дней)
    ├── Anxiety / Shame / Loneliness trend (30 дней)
    ├── Trigger category histogram
    ├── Old laws frequency bar chart
    ├── Experiments: completed vs active
    ├── Regularity / streak
    └── Переключатель периода: 7d / 30d / 90d
```

---

### PERSONAL CONTEXT & PROFILE

```
/profile/context
└── PersonalContextPage
    ├── Секция «Мой профиль»:
    │   ├── Extracted structured profile (read + edit)
    │   │   ├── Ключевые триггеры
    │   │   ├── Старые законы
    │   │   ├── Типичные искажения
    │   │   ├── Предпочтения в общении
    │   │   └── Цели роста
    │   └── Кнопка [Редактировать]
    ├── Секция «Загрузить контекст»:
    │   ├── Textarea для вставки raw text
    │   ├── Подсказка: «Можно вставить ответ из внешнего чата о себе»
    │   └── Кнопка [Извлечь и обновить профиль] → AI profile extraction
    └── Секция «AI статус»:
        ├── AI enabled / disabled toggle
        └── Что именно отправляется в AI (прозрачность)
```

---

### SETTINGS

```
/settings
└── SettingsPage
    ├── Секция «Внешний вид»: тема (dark/light/auto)
    ├── Секция «Напоминания»:
    │   ├── Morning check-in: время + toggle
    │   ├── Evening reflection: время + toggle
    │   ├── Weekly review: день недели + время + toggle
    │   └── Experiment follow-up: toggle
    ├── Секция «AI»:
    │   ├── AI enabled toggle
    │   └── OpenRouter model select (опционально)
    ├── Секция «Приватность»:
    │   ├── Change password
    │   └── Session timeout setting
    ├── Секция «Данные»:
    │   ├── Export: [PDF] [Markdown] [JSON]
    │   └── [Скачать бэкап БД]
    └── Секция «О приложении»: версия, описание
```

---

## 3. Навигационные связи

```
LoginPage
    └──► TodayPage (после auth)

TodayPage
    ├──► DailyCheckinPage (новый)
    ├──► TriggerCapturePage (новый)
    ├──► ThoughtRecordWizardPage (новый)
    └──► SOS (modal)

TriggerCapturePage
    └──► ThoughtRecordWizardPage (по желанию)

ThoughtRecordWizardPage
    └──► ThoughtRecordDetailPage (после сохранения)

ThoughtRecordDetailPage
    └──► ExperimentDetailPage (новый эксперимент)

ExperimentDetailPage
    └──► ThoughtRecordDetailPage (связанный TR)

WeeklyReviewPage
    └──► InsightsPage (link)

PersonalContextPage
    └── открывается из SettingsPage / из Me-таба

Bottom Nav:
    Today ◄──► Journal ◄──► (+ modal) ◄──► Week ◄──► Me
```

---

## 4. «+» Modal — быстрые действия

Центральная кнопка bottom nav открывает modal-sheet с выбором:

```
┌─────────────────────────────┐
│  Что хочешь зафиксировать?  │
│                             │
│  📅 Отметить день            │
│  ⚡ Записать триггер          │
│  🔍 Разобрать мысль (TR)     │
│  🧪 Новый эксперимент        │
│  📝 Свободная заметка        │
│  🚨 SOS — накрыло прямо сейчас│
└─────────────────────────────┘
```

---

## 5. Состояния и edge cases

| Экран | Empty state | Error state | Loading state |
|---|---|---|---|
| TodayPage | Приветственная карточка, CTA на первый чекин | Toast с ошибкой загрузки | Skeleton layout |
| JournalPage | «Пока нет записей» + CTA | Error banner | Skeleton list |
| ThoughtRecordWizardPage | — | Autosave failure notification | Inline spinner на AI шаге |
| WeeklyReviewPage | «Недостаточно данных за неделю» | Error banner | Skeleton |
| InsightsPage | «Нужно хотя бы 3 дня данных» | Error banner | Skeleton charts |
| PersonalContextPage | CTA «Загрузить личный контекст» | AI extraction error | Spinner |

---

## 6. Offline поведение

| Действие | Offline |
|---|---|
| Открыть TodayPage | Показывает кэшированные данные |
| Создать чекин / триггер / TR | Сохраняет в draftStore, sync при восстановлении |
| Запрос к AI | Показывает «AI недоступен без сети» |
| Открыть InsightsPage | Показывает кэшированные charts |
| Полная офлайн-страница | offline.html через PWA service worker |
