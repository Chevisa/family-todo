# Инструкция по деплою Family ToDo List на VPS

## 1. Подготовка сервера

Подключиться к серверу:

```bash
ssh root@YOUR_SERVER_IP
```

Обновить систему:

```bash
apt update && apt upgrade -y
```

Создать пользователя для деплоя:

```bash
adduser deploy
usermod -aG sudo deploy
```

## 2. Установка Docker, Git и Nginx

```bash
apt update
apt install -y ca-certificates curl gnupg git ufw nginx
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
```

Добавить Docker repository:

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Установить Docker:

```bash
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Проверить:

```bash
docker --version
docker compose version
```

## 3. Настройка firewall

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

Порт PostgreSQL `5432` наружу не открывать.

## 4. Подготовка GitHub Secrets

В GitHub открыть:

```text
Settings → Secrets and variables → Actions
```

Добавить:

```text
VPS_HOST=YOUR_SERVER_IP
VPS_USER=deploy
VPS_PORT=22
VPS_SSH_KEY=приватный SSH-ключ
POSTGRES_PASSWORD=сложный пароль PostgreSQL
SECRET_KEY=длинный секретный ключ backend
CORS_ORIGINS=http://YOUR_SERVER_IP
```

## 5. Первый деплой

После настройки secrets выполнить push в ветку `main`.

GitHub Actions автоматически:

1. соберёт frontend;
2. загрузит файлы на VPS;
3. создаст `.env` на сервере;
4. запустит backend и PostgreSQL через Docker Compose;
5. настроит Nginx.

## 6. Проверка результата

Открыть frontend:

```text
http://YOUR_SERVER_IP
```

Открыть Swagger:

```text
http://YOUR_SERVER_IP/docs
```

Проверить контейнеры на сервере:

```bash
docker ps
```

Посмотреть логи backend:

```bash
docker logs family_todo_api --tail=100
```

## 7. Если нужно перезапустить вручную

```bash
cd /var/www/family-todo-list
export POSTGRES_PASSWORD="your_password"
docker compose -f deploy/docker-compose.prod.yml up -d --build
sudo nginx -t
sudo systemctl reload nginx
```
