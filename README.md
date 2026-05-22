# Family ToDo List

Веб-приложение для управления семейными задачами.

## Структура репозитория

```text
family-todo-list/
├── server/       # Backend FastAPI
├── client/       # Frontend React/Vite
├── deploy/       # Docker Compose, Nginx, production env examples
├── docs/         # Документация, спецификация, скриншоты
├── .github/      # GitHub Actions workflows
├── .gitignore
└── README.md
```

## Локальный запуск backend

```bash
cd server
docker compose up --build
```

Swagger:

```text
http://localhost:8000/docs
```

## Локальный запуск frontend

```bash
cd client
npm install
npm run dev
```

## Production deploy на VPS

Production-файлы находятся в папке `deploy/`:

- `docker-compose.prod.yml`;
- `nginx.conf`;
- `server.env.production.example`;
- `client.env.production.example`.

CI/CD настроен через GitHub Actions:

- `.github/workflows/ci.yml` — проверка backend и frontend;
- `.github/workflows/deploy.yml` — автоматический деплой на VPS при push в `main`.

## Секреты

Настоящие секреты не хранятся в репозитории. Используются GitHub Secrets:

- `VPS_HOST`;
- `VPS_USER`;
- `VPS_PORT`;
- `VPS_SSH_KEY`;
- `POSTGRES_PASSWORD`;
- `SECRET_KEY`;
- `CORS_ORIGINS`.

## Документация

Основные документы находятся в папке `docs/`:

- `SPECIFICATION.md`;
- `DEPLOYMENT_GUIDE.md`;
- `SECURITY.md`;
- `API_TEST_PLAN.md`.
