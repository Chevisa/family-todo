# План проверки API

## 1. Проверка запуска

Открыть:

```text
http://YOUR_SERVER_IP/docs
```

Проверить:

```text
http://YOUR_SERVER_IP/health
```

## 2. Регистрация пользователя

Endpoint:

```http
POST /api/v1/auth/register
```

Пример тела:

```json
{
  "user_name": "Иван",
  "user_surname": "Иванов",
  "email": "ivan@example.com",
  "password": "StrongPass123"
}
```

## 3. Вход пользователя

Endpoint:

```http
POST /api/v1/auth/login
```

Пример тела:

```json
{
  "email": "ivan@example.com",
  "password": "StrongPass123"
}
```

После входа скопировать `access_token`.

## 4. Авторизация в Swagger

Нажать `Authorize` и вставить token в Bearer-поле.

Формат зависит от Swagger-схемы:

```text
<access_token>
```

или:

```text
Bearer <access_token>
```

## 5. Создание семьи/группы

Endpoint:

```http
POST /api/v1/teams
```

Пример:

```json
{
  "name": "Моя семья",
  "team_type": "family"
}
```

## 6. Получение списка групп

```http
GET /api/v1/teams
```

## 7. Создание задачи

```http
POST /api/v1/tasks
```

Пример:

```json
{
  "title": "Купить продукты",
  "description": "Купить молоко и хлеб",
  "team_id": 1,
  "assigned_to_id": 1,
  "priority": "medium"
}
```

## 8. Получение списка задач

```http
GET /api/v1/tasks?team_id=1
```

## 9. Отправка задачи на проверку

```http
POST /api/v1/tasks/1/submit-for-review
```

## 10. Изменение статуса задачи

```http
POST /api/v1/tasks/1/change-status
```

Пример:

```json
{
  "status": "done"
}
```
