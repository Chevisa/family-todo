# Deploy files

Папка `deploy/` содержит файлы для размещения проекта Family ToDo List на VPS.

## Состав

- `docker-compose.prod.yml` — production-запуск PostgreSQL и FastAPI backend в Docker.
- `nginx.conf` — конфигурация Nginx для frontend и reverse proxy на backend.
- `server.env.production.example` — пример production `.env` для backend.
- `client.env.production.example` — пример production `.env` для frontend.

## Важные правила

1. Настоящий `server/.env` не хранить в GitHub.
2. Пароли, `SECRET_KEY`, SSH-ключи и токены хранить в GitHub Actions Secrets.
3. PostgreSQL-порт `5432` не открывать наружу.
4. Backend-порт `8000` в production пробрасывается только на `127.0.0.1`.
5. Наружу доступны только `80` и после настройки HTTPS `443`.

## Запуск на VPS вручную

```bash
cd /var/www/family-todo-list
export POSTGRES_PASSWORD="your_strong_password"
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

## Проверка

```bash
docker ps
docker logs family_todo_api --tail=100
curl http://127.0.0.1:8000/health
```
