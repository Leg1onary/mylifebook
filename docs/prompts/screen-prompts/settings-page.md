# Screen Prompt — SettingsPage

## Файл
`frontend/src/pages/settings/SettingsPage.tsx`

## Контекст
Настройки приложения. Доступен из [Me] таба в bottom nav.
Содержит: тема, напоминания, AI, приватность, данные, о приложении.

## Что реализовать

**Layout:** список секций с разделителями. Нет табов — просто вертикальный scroll.

---

### Секция «Внешний вид»
- Toggle: Тёмная тема / Светлая тема / Системная (radio или segmented control)
- Сохраняется в uiStore + PUT /settings

---

### Секция «Напоминания»

Каждое напоминание — строка с toggle (enabled) и настройкой времени (при enabled: true):

- **Утренний чекин**
  - Toggle + time picker (08:00 по умолчанию)
- **Вечерняя рефлексия**
  - Toggle + time picker (21:00 по умолчанию)
- **Еженедельный обзор**
  - Toggle + day picker (воскресенье) + time picker (19:00)
- **Follow-up экспериментов**
  - Toggle без времени (отправляется в день planned_date)

Реализация: браузерный Notifications API (requestPermission при первом включении).
Если разрешение отклонено → показать инструкцию как включить вручную.

---

### Секция «AI»

- Toggle: AI включён / выключен
- Select: модель OpenRouter (если ai_enabled)
  - Варианты: anthropic/claude-3.5-haiku (быстро), anthropic/claude-3.5-sonnet (качественно)
- Подсказка: «AI анализирует твои записи и профиль. Ключ API хранится только на сервере.»

---

### Секция «Приватность»

- [Изменить пароль] → modal с формой: текущий пароль + новый + подтверждение
- «Время сессии» — select: 15 мин / 1 час / 8 часов / Не выходить

---

### Секция «Данные»

**Экспорт:**
- Выбор периода: эта неделя / прошлая неделя / последние 30 дней / произвольный (date range picker)
- Три кнопки: [Скачать PDF] [Скачать Markdown] [Скачать JSON]
- При клике → GET /exports/:format?from=...&to=...

**Бэкап:**
- [Скачать резервную копию БД] → GET /exports/json (full, без дат)

---

### Секция «О приложении»

- Название: MyLifeBook
- Версия: v1.0.0
- Домен: mylifebook.ru
- Кнопка [Выйти из аккаунта] (красный цвет) → POST /auth/logout → clearToken → /login

---

## Состояния
- loading: skeleton секций
- error при сохранении: inline toast «Не удалось сохранить»
- Все изменения сохраняются при изменении (onChange) с debounce 800ms, кроме пароля

## API
```
GET /api/v1/settings
PUT /api/v1/settings
POST /api/v1/auth/logout
GET /api/v1/exports/pdf
GET /api/v1/exports/markdown
GET /api/v1/exports/json
```
