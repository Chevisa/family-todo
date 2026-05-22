# SPECIFICATION.md

## 1. Название проекта

**Family ToDo List** — веб-приложение для управления семейными задачами.

## 2. Цель проекта

Разработать работающее веб-приложение с REST API, frontend-интерфейсом, PostgreSQL-базой данных, авторизацией пользователей и возможностью развертывания на сервере.

## 3. Стек технологий

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT-авторизация
- Docker

### Frontend

- React / Vite
- JavaScript
- Fetch API
- LocalStorage для хранения JWT-токенов

### Infrastructure

- VPS Ubuntu
- Docker Compose
- Nginx
- GitHub Actions
- GitHub Secrets

## 4. Роли пользователей

### Обычный пользователь

Может:

- регистрироваться и входить в систему;
- просматривать доступные семьи/группы;
- просматривать задачи;
- переводить назначенную задачу в статус `on_review` — «к проверке»;
- редактировать свой профиль.

### Администратор семьи/группы

Может:

- создавать семью/группу;
- добавлять и удалять участников;
- назначать роли;
- создавать задачи;
- редактировать задачи;
- удалять задачи;
- менять статусы задач.

## 5. Основные сущности

### User

Пользователь системы.

Поля:

- `id`;
- `user_name`;
- `user_surname`;
- `email`;
- `phone_number`;
- `date_of_birth`;
- `telegram_id`;
- `password_hash`;
- `created_at`.

### Team

Семья или группа пользователей.

Поля:

- `id`;
- `name`;
- `team_type`;
- `created_by_id`;
- `created_at`.

### TeamMember

Связь пользователя и семьи/группы.

Поля:

- `id`;
- `team_id`;
- `user_id`;
- `role`;
- `created_at`.

### Task

Задача внутри семьи/группы.

Поля:

- `id`;
- `team_id`;
- `title`;
- `description`;
- `assigned_to_id`;
- `created_by_id`;
- `status`;
- `priority`;
- `due_date`;
- `created_at`;
- `updated_at`.

## 6. Статусы задач

Примерный набор статусов:

- `new` — новая задача;
- `in_progress` — задача выполняется;
- `on_review` — задача отправлена на проверку;
- `done` — задача выполнена;
- `cancelled` — задача отменена.

## 7. Авторизация

В системе используется JWT-авторизация.

Сценарий:

1. Пользователь регистрируется через `/auth/register`.
2. Пользователь входит через `/auth/login`.
3. Backend возвращает `access_token` и `refresh_token`.
4. Frontend сохраняет токены в `localStorage`.
5. Для защищённых запросов frontend отправляет заголовок:

```http
Authorization: Bearer <access_token>
```

## 8. Основные API endpoints

### Auth

| Метод | URL | Описание |
|---|---|---|
| POST | `/api/v1/auth/register` | Регистрация пользователя |
| POST | `/api/v1/auth/login` | Вход пользователя |
| POST | `/api/v1/auth/refresh` | Обновление access token |
| POST | `/api/v1/auth/logout` | Выход пользователя, если реализован |
| GET | `/api/v1/auth/me` | Получение текущего пользователя |

### Users

| Метод | URL | Описание |
|---|---|---|
| GET | `/api/v1/users/me` | Личный кабинет |
| PATCH | `/api/v1/users/me` | Обновление профиля |

### Teams

| Метод | URL | Описание |
|---|---|---|
| GET | `/api/v1/teams` | Получить список семей/групп |
| POST | `/api/v1/teams` | Создать семью/группу |
| GET | `/api/v1/teams/{team_id}` | Получить данные семьи/группы |
| GET | `/api/v1/teams/{team_id}/members` | Получить участников |
| POST | `/api/v1/teams/{team_id}/members` | Добавить участника |
| DELETE | `/api/v1/teams/{team_id}/members/{user_id}` | Удалить участника |

### Tasks

| Метод | URL | Описание |
|---|---|---|
| GET | `/api/v1/tasks` | Получить задачи |
| GET | `/api/v1/tasks?team_id={id}` | Получить задачи выбранной семьи |
| POST | `/api/v1/tasks` | Создать задачу |
| PATCH | `/api/v1/tasks/{task_id}` | Изменить задачу |
| DELETE | `/api/v1/tasks/{task_id}` | Удалить задачу |
| POST | `/api/v1/tasks/{task_id}/submit-for-review` | Отправить задачу на проверку |
| POST | `/api/v1/tasks/{task_id}/change-status` | Изменить статус задачи |

## 9. Архитектура

```text
Пользователь
   ↓
Frontend React/Vite
   ↓ HTTP запросы
Backend FastAPI
   ↓ SQLAlchemy
PostgreSQL
```

После деплоя на VPS:

```text
Пользователь
   ↓
Nginx
   ├── frontend static files
   └── /api/v1 → FastAPI backend
                 ↓
              PostgreSQL
```

## 10. Развертывание

Проект разворачивается на VPS с помощью:

- Docker Compose;
- Nginx;
- GitHub Actions;
- GitHub Secrets.

Backend и PostgreSQL запускаются в Docker-контейнерах.
Frontend собирается командой `npm run build` и раздаётся через Nginx.

## 11. CI/CD

При push в ветку `main` запускается GitHub Actions workflow:

1. собирается frontend;
2. файлы проекта загружаются на VPS;
3. на сервере создаётся `.env` из GitHub Secrets;
4. выполняется `docker compose up -d --build`;
5. обновляется конфигурация Nginx;
6. приложение становится доступно по IP или домену.
