# HouseFlow Frontend

Frontend для лабораторной работы **Family ToDo List / HouseFlow**. Проект подключён к backend на FastAPI через REST API.

## Стек

- React
- Vite
- React Router
- SCSS
- REST API backend: `http://localhost:8000/api/v1`

## Что подключено к backend

- регистрация пользователя: `POST /auth/register`
- вход пользователя: `POST /auth/login`
- сохранение `access_token` и `refresh_token` в `localStorage`
- автоматическая отправка JWT в заголовке `Authorization: Bearer <token>`
- личный кабинет: `GET /users/me`, `PATCH /users/me`
- список семей/групп: `GET /teams`
- создание семьи/группы: `POST /teams`
- просмотр участников семьи: `GET /teams/{team_id}`
- добавление участника: `POST /teams/{team_id}/members`
- удаление участника: `DELETE /teams/{team_id}/members/{user_id}`
- список задач: `GET /tasks?team_id=<id>`
- создание задач: `POST /tasks`
- отправка задачи на проверку: `POST /tasks/{task_id}/submit-for-review`
- изменение статуса задачи администратором: `POST /tasks/{task_id}/change-status`
- удаление задачи: `DELETE /tasks/{task_id}`

## Локальный запуск

Сначала должен быть запущен backend:

```bash
cd family_todo_backend
docker compose up --build
```

Swagger backend должен открываться по адресу:

```text
http://localhost:8000/docs
```

Затем запустить frontend:

```bash
npm install
npm run dev
```

Frontend откроется по адресу, который покажет Vite, обычно:

```text
http://localhost:5173
```

## Настройка адреса backend

В корне frontend-проекта есть файл `.env.example`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Для локальной разработки можно создать файл `.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Если backend будет развернут в облаке, нужно заменить значение на адрес deployed backend.

## Важно про CORS

В backend в `.env` должен быть разрешён адрес frontend. Для Vite нужен адрес:

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Если frontend работает на другом порту, этот порт нужно добавить в `CORS_ORIGINS` и перезапустить backend.

## Как проверить интеграцию

1. Запустить backend.
2. Запустить frontend.
3. Открыть `/welcome`.
4. Зарегистрировать пользователя.
5. После регистрации приложение перенаправит на `/teams`.
6. Создать семью.
7. Создать задачу.
8. Проверить, что данные появляются в Swagger и PostgreSQL.

## Примечание про Яндекс ID

Кнопка «Войти по Яндекс.ID» оставлена в интерфейсе как заготовка. На текущем backend реализован вход по email/password и JWT. Чтобы кнопка заработала, нужно дополнительно реализовать OAuth-авторизацию через Yandex ID на backend.
