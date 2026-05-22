# GitHub Actions workflows

## ci.yml

Запускается при push и pull request в `main` и `develop`.
Проверяет:

- установку backend-зависимостей;
- компиляцию Python-кода;
- установку frontend-зависимостей;
- сборку frontend.

## deploy.yml

Запускается при push в `main` или вручную через `workflow_dispatch`.
Делает:

1. сборку frontend;
2. подключение к VPS по SSH;
3. загрузку `server/`, `deploy/` и `client/dist` на сервер;
4. создание production `.env` из GitHub Secrets;
5. пересборку Docker-контейнеров backend и PostgreSQL;
6. обновление Nginx.

## Required GitHub Secrets

Добавить в `Settings → Secrets and variables → Actions` или в environment `production`:

- `VPS_HOST` — IP сервера;
- `VPS_USER` — пользователь на сервере, например `deploy`;
- `VPS_PORT` — обычно `22`;
- `VPS_SSH_KEY` — приватный SSH-ключ для подключения;
- `POSTGRES_PASSWORD` — пароль PostgreSQL;
- `SECRET_KEY` — секретный ключ backend;
- `CORS_ORIGINS` — разрешённые адреса frontend, например `http://YOUR_SERVER_IP`.
