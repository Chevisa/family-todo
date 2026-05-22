# Family ToDo List Backend

Готовая серверная часть для лабораторной работы по теме **Family ToDo List**.

## Что реализовано

- FastAPI + PostgreSQL
- JWT-аутентификация (access token) + refresh sessions
- роли в семье: `admin` и `member`
- семьи/группы (`Team`)
- участники семьи (`UserTeam`)
- задачи (`Task`)
- профиль пользователя
- базовые уведомления-заглушки для Telegram/SMS
- Swagger UI по адресу `/docs`

## Почему схема немного улучшена по сравнению с черновой

В заметке к лабе в таблице `User` были поля `access_token`, `refresh_token`, `expires_in`. Для реального backend-решения это не лучший вариант, потому что токены не стоит хранить прямо в карточке пользователя. Поэтому здесь:

- `access_token` генерируется как JWT при входе;
- `refresh_token` хранится как **хэш** в таблице `refresh_sessions`;
- это безопаснее и ближе к нормальной практике backend-разработки.

Также в `Task.status` добавлен статус `on_review`, потому что в бизнес-процессе пользователь переводит задачу **«к проверке»**.

## Структура проекта

```text
family_todo_backend/
├── app/
│   ├── api/
│   │   ├── deps.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── tasks.py
│   │       ├── teams.py
│   │       └── users.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── db/
│   │   └── init_db.sql
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── tests/
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

## Быстрый запуск локально

### 1. Подними PostgreSQL

Можно локально или через Docker:

```bash
docker compose up -d db
```

### 2. Создай `.env`

```bash
cp .env.example .env
```

### 3. Установи зависимости

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Запусти API

```bash
uvicorn app.main:app --reload
```

API будет доступен на:

- `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

## Инициализация БД

Есть два варианта:

1. Просто запустить приложение - таблицы создадутся автоматически через SQLAlchemy.
2. Выполнить SQL-скрипт `app/db/init_db.sql` вручную.

## Основные эндпоинты

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Profile

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`

### Teams / Family

- `POST /api/v1/teams`
- `GET /api/v1/teams`
- `GET /api/v1/teams/{team_id}`
- `POST /api/v1/teams/{team_id}/members`
- `PATCH /api/v1/teams/{team_id}/members/{user_id}/role`
- `DELETE /api/v1/teams/{team_id}/members/{user_id}`

### Tasks

- `POST /api/v1/tasks`
- `GET /api/v1/tasks?team_id=1`
- `GET /api/v1/tasks/{task_id}`
- `PATCH /api/v1/tasks/{task_id}`
- `DELETE /api/v1/tasks/{task_id}`
- `POST /api/v1/tasks/{task_id}/submit-for-review`
- `POST /api/v1/tasks/{task_id}/change-status`

## Правила ролей

### member

- может смотреть задачи своей семьи;
- может отправить **свою** задачу на проверку (`on_review`);
- не может создавать, редактировать и удалять задачи;
- не может менять состав семьи.

### admin

- может создавать/редактировать/удалять задачи;
- может менять статус задач;
- может добавлять и удалять участников семьи;
- может менять роли участников.

## Как связать с фронтендом

### 1. Укажи базовый URL API

Во фронтенде создай переменную:

```js
const API_URL = "http://localhost:8000/api/v1";
```

или в `.env` фронтенда:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 2. Логин

Фронтенд отправляет:

```http
POST /auth/login
```

Тело:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

В ответе придут:

- `access_token`
- `refresh_token`
- данные пользователя

`access_token` сохраняешь, например, в `localStorage`.

### 3. Все защищенные запросы отправляй с заголовком

```http
Authorization: Bearer <access_token>
```

### 4. Открытие списка семей

Экран со списком групп должен вызывать:

```http
GET /teams
```

### 5. Открытие задач выбранной семьи

```http
GET /tasks?team_id=<id>
```

### 6. Popup личного кабинета

```http
GET /users/me
PATCH /users/me
```

### 7. Если access token истек

Фронтенд вызывает:

```http
POST /auth/refresh
```

с `refresh_token`, получает новый `access_token` и повторяет исходный запрос.

## Пример axios-клиента

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Что можно добавить следующим шагом

- приглашения в семью по ссылке;
- полноценную интеграцию Telegram-бота;
- напоминания по дедлайнам через планировщик;
- Alembic для миграций;
- CI/CD и деплой.
