# MakeYourChoiceIU — Состояние проекта

## Стек

| Слой | Технология |
|---|---|
| Backend | Django 4.2, Django REST Framework 3.14, django-filter, django-cors-headers |
| База данных | PostgreSQL 15 |
| Frontend | React 18, TypeScript, Vite, React Router DOM 6, Axios, react-markdown |
| Деплой | Docker Compose (3 сервиса: backend, frontend, db) |

---

## Запуск

```bash
cp .env.example .env
# отредактируй .env при необходимости
docker-compose build
docker-compose up
docker-compose exec backend python manage.py migrate
```

| Сервис | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

### Переменные окружения (`.env`)

| Переменная | Назначение |
|---|---|
| `DB_NAME` | Имя базы данных |
| `DB_USER` | Пользователь PostgreSQL |
| `DB_PASSWORD` | Пароль PostgreSQL |
| `DB_HOST` | Хост БД (по умолчанию `db`) |
| `DB_PORT` | Порт БД (по умолчанию `5432`) |
| `DEBUG` | `True` / `False` |
| `ALLOWED_HOSTS` | Список хостов через запятую |
| `SECRET_KEY` | Django SECRET_KEY |

---

## Структура репозитория

```
MakeYourChoiceIU/
├── backend/
│   ├── core/          # Django settings, urls, wsgi/asgi
│   ├── catalog/       # Элективы, программы, треки, типы, исключения
│   ├── login/         # Студенты, администраторы, авторизация
│   ├── iteration/     # Итерации, потоки, привязка элективов к потокам
│   ├── voting/        # История выборов студентов
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/       # HTTP-клиенты к бэкенду
│       ├── components/ # UI-компоненты
│       ├── hooks/     # React-хуки (логика страниц)
│       ├── pages/     # Страницы приложения
│       ├── types/     # TypeScript-типы
│       └── utils/     # Утилиты
├── docs/
│   ├── api.yaml           # OpenAPI 3.0 спецификация
│   └── PROJECT_STATE.md   # Этот файл
├── docker-compose.yml
└── .env.example
```

---

## Backend

### База данных — модели

#### `catalog`

| Модель | Поля | Описание |
|---|---|---|
| `ProgramLanguage` | `language` (PK, str) | Язык программы: ENG, RUS |
| `Degree` | `degree_year` (PK, str) | Год/степень: B1–B4, M1–M2 |
| `ElectiveType` | `elective_type_name` (PK, str) | Тип электива: Core, Minor и т.д. |
| `Elective` | `id`, `name`, `instructor`, `description`, `elective_type` (FK), `program_language` (FK), `elective_language`, `status`, `degree_year` (M2M), `prerequisite` | Электив. `status`: 1=активный, 0=архив, -1=удалён |
| `Program` | `id`, `name`, `language` (FK) | Программа обучения |
| `Track` | `id`, `name`, `program` (FK, CASCADE) | Трек внутри программы |
| `ElectiveTrackException` | `elective` (FK), `track` (FK), `created_at` | Электив недоступен студентам данного трека |

#### `login`

| Модель | Поля | Описание |
|---|---|---|
| `Admin` | `id`, `mail`, `role` | role: 0=admin, 1=admin-student |
| `Student` | `id`, `mail`, `degree_year` (FK), `program` (FK), `track` (FK, nullable) | Студент |

#### `iteration`

| Модель | Поля | Описание |
|---|---|---|
| `Stream` | `id`, `degree_year` (FK), `program_lang` (FK), `elective_type` (FK), `programs` (M2M), `priorities` | Поток итерации. `priorities` — сколько элективов нужно выбрать |
| `Iteration` | `id`, `year`, `season`, `streams` (M2M), `deadline` | Итерация голосования |
| `StreamElectiveRelation` | `stream_id` (FK), `elective_id` (FK) | Какие элективы доступны в потоке |

#### `voting`

| Модель | Поля | Описание |
|---|---|---|
| `History` | `iteration` (FK), `student` (FK), `elective_type` (FK), `priority`, `elective` (FK), `date` | Запись о выборе студента. Перевыбор = новые записи с новой датой |

---

### API — эндпоинты

Все пути начинаются с `/api/`. Полная спецификация — в `docs/api.yaml`.

#### Авторизация

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/auth/email?email=...` | Получить профиль по email |

**Логика:** сначала ищет в `Admin`, потом в `Student`. Если найден в обоих — роль `admin-student`.  
Возвращает разные структуры в зависимости от роли (см. `api.yaml`).  
Для студента — строит список доступных элективов из активных итераций и потоков, фильтруя по degree_year и program студента. Также возвращает уже сделанные выборы (по последней дате в `History`).

#### Элективы

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/electives/` | Список (фильтры: status, elective_type, program_language, search) |
| `POST` | `/api/electives/` | Создать |
| `GET` | `/api/electives/{id}/` | Один электив |
| `PATCH` | `/api/electives/{id}/` | Обновить (в т.ч. архивировать/удалить через status) |
| `POST` | `/api/electives/{id}/archive/` | Архивировать (status → 0) |

**Важно:** DELETE-метода нет — мягкое удаление через `PATCH status=-1`.

#### Типы элективов

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/elective_types/` | Список |
| `POST` | `/api/elective_types/` | Создать |
| `DELETE` | `/api/elective_types/{name}/` | Удалить (защита: нельзя если есть элективы) |

#### Программы

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/programs/` | Список |
| `POST` | `/api/programs/` | Создать |
| `PATCH` | `/api/programs/{id}/` | Обновить |
| `DELETE` | `/api/programs/{id}/` | Удалить |

#### Треки

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/tracks/` | Список |
| `POST` | `/api/tracks/` | Создать |
| `PATCH` | `/api/tracks/{id}/` | Обновить |
| `DELETE` | `/api/tracks/{id}/` | Удалить (защита: нельзя если есть студенты) |

#### Настройки (сводные)

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/settings/` | Языки → программы → треки + все типы элективов |

Поле `elective_type_settings` в ответе — заглушка, всегда пустой массив.

#### Исключения

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/exceptions` | Все исключения + все треки + активные элективы без исключений |
| `POST` | `/api/exceptions` | Создать исключение |
| `PATCH` | `/api/exceptions/{id}` | Обновить |
| `DELETE` | `/api/exceptions/{id}` | Удалить |

**Внимание:** URL без trailing slash (`/api/exceptions` без `/`).

#### Потоки (Streams)

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/streams/` | Список |
| `POST` | `/api/streams/` | Создать |
| `PATCH` | `/api/streams/{id}/` | Обновить |
| `DELETE` | `/api/streams/{id}/` | Удалить |
| `GET` | `/api/streams/{id}/elective/` | Элективы потока |
| `POST` | `/api/streams/{id}/elective/` | Добавить элективы в поток (тело: `{electiveIds: []}`) |
| `DELETE` | `/api/streams/{id}/elective/{electiveId}/` | Удалить электив из потока |

#### Голосование

| Метод | URL | Описание |
|---|---|---|
| `POST` | `/api/me/submissions` | Подать заявку |

Тело запроса: `{student_id, iteration_id, elective_type, electives: [{priority, elective_id}]}`.  
Логика: проверяет что элективы активны и входят в разрешённые потоки итерации для студента. Перезапись заявки — через дату (новые записи с тем же ключом).  
**Проверка дедлайна отключена** (закомментировано в коде).

---

### Что не реализовано в бэкенде

- Нет эндпоинтов для управления `Iteration` (создание, редактирование, удаление) — только через Django Admin
- `elective_type_settings` в `/api/settings/` — заглушка, всегда пустой массив
- Нет эндпоинта выгрузки Excel для семестра (фронт вызывает `/semesters/excel/{id}`, эндпоинт не существует)
- Проверка дедлайна при голосовании отключена
- Нет аутентификации на эндпоинтах — любой может вызвать любой API
- Нет пагинации на списочных эндпоинтах
- `CSRF_TRUSTED_ORIGINS` прописан только для `localhost:5173` (Vite dev), не для Docker порта `3000`

---

## Frontend

### Технологии

- **React 18** + **TypeScript**
- **React Router DOM 6** — роутинг
- **Vite** — сборка и dev-сервер (порт 5173 в dev, проксируется в Docker на 3000)
- **react-markdown** — рендер Markdown в карточках элективов
- CSS Modules — стили

### Роутинг

```
/                → редирект на /admin/electives или /login
/login           → LoginPage
/admin/electives → AdminElectivesPage      (только admin / admin-student)
/admin/program-settings → AdminProgramSettingsPage
/admin/exceptions       → AdminExceptionsPage
/admin/semester-management → AdminSemesterManagementPage
/student         → StudentElectivesPage    (только student / admin-student в student-режиме)
/logout          → LogoutRoute
*                → редирект на /
```

Авторизованный `admin-student` может переключаться между режимами через кнопку в хедере.

### Авторизация

- `useAuth` хук — главное хранилище сессии
- Сессия сохраняется в `localStorage` (ключ `myc-auth-session`)
- Вся логика ролей: при логине смотрит role из ответа, выставляет `effectiveMode` (`admin` или `student`)
- Есть мок для тестирования студенческого режима: email `mock.student@example.com` не ходит на бэк, использует `mocks/studentAuthMock.ts`

### API-слой (`frontend/src/api/`)

| Файл | Что делает |
|---|---|
| `auth.ts` | `loginByEmail` → `GET /api/auth/email`, маппинг ответа |
| `electives.ts` | CRUD элективов, маппинг DTO → модель |
| `adminSettings.ts` | Programs, Tracks, ElectiveTypes, Streams, Settings, Excel-download |
| `studentVoting.ts` | `submitStudentElectives` → `POST /api/me/submissions` |

Все запросы используют `credentials: 'include'` и CSRF-токен из cookie (`utils/csrf.ts` читает `csrftoken` cookie).

### Страницы

#### `LoginPage`
- Email-only авторизация (без пароля)
- Отправляет email на бэк, получает профиль
- Поддержка мок-студента

#### `AdminElectivesPage`
- Список всех элективов (активные + архив + удалённые)
- Переключение вид: список / сетка
- Фильтры через сайдбар: тип, статус, язык программы
- Поиск с подсветкой совпадений
- Модалка просмотра электива (Markdown description)
- Модалка создания/редактирования электива
- Действия: создать, редактировать, архивировать, восстановить, удалить (soft)
- Состояние элективов хранится в `useAuth` (через `authResponse.all_electives`)

#### `AdminProgramSettingsPage`
- Управление программами и треками
- Создание / переименование / удаление программ
- Создание / переименование / удаление треков
- Управление типами элективов
- Данные: `GET /api/settings/`, мутации через отдельные CRUD-эндпоинты

#### `AdminExceptionsPage`
- Просмотр существующих исключений
- Создание нового исключения (электив + трек)
- Удаление исключения
- **Нет PATCH на фронте** — редактирование не реализовано, хотя эндпоинт есть

#### `AdminSemesterManagementPage`
- Управление итерациями и потоками
- Создание итерации: год, сезон, degree year, потоки
- Каждый поток: язык программы, тип электива, программы, элективы, приоритеты
- Кнопка выгрузки Excel (вызывает `/semesters/excel/{id}` — **эндпоинт не реализован на бэке**)
- Список существующих итераций — **только моковые данные** (нет GET-эндпоинта итераций)

#### `StudentElectivesPage`
- Просмотр доступных элективов по типу
- Вкладки по типам (из `available_electives`)
- Форма выбора с приоритетами (`StudentElectiveSelectionForm`)
- Избранное (localStorage через `useStudentElectivesPage`)
- Поиск
- Сохранение выбора через `POST /api/me/submissions`
- Отображение уже сделанных выборов

### Хуки

| Хук | Назначение |
|---|---|
| `useAuth` | Сессия, логин/логаут, состояние элективов администратора |
| `useAdminElectivesPage` | Фильтрация, поиск, вид списка на странице Admin Electives |
| `useAdminElectivesFlow` | CRUD-операции с элективами (create/update/archive/delete/restore) |
| `useAdminSidebarFilters` | Состояние фильтров в сайдбаре администратора |
| `useAdminelectiveEditor` | Состояние формы создания/редактирования электива |
| `useStudentElectivesPage` | Поиск, избранное, вкладки на студенческой странице |
| `useStudentElectivesFlow` | Логика выбора элективов, сохранение, reset |
| `useStudentSidebar` | Состояние сайдбара студента |
| `useElectiveSearch` | Поиск + подсветка совпадений |
| `useDisclosure` | open/close состояние модалок |
| `useOutsideClick` | Закрытие по клику вне элемента |
| `useHeaderProfileMenu` | Меню профиля в хедере |

### Дублирование компонентов

В процессе рефакторинга в репозитории остались **два набора компонентов** — старый и новый:

| Старый (не используется в App.tsx) | Новый (используется) |
|---|---|
| `src/pages/AdminElectivesPage/` (папка) | `src/pages/AdminElectivesPage.tsx` (файл) |
| `src/pages/StudentLayout/` | `src/pages/StudentElectivesPage.tsx` |
| `src/pages/StudentElectivesByTypePage/` | |
| `src/ui/components/` (ElectiveCard, ElectivesList, Header, Modal, SidebarMenu, VotingForm) | `src/components/` |
| `src/app/AuthContext.tsx`, `src/app/locale/` | `src/hooks/useAuth.ts` |
| `src/routes/` (ProtectedRoute, LogoutRoute) | Логика в `App.tsx` |
| `src/hooks/useLocalStorage.ts`, `useVotingForm.ts`, `useElectiveTypesTabs.ts` | |
| `src/types/electives.ts` (множественное ч.) | `src/types/elective.ts` (единственное ч.) |

Старые файлы не подключены к `App.tsx`, не влияют на работу, но занимают место.

### Что не реализовано на фронте

- Редактирование исключений (PATCH) — только просмотр и создание/удаление
- Список существующих итераций в `AdminSemesterManagementPage` — только моковые данные
- Скачивание Excel — вызов уходит на несуществующий эндпоинт
- `CSRF_TRUSTED_ORIGINS` на бэке не включает Docker-порт 3000 — CSRF может ломаться в Docker окружении
- Нет обработки истёкшей сессии (при перезагрузке страницы localStorage восстанавливает сессию, но бэк без реальной сессионной аутентификации всё равно ответит)
- Нет i18n — заготовка `LocaleContext` осталась в старых файлах, в новом App.tsx не используется
- Загрузка элективов администратора происходит только при логине (через `authResponse.all_electives`) — при обновлении страницы данные берутся из `localStorage`, новые изменения на бэке не подтягиваются

---

## Docker Compose

```yaml
services:
  backend:   # Django, порт 8000
  frontend:  # Vite / Node, порт 3000 → 5173
  db:        # PostgreSQL 15, без проброса порта на хост
```

**Важно:** порт `5432` у БД не пробрасывается наружу (убрано, чтобы не конфликтовать с локальным PostgreSQL). БД доступна только внутри Docker-сети.

Бэкенд ждёт БД через `healthcheck` (`pg_isready`).

---

## Тестирование

- Тестовые файлы созданы автоматически Django (`tests.py` в каждом приложении) — все пустые, тестов нет
- На фронте тестов нет
