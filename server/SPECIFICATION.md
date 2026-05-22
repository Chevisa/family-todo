# SPECIFICATION - Family ToDo List

## Цель проекта

Веб-приложение для совместного управления семейными задачами с разграничением ролей, хранением данных в PostgreSQL и REST API на FastAPI.

## Основные сущности

### User
- id
- user_name
- user_surname
- email
- password_hash
- phone_number
- date_of_birth
- sigma_sms_token
- telegram_id
- created_at

### Team
- id
- team_name
- team_type
- num_of_users
- create_date

### UserTeam
- id
- user_id
- team_id
- role_in_team (`admin`, `member`)

### Task
- id
- name
- create_date
- user_id
- team_id
- status (`planned`, `in_progress`, `on_review`, `completed`)
- deadline
- description
- priority (`yes`, `not`)
- admin_comment
- updated_at

### RefreshSession
- id
- user_id
- token_hash
- expires_at
- revoked_at
- created_at

## Роли

### Admin
- создает семью;
- приглашает/добавляет пользователей;
- меняет роли участников;
- создает, редактирует, удаляет задачи;
- меняет статусы задач;
- комментирует задачи после проверки.

### Member
- просматривает семьи и задачи, где он состоит;
- отправляет свои задачи на проверку.

## Основные бизнес-правила

1. Пользователь видит только те семьи, в которых состоит.
2. Администратор должен оставаться в семье хотя бы один.
3. Исполнитель задачи должен быть участником этой семьи.
4. Тип семьи (`team_type`) задается при создании и далее не меняется.
5. Статус `on_review` нужен для сценария «отправить задачу на проверку».

## Эндпоинты

### Auth
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- POST `/api/v1/auth/logout`
- GET `/api/v1/auth/me`

### Users
- GET `/api/v1/users/me`
- PATCH `/api/v1/users/me`

### Teams
- POST `/api/v1/teams`
- GET `/api/v1/teams`
- GET `/api/v1/teams/{team_id}`
- POST `/api/v1/teams/{team_id}/members`
- PATCH `/api/v1/teams/{team_id}/members/{user_id}/role`
- DELETE `/api/v1/teams/{team_id}/members/{user_id}`

### Tasks
- POST `/api/v1/tasks`
- GET `/api/v1/tasks?team_id={team_id}`
- GET `/api/v1/tasks/{task_id}`
- PATCH `/api/v1/tasks/{task_id}`
- DELETE `/api/v1/tasks/{task_id}`
- POST `/api/v1/tasks/{task_id}/submit-for-review`
- POST `/api/v1/tasks/{task_id}/change-status`
