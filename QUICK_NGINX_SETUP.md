# Быстрая настройка системного Nginx

## Автоматическая настройка (рекомендуется)

```bash
# На сервере, в корне проекта
sudo ./setup-nginx.sh
```

## Ручная настройка

### 1. Перезапустить Docker Nginx
```bash
cd ~/gross-community/backend
docker-compose up -d web
```

### 2. Скопировать конфигурацию
```bash
# Для Debian/Ubuntu
sudo cp ~/gross-community/nginx-system.conf /etc/nginx/sites-available/gross-community
sudo ln -s /etc/nginx/sites-available/gross-community /etc/nginx/sites-enabled/

# Для CentOS/RHEL
sudo cp ~/gross-community/nginx-system.conf /etc/nginx/conf.d/gross-community.conf
```

### 3. Проверить и перезапустить
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Что изменилось

✅ **docker-compose.yml** - Docker Nginx теперь на порту 8080 (`127.0.0.1:8080:80`)
✅ **nginx-system.conf** - системный Nginx проксирует на Docker Nginx
✅ **setup-nginx.sh** - скрипт автоматической настройки

## Проверка

```bash
# Проверить статус
sudo systemctl status nginx

# Проверить Docker Nginx
docker port nginx-gross
curl http://127.0.0.1:8080

# Проверить логи
sudo tail -f /var/log/nginx/gross-community.error.log
```

## Важно

- Docker Nginx работает на порту 8080 (только локально)
- Системный Nginx на порту 80 проксирует все запросы на Docker Nginx
- Docker Nginx остается запущенным и обрабатывает все запросы

