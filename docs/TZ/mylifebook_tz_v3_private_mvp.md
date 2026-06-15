# Техническое задание: MyLifeBook v3

## 1. Главная цель проекта

**MyLifeBook** создаётся не как обычный дневник, не как mood tracker и не как массовый wellness-продукт. Его главная цель — **помочь одному конкретному пользователю сломать разрушительную внутреннюю систему**, по которой он живёт.

Под «системой» понимается набор глубинных автоматических законов, которые управляют:
- самооценкой;
- интерпретацией событий;
- реакциями в отношениях;
- выбором поведения под страхом, стыдом, виной и чувством ненужности.

Приложение должно быть не просто местом для записи мыслей, а **личным инструментом перепрошивки**, который помогает замечать, как включается старый внутренний закон, разбирать его, спорить с ним фактами, проверять новым действием и накапливать реальные доказательства против него. Именно structured thought records, self-monitoring и behavioral experiments применяются в CBT/self-help подходах для выявления и ослабления автоматических паттернов мышления и поведения [cite:33][cite:91][cite:100][cite:115].

Self-monitoring само по себе полезно, но более структурированные интервенции обычно сильнее помогают изменению, чем простое пассивное наблюдение за собой [cite:93][cite:96][cite:99][cite:102]. Поэтому продукт должен не только собирать записи, но и **вести пользователя к изменению реакции**.

---

## 2. Формат MVP

На текущем этапе продукт создаётся как **private single-user MVP**.

Это значит:
- пользователь один;
- продукт делается под конкретного человека;
- вход только по логину/паролю;
- любая индексация запрещена;
- legal/массовая B2C-обвязка пока не является обязательной;
- AI-функции не выносятся в post-MVP, а входят в MVP как важная часть продукта.

Продукт сейчас — это **личный закрытый инструмент**, а не публичный сервис.

---

## 3. Product vision

MyLifeBook — это personal privacy-first PWA на домене **mylifebook.ru**, которое помогает:
- ловить триггерные эпизоды в моменте;
- видеть автоматические мысли;
- распознавать глубинные старые законы;
- проходить guided thought work;
- формулировать альтернативный взгляд;
- проводить поведенческие эксперименты;
- видеть weekly synthesis;
- использовать AI как контекстного помощника между сессиями, разговорами и реальной жизнью.

Это ближе к therapy companion / CBT companion app, чем к дневнику настроения [cite:64][cite:106][cite:112].

---

## 4. Что именно должен делать продукт

Продукт должен помогать пользователю не просто понять, что ему плохо, а делать следующее:

1. **Поймать момент**, когда активировалась старая схема.
2. **Назвать её**, а не растворяться в эмоции.
3. **Разобрать мысль**, которая запустила реакцию.
4. **Увидеть старый закон** под этой мыслью.
5. **Проверить закон фактами**, а не принимать его как истину.
6. **Сформулировать новый, более честный взгляд**.
7. **Сделать новый шаг в поведении**.
8. **Вернуться позже и проверить**, что реально произошло.
9. **Увидеть на дистанции**, как часто старая система включается и где она уже слабеет.

---

## 5. Core promise

Главное обещание продукта:

> Ты не просто будешь выговариваться. Ты начнёшь замечать, какой внутренний закон тобой управляет, и постепенно собирать доказательства против него.

---

## 6. Что продуктом не является

MyLifeBook не должен превращаться в:
- обычный дневник заметок;
- generic mood tracker;
- positive affirmations app;
- привычкотрекер с эмоциями;
- wellness-cringe интерфейс;
- публичную платформу для всех;
- бесконечный AI-чат без структуры и памяти.

---

## 7. Core mechanics

### 7.1 Guided capture

Пользователь должен уметь быстро зафиксировать:
- что произошло;
- что он подумал;
- что почувствовал;
- насколько сильно его накрыло;
- какой старый закон мог включиться.

### 7.2 Guided analysis

Приложение должно вести пользователя по структуре thought record:
- событие;
- автоматическая мысль;
- значение мысли;
- эмоции;
- телесная реакция;
- старый закон;
- доказательства за;
- доказательства против;
- искажения;
- новая мысль;
- новый шаг.

Thought records считаются одним из базовых структурированных CBT-инструментов именно потому, что помогают распознать и переосмыслить автоматические мысли [cite:33][cite:91][cite:100].

### 7.3 Behavioral experiment

Каждый важный разбор должен по возможности завершаться проверкой жизнью:
- что я сделаю иначе;
- чего я боюсь;
- что, как мне кажется, случится;
- что случилось реально.

Поведенческие эксперименты применяются как способ проверить устойчивые убеждения через опыт и действие [cite:43][cite:45][cite:115].

### 7.4 Weekly synthesis

Продукт должен не просто рисовать графики, а регулярно возвращать пользователя к смыслу:
- какой старый закон включался чаще всего;
- где получилось не подчиниться ему;
- что оказалось менее страшным, чем ожидалось;
- какой новый паттерн начинает появляться.

### 7.5 AI personal reflection layer

AI в приложении — не декоративная фича. Он нужен как дополнительный слой:
- для персонального рефрейминга;
- для weekly summary;
- для contextual prompts;
- для удержания связности между записями.

---

## 8. Архитектурная модель продукта

На текущем этапе это:
- **single-user**;
- **auth-first**;
- **private-first**;
- **AI-assisted**;
- **mobile-first**.

Архитектура может быть упрощена под одного пользователя, но должна оставлять возможность дальнейшего расширения в multi-user продукт в будущем.

---

## 9. Безопасность и приватность

Так как продукт содержит чувствительные личные данные, приватность является обязательным требованием [cite:59][cite:63][cite:71][cite:73].

### 9.1 Доступ

- Весь сайт закрыт логином/паролем.
- Главная страница тоже закрыта.
- Публичного контента нет или он минимален.
- Контент приложения доступен только после аутентификации.

### 9.2 Антииндексация

Нужно применить несколько уровней защиты от индексации:
- `robots.txt` с `Disallow: /`;
- meta robots `noindex, nofollow`;
- HTTP header `X-Robots-Tag: noindex, nofollow`;
- отсутствие sitemap для приватной части.

Для блокировки индексации корректнее использовать именно `noindex` и/или `X-Robots-Tag`, а не полагаться только на `robots.txt` [cite:134][cite:136][cite:141][cite:148].

### 9.3 Дополнительные требования

- HTTPS only;
- secure cookies;
- session expiration;
- rate limit на login endpoint;
- безопасное хранение секретов;
- возможность manual export и manual delete.

### 9.4 Privacy для AI-слоя

AI-функции работают через OpenRouter. Так как туда могут уходить чувствительные данные, нужно явно предусмотреть:
- opt-in для AI-функций;
- отдельное объяснение, что часть данных отправляется внешнему AI-провайдеру;
- возможность отключить AI;
- возможность удалить personal context profile;
- прозрачный data flow для AI-операций.

В AI journaling и personalized LLM workflows основной риск связан именно с чувствительностью контекста и тем, как он передаётся внешним сервисам [cite:119][cite:121][cite:124][cite:128].

---

## 10. AI слой — обязательная часть MVP

На этом этапе AI-функции **не относятся к post-MVP**. Они входят в MVP, потому что пользователь один, а главная задача — практическая польза для него.

### 10.1 AI-assisted reframing

AI должен уметь:
- анализировать thought record;
- предлагать персонализированный reframe;
- показывать, какой старый закон мог активироваться;
- помогать отделять факт от старого приговора;
- подсказывать возможный новый шаг.

### 10.2 AI weekly summary

AI должен уметь:
- анализировать записи недели;
- выделять повторяющиеся темы;
- описывать, какие старые законы чаще включались;
- подсвечивать прогресс;
- формулировать вопросы на следующую неделю.

AI journaling / therapy companion продукты часто делают упор именно на персонализированные prompts, summaries и reflection support [cite:120][cite:123][cite:129][cite:132].

### 10.3 AI prompt style

AI внутри приложения должен говорить:
- спокойно;
- конкретно;
- без мотивационной приторности;
- без инфантильного тона;
- без ложной психотерапевтической «воды»;
- уважительно, но по делу.

---

## 11. Personal Context Profile

Одна из ключевых фич MVP.

### 11.1 Назначение

OpenRouter-модель сама по себе не знает пользователя так, как знает история глубокого диалога. Поэтому приложение должно позволять загрузить **личный психологический профиль / self-context**, чтобы AI лучше понимал:
- типичные триггеры;
- старые законы;
- слепые зоны;
- уязвимые темы;
- preferred communication style;
- что помогает, а что раздражает.

Персонализация ответов на основе пользовательского контекста реально повышает релевантность и качество взаимодействия [cite:127][cite:130].

### 11.2 Источники профиля

Пользователь может:
- вставить свой текст вручную;
- вставить ответ из внешнего чата;
- загрузить markdown/txt с self-summary;
- позже — редактировать этот профиль в настройках.

### 11.3 Как это должно работать

1. Пользователь вставляет контекст о себе.
2. Система сохраняет исходный текст.
3. Дополнительно создаётся структурированная версия профиля.
4. Пользователь видит и может отредактировать extracted profile.
5. AI использует этот профиль при рефрейминге и summary.

### 11.4 Структура профиля

Внутренний structured profile должен содержать:
- key triggers;
- old laws / core beliefs;
- repeated distortions;
- vulnerable themes;
- communication preferences;
- growth goals;
- helpful reframes;
- avoid-patterns in wording.

---

## 12. Основные разделы приложения

1. Today
2. Daily Check-in
3. Trigger Capture
4. Thought Record
5. Behavioral Experiments
6. Free Journal
7. Weekly Review
8. Insights
9. Personal Context Profile
10. Settings

---

## 13. Экран Today

Главный экран должен отвечать на вопрос:

> Что со мной сейчас происходит и какой следующий шаг мне сделать?

Содержимое:
- дата;
- статус сегодняшнего check-in;
- карточка текущего состояния;
- быстрые действия:
  - отметить день;
  - записать триггер;
  - начать thought record;
  - открыть SOS;
- current focus of the week;
- snippet старого закона недели;
- mini AI reflection / AI reminder (опционально);
- краткий progress indicator.

---

## 14. Daily Check-in

Цель — ежедневный короткий контакт с собой.

Поля:
- mood 1–10;
- energy 1–10;
- anxiety 1–10;
- shame 1–10;
- loneliness 1–10;
- anger 1–10;
- emotion tags;
- «что сегодня было главным?»;
- «что сейчас болит?»;
- «что было опорой?»;
- «что мне сейчас нужно?»;
- был ли trigger event.

Многие journaling/mood apps используют короткие daily reflection flows, потому что они уменьшают friction ежедневного использования [cite:48][cite:50][cite:57][cite:60].

---

## 15. Trigger Capture

Это быстрый экран для момента, когда пользователя резко накрыло.

Поля:
- что произошло;
- первая мысль;
- эмоции и сила;
- реакция в теле;
- что хочется сделать прямо сейчас;
- какой старый закон включился;
- quick note.

Результат:
- запись сохраняется как отдельный trigger event;
- позже на её основе можно открыть полный thought record.

---

## 16. Thought Record

Это центральный продуктовый flow.

Форма должна быть **пошаговой**, а не одной гигантской простынёй.

### Шаги

1. Ситуация — что произошло буквально.  
2. Первая мысль — что ударило первым.  
3. Значение — что это значит «про меня» по версии тревоги/стыда.  
4. Эмоции — что я чувствую и насколько сильно.  
5. Старый закон — какой внутренний приговор включился.  
6. Факты за — что вроде бы подтверждает мысль.  
7. Факты против — что я сейчас игнорирую.  
8. Искажения — какие перекосы мышления здесь есть.  
9. Новый взгляд — какая формулировка честнее и устойчивее.  
10. Новый шаг — что я сделаю иначе.  
11. AI reframe — дополнительный персональный разбор.  
12. Follow-up — что произошло позже.

### Принципы UX

- один вопрос на шаг;
- возможность сохранять черновик;
- возможность вернуться позже;
- примеры формулировок;
- не перегружать экран;
- мягкий, но структурирующий тон.

---

## 17. Behavioral Experiments

Назначение — перевести новый взгляд в действие.

Поля:
- старый закон;
- чего я боюсь;
- что я попробую сделать иначе;
- прогноз;
- уровень страха до;
- дата;
- фактический результат;
- что сбылось;
- что не сбылось;
- новый вывод;
- уровень страха после.

---

## 18. Free Journal

Нужен как свободный слой, но не должен становиться центром продукта.

Поля:
- title;
- body;
- tags;
- link to trigger/thought record.

---

## 19. Weekly Review

Это обязательная часть ядра, а не nice-to-have.

### Автоматические метрики
- количество daily check-ins;
- количество trigger events;
- количество thought records;
- количество experiments;
- среднее настроение;
- средняя тревога;
- средний стыд;
- среднее одиночество;
- топ эмоций;
- топ триггеров;
- топ старых законов;
- сколько раз пользователь выбрал новый шаг.

### Guided review questions
- Где неделя ударила сильнее всего?
- Какой старый закон включался чаще всего?
- Где ты подчинился ему автоматически?
- Где получилось не подчиниться?
- Что оказалось не таким страшным, как ожидалось?
- Что стоит проверить на следующей неделе?

### AI weekly summary

AI на основе записей и personal context profile формирует:
- summary недели;
- повторяющиеся themes;
- dominant old laws;
- signs of progress;
- suggested focus for next week.

---

## 20. Insights

Базовая аналитика в MVP:
- mood trend;
- anxiety/shame/loneliness trend;
- trigger category histogram;
- most repeated old laws;
- most repeated automatic thoughts;
- regularity / streak.

Важно: insights не должны жить отдельно от weekly reflection. Их задача — усиливать смысл, а не просто визуализировать цифры.

---

## 21. SOS-режим

Ultra-fast flow для тяжёлого момента.

Шаги:
- что случилось;
- что я сейчас думаю;
- какие эмоции 0–10;
- какой старый закон включился;
- одна стоп-фраза;
- один grounding step;
- сохранить;
- предложить вернуться позже к full thought record.

---

## 22. Data model

### 22.1 User
- id
- email
- password_hash
- display_name
- timezone
- theme
- ai_enabled
- created_at
- updated_at

### 22.2 PersonalContextProfile
- id
- user_id
- raw_text
- extracted_json
- active_flag
- created_at
- updated_at

### 22.3 DailyCheckin
- id
- user_id
- date
- mood_score
- energy_score
- anxiety_score
- shame_score
- loneliness_score
- anger_score
- summary_text
- pain_text
- support_text
- need_text
- trigger_happened
- created_at
- updated_at

### 22.4 EmotionTag
- id
- user_id
- name
- color
- system_flag

### 22.5 DailyCheckinEmotion
- id
- checkin_id
- emotion_id

### 22.6 TriggerCategory
- id
- user_id
- name
- system_flag

### 22.7 TriggerEvent
- id
- user_id
- happened_at
- situation_text
- first_thought_text
- body_reaction_text
- action_urge_text
- old_law_text
- intensity_score
- category_id
- created_at
- updated_at

### 22.8 ThoughtRecord
- id
- user_id
- trigger_event_id
- happened_at
- situation_text
- automatic_thought_text
- meaning_text
- fear_text
- old_law_text
- body_reaction_text
- action_taken_text
- evidence_for_text
- evidence_against_text
- ignored_facts_text
- balanced_thought_text
- new_action_text
- follow_up_text
- emotion_before_score
- emotion_after_score
- created_at
- updated_at

### 22.9 ThoughtRecordEmotion
- id
- thought_record_id
- emotion_id
- intensity_score

### 22.10 CognitiveDistortion
- id
- code
- name
- description

### 22.11 ThoughtRecordDistortion
- id
- thought_record_id
- distortion_id

### 22.12 Experiment
- id
- user_id
- thought_record_id
- old_law_text
- fear_text
- experiment_action_text
- prediction_text
- fear_before_score
- scheduled_for
- completed_at
- actual_result_text
- came_true_text
- did_not_come_true_text
- learning_text
- fear_after_score
- status
- created_at
- updated_at

### 22.13 WeeklyReview
- id
- user_id
- week_start
- week_end
- summary_text
- pattern_text
- learning_text
- next_focus_text
- ai_summary_text
- created_at
- updated_at

### 22.14 Reminder
- id
- user_id
- type
- time_local
- enabled

### 22.15 AIInteractionLog
- id
- user_id
- type
- input_payload_json
- output_text
- created_at

---

## 23. Технологический стек

### Frontend
- React
- TypeScript
- Vite
- PWA plugin
- Zustand
- React Hook Form
- Zod
- Recharts
- Tailwind CSS или своя лёгкая design system

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy / SQLModel
- Alembic
- Background jobs для summary/export
- OpenRouter integration

### Infra
- Docker Compose
- VPS deploy
- Nginx
- HTTPS / Let’s Encrypt
- backup strategy
- basic monitoring

## 23.5 Структура проекта

Проект организован как монорепо в одном каталоге `mylifebook/`.
Единый репозиторий содержит frontend, backend и все сопроводительные материалы.

### Корневой уровень

| Путь | Назначение |
|---|---|
| `README.md` | Описание проекта, инструкции по старту и деплою |
| `.env.example` | Шаблон переменных окружения без секретов |
| `.gitignore` | Исключения для git: .env, data/, node_modules/, __pycache__ |
| `docker-compose.yml` | Сборка и запуск всего стека: backend, nginx |
| `Makefile` | Алиасы команд: make dev, make build, make deploy, make backup |

---

### infra/ — инфраструктура и деплой

| Путь | Назначение |
|---|---|
| `infra/nginx/mylifebook.conf` | Конфиг nginx: proxy к backend, HTTPS, noindex headers |
| `infra/scripts/backup.sh` | Скрипт бэкапа SQLite: копирует data/lifebook.db с датой |
| `infra/scripts/restore.sh` | Скрипт восстановления из бэкапа |
| `infra/scripts/deploy.sh` | Деплой на VPS: git pull → build → restart |
| `infra/traefik/labels.example.txt` | Пример labels для Traefik под домен mylifebook.ru |

---

### data/ — постоянное хранилище

| Путь | Назначение |
|---|---|
| `data/lifebook.db` | SQLite БД. Монтируется как Docker volume, не теряется при пересборке |
| `data/backups/` | Папка для хранения бэкапов БД |

---

### docs/ — документация и промпты

| Путь | Назначение |
|---|---|
| `docs/TZ/mylifebook_tz_v3_private_mvp.md` | Основное ТЗ (этот документ) |
| `docs/api/openapi-notes.md` | Заметки по API endpoints, форматам запросов |
| `docs/prompts/implementation-pack.md` | Пакет для LLM-реализатора: общий контекст, стек, правила |
| `docs/prompts/openrouter-master-prompt.md` | Master prompt для OpenRouter/Perplexity Computer |
| `docs/prompts/screen-prompts/` | Промпты под каждый экран/модуль отдельно |
| `docs/product/user-flows.md` | User flows по ключевым сценариям |
| `docs/product/screen-map.md` | Карта экранов и навигации |
| `docs/product/ai-behavior.md` | Правила поведения AI: тон, ограничения, prompt-стратегии |

---

### backend/ — FastAPI сервер

#### backend/app/ — ядро приложения

| Путь | Назначение |
|---|---|
| `main.py` | Точка входа FastAPI: регистрация роутеров, middleware, CORS, static |
| `config.py` | Настройки из .env: DATABASE_URL, OPENROUTER_API_KEY, SECRET_KEY |
| `database.py` | SQLAlchemy engine, session, Base — инициализация SQLite |
| `deps.py` | FastAPI dependencies: get_db, get_current_user |

#### backend/app/security/

| Файл | Назначение |
|---|---|
| `auth.py` | JWT создание и верификация токенов |
| `passwords.py` | Хэширование и проверка пароля (bcrypt) |
| `session.py` | Управление сессиями, refresh token логика |

#### backend/app/models/

SQLAlchemy ORM-модели. Каждый файл = одна таблица.

| Файл | Таблица / Назначение |
|---|---|
| `user.py` | Пользователь: логин, хэш пароля, настройки |
| `daily_checkin.py` | Ежедневный чекин: mood, energy, тревога, стыд, текстовые поля |
| `trigger_event.py` | Триггерный эпизод: ситуация, первая мысль, старый закон |
| `thought_record.py` | Полный thought record: все 12 шагов разбора |
| `experiment.py` | Поведенческий эксперимент: прогноз, результат, вывод |
| `weekly_review.py` | Итог недели: паттерны, AI summary, фокус |
| `personal_context.py` | Личный профиль пользователя для AI-персонализации |
| `reminder.py` | Напоминания: тип, время, enabled |
| `ai_log.py` | Лог AI-запросов: тип, инпут, аутпут |

#### backend/app/schemas/

Pydantic-схемы для валидации request/response. Структура зеркалит models/.

#### backend/app/routers/

FastAPI роутеры. Каждый файл = один смысловой блок API.

| Файл | Endpoints |
|---|---|
| `auth.py` | POST /auth/login, POST /auth/logout, POST /auth/refresh |
| `today.py` | GET /today — агрегированные данные для главного экрана |
| `daily_checkins.py` | CRUD для ежедневных чекинов |
| `triggers.py` | CRUD для триггерных эпизодов |
| `thought_records.py` | CRUD для thought records, включая draft-логику |
| `experiments.py` | CRUD для поведенческих экспериментов |
| `weekly_reviews.py` | CRUD + генерация weekly review |
| `insights.py` | GET /insights — агрегированная аналитика |
| `personal_context.py` | GET/PUT личного профиля, POST для загрузки raw text |
| `ai.py` | POST /ai/reframe, POST /ai/weekly-summary |
| `exports.py` | GET /exports/pdf, GET /exports/markdown, GET /exports/json |
| `settings.py` | GET/PUT пользовательских настроек и напоминаний |

#### backend/app/services/

Бизнес-логика, вынесенная из роутеров.

| Файл | Назначение |
|---|---|
| `daily_service.py` | Логика сохранения, обновления и агрегации чекинов |
| `trigger_service.py` | Создание триггеров, linkage к thought records |
| `thought_record_service.py` | Шаговая логика wizard, сохранение черновиков |
| `experiment_service.py` | Создание, follow-up, закрытие экспериментов |
| `weekly_review_service.py` | Агрегация данных недели, guided questions, итог |
| `insight_service.py` | Расчёт всех метрик аналитики |
| `export_service.py` | Генерация PDF/Markdown/JSON пакетов |

#### backend/app/services/ai/

| Файл | Назначение |
|---|---|
| `openrouter_client.py` | HTTP-клиент к OpenRouter API: запросы, retry, error handling |
| `prompt_builder.py` | Сборка промптов: personal context + запись + инструкция |
| `profile_extractor.py` | Извлечение структурированного профиля из raw text |
| `reframing_service.py` | AI-assisted reframe для thought record |
| `weekly_summary_service.py` | AI-генерация weekly summary по данным недели |

#### backend/app/repositories/

Слой работы с БД. Изолируют SQL-запросы от бизнес-логики.

#### backend/app/utils/

| Файл | Назначение |
|---|---|
| `dates.py` | Работа с датами, timezone, week bounds |
| `enums.py` | Перечисления: типы эмоций, искажений, статусы экспериментов |
| `text.py` | Sanitize, truncate, strip helper-функции |
| `audit.py` | Audit logging helper |

#### backend/migrations/

Alembic-миграции SQLite. `versions/` — папка с файлами миграций.

#### backend/tests/

Pytest-тесты по модулям. Один файл = один роутер.

---

### frontend/ — React PWA

#### frontend/public/ — статика и PWA-конфиг

| Файл | Назначение |
|---|---|
| `manifest.webmanifest` | PWA: название, иконки, display mode, theme color |
| `robots.txt` | `Disallow: /` — запрет индексации всего сайта |
| `offline.html` | Страница-заглушка при отсутствии сети |
| `favicon.svg` | Иконка приложения в SVG |
| `icon-192.png` / `icon-512.png` | PWA иконки для home screen install |

#### frontend/src/app/ — инициализация приложения

| Файл | Назначение |
|---|---|
| `App.tsx` | Корневой компонент: providers, router outlet |
| `router.tsx` | React Router v6: маршруты, layout-обёртки |
| `providers.tsx` | Обёртка: QueryClient, ThemeProvider, AuthProvider |
| `guards/AuthGuard.tsx` | Защита приватных роутов: редирект на /login если нет токена |
| `guards/GuestGuard.tsx` | Редирект на /today если пользователь уже залогинен |

#### frontend/src/pages/ — страницы приложения

Каждая папка = один раздел навигации.

| Страница | Назначение |
|---|---|
| `auth/LoginPage.tsx` | Экран авторизации: форма логин + пароль |
| `today/TodayPage.tsx` | Главный экран: статус дня, быстрые действия, фокус недели |
| `daily/DailyCheckinPage.tsx` | Форма ежедневного чекина |
| `daily/DailyHistoryPage.tsx` | История чекинов: список, фильтрация |
| `triggers/TriggerCapturePage.tsx` | Быстрый захват триггера: короткая форма |
| `triggers/TriggerDetailPage.tsx` | Детальная карточка триггера + кнопка открыть TR |
| `thought-records/ThoughtRecordWizardPage.tsx` | Пошаговый wizard: 12 шагов thought record |
| `thought-records/ThoughtRecordDetailPage.tsx` | Просмотр завершённого thought record |
| `experiments/ExperimentsPage.tsx` | Список экспериментов: активные и завершённые |
| `experiments/ExperimentDetailPage.tsx` | Детали эксперимента + форма follow-up |
| `weekly/WeeklyReviewPage.tsx` | Экран недельного обзора: метрики + вопросы + AI summary |
| `insights/InsightsPage.tsx` | Аналитика: графики, паттерны, streak |
| `journal/JournalPage.tsx` | Свободный дневник: список и редактор |
| `profile/PersonalContextPage.tsx` | Личный контекст для AI: загрузка, просмотр, редактура |
| `settings/SettingsPage.tsx` | Настройки: тема, напоминания, AI, privacy |
| `system/NotFoundPage.tsx` | 404 |
| `system/OfflinePage.tsx` | Экран при потере соединения |

#### frontend/src/components/ — переиспользуемые компоненты

| Папка | Содержимое |
|---|---|
| `layout/` | AppShell, TopBar, BottomNav, Page — скелет интерфейса |
| `ai/` | AIReframeCard, AIWeeklySummaryCard, PersonalContextHint |
| `forms/` | Переиспользуемые инпуты, слайдеры, тег-пикеры |
| `ui/` | Кнопки, карточки, бейджи, модалки, скелетоны |
| `today/`, `daily/`, `triggers/` и т.д. | Компоненты, специфичные для каждого раздела |

#### frontend/src/features/ — feature-слайсы

Каждая папка — изолированная фича со своим state, hooks, утилитами.
Не содержит UI-компонентов — только логику.

#### frontend/src/api/ — HTTP-клиент

| Файл | Назначение |
|---|---|
| `client.ts` | Axios instance: baseURL, interceptors, auth headers, refresh |
| `auth.ts` | login(), logout(), refreshToken() |
| `daily.ts` | Запросы к /daily-checkins |
| `triggers.ts` | Запросы к /triggers |
| `thoughtRecords.ts` | Запросы к /thought-records |
| `experiments.ts` | Запросы к /experiments |
| `weekly.ts` | Запросы к /weekly-reviews |
| `insights.ts` | Запросы к /insights |
| `personalContext.ts` | Запросы к /personal-context |
| `ai.ts` | Запросы к /ai/reframe и /ai/weekly-summary |
| `settings.ts` | Запросы к /settings |

#### frontend/src/store/ — глобальный стейт (Zustand)

| Файл | Назначение |
|---|---|
| `authStore.ts` | Токен, статус авторизации |
| `appStore.ts` | Данные текущего дня, кэш Today |
| `draftStore.ts` | Черновики: незаконченные thought records и чекины |
| `uiStore.ts` | Тема, sidebar-состояние, модалки |

#### frontend/src/hooks/

| Файл | Назначение |
|---|---|
| `useAuth.ts` | Авторизация: login, logout, isAuthenticated |
| `useTheme.ts` | Переключение тёмной/светлой темы |
| `useDraft.ts` | Сохранение и восстановление черновика |
| `useOfflineStatus.ts` | Определение offline-статуса для UI |

#### frontend/src/types/ — TypeScript типы

Зеркалят backend schemas. Один файл = один смысловой домен.

#### frontend/src/styles/

| Файл | Назначение |
|---|---|
| `globals.css` | Reset, base.css, шрифты |
| `tokens.css` | CSS custom properties: цвета, отступы, типографика |
| `theme.css` | Light / dark mode переменные |

#### frontend/src/lib/

| Файл | Назначение |
|---|---|
| `dates.ts` | Форматирование дат, работа с неделями |
| `charts.ts` | Конфиги для Recharts |
| `validators.ts` | Zod-схемы для форм |
| `constants.ts` | Константы: типы эмоций, категории триггеров, дефолты |

---

### future/ — задел под будущие модули mylifebook.ru

| Папка | Планируемое содержимое |
|---|---|
| `future/debt/` | Трекер долгов (уже есть MVP) |
| `future/car/` | Сводка по машине |
| `future/notes/` | Психологические заметки |
| `future/shared-shell/` | Мастер-дашборд, который объединит все модули |

---

## 24. Этапы реализации MVP

### Phase 1
- auth-first skeleton;
- noindex/privacy setup;
- PWA shell;
- daily check-in;
- trigger capture;
- thought record flow.

### Phase 2
- experiments;
- weekly review;
- insights basic;
- export.

### Phase 3
- OpenRouter integration;
- personal context profile;
- AI-assisted reframing;
- AI weekly summary.

Если нужно максимально строго придерживаться текущего решения владельца продукта, то Phase 3 может входить в тот же MVP-релиз, а не считаться post-MVP.

---

## 25. Что критично не потерять

Исполнитель должен понимать следующее:
- это не generic journaling app;
- продукт создаётся под одну главную цель: помочь владельцу ломать внутреннюю систему;
- AI — важная часть практической пользы, а не украшение;
- thought record и experiments — ядро, а не второстепенные функции;
- privacy и auth обязательны с первого дня;
- приложение должно вести к **новому действию**, а не только к тексту.

---

## 26. Итог

**MyLifeBook v3** — это private single-user AI-assisted PWA для одного пользователя, которому нужен не цифровой дневник, а рабочее пространство для распознавания, разбора и постепенного слома своей разрушительной внутренней системы. Основа продукта — guided capture, thought records, behavioral experiments, weekly synthesis, personal context profile и AI-assisted reframing [cite:33][cite:43][cite:91][cite:115].

Продукт должен стать не просто «местом, где хранятся мысли», а **инструментом, который помогает пользователю замечать, где он снова живёт по старому закону, и делать новый выбор** [cite:93][cite:96][cite:99][cite:102].
EOF && grep -n "## 24\. Этапы реализации MVP" -A20 output/mylifebook_tz_v3_private_mvp.md | head -n 30
