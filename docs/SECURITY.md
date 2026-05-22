# Security notes

## Что нельзя хранить в GitHub

Нельзя коммитить:

- `.env`;
- пароли;
- `SECRET_KEY`;
- SSH private key;
- root-пароль сервера;
- PostgreSQL password;
- токены внешних сервисов;
- `YANDEX_CLIENT_SECRET`, если будет добавлена авторизация через Яндекс ID.

## Где хранить секреты

Использовать:

```text
GitHub Repository Secrets
GitHub Environment Secrets
```

Минимальный набор:

```text
VPS_HOST
VPS_USER
VPS_PORT
VPS_SSH_KEY
POSTGRES_PASSWORD
SECRET_KEY
CORS_ORIGINS
```

## Рекомендации по VPS

1. Не использовать root для постоянного деплоя.
2. Создать пользователя `deploy`.
3. Использовать SSH-ключ вместо пароля.
4. Открыть только порты `22`, `80`, `443`.
5. Не открывать PostgreSQL наружу.
6. После настройки сменить root-пароль или отключить вход root по паролю.

## Рекомендации по Docker

1. PostgreSQL хранить в volume.
2. Backend не публиковать напрямую в интернет.
3. Пробрасывать backend только на `127.0.0.1:8000`.
4. Внешний доступ делать через Nginx.

## Рекомендации по frontend

В production использовать:

```env
VITE_API_URL=/api/v1
```

Так frontend обращается к backend через тот же домен/IP, а Nginx проксирует запросы.
