# Быстрая настройка системного Nginx

## Автоматическая настройка (рекомендуется)

```bash
# На сервере, в корне проекта
sudo ./setup-nginx.sh
```

## Ручная настройка

### 1. Остановить Docker Nginx
```bash
cd ~/gross-community/backend
docker stop nginx-gross
```

### 2. Перезапустить PHP-FPM
```bash
cd ~/gross-community/backend
docker-compose up -d php-fpm
```

### 3. Скопировать конфигурацию
```bash
# Для Debian/Ubuntu
sudo cp ~/gross-community/nginx-system.conf /etc/nginx/sites-available/gross-community
sudo ln -s /etc/nginx/sites-available/gross-community /etc/nginx/sites-enabled/

# Для CentOS/RHEL
sudo cp ~/gross-community/nginx-system.conf /etc/nginx/conf.d/gross-community.conf
```

### 4. Проверить и перезапустить
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Что изменилось

✅ **docker-compose.yml** - добавлен проброс порта PHP-FPM (`127.0.0.1:9000:9000`)
✅ **nginx-system.conf** - конфигурация системного Nginx без SSL
✅ **setup-nginx.sh** - скрипт автоматической настройки

## Проверка

```bash
# Проверить статус
sudo systemctl status nginx

# Проверить PHP-FPM
docker port php-fpm-gross

# Проверить логи
sudo tail -f /var/log/nginx/gross-community.error.log
```

## Важно

- Путь к проекту по умолчанию: `/root/gross-community/`
- Если проект в другом месте, отредактируйте пути в конфигурации
- Docker Nginx должен быть остановлен, чтобы освободить порт 80

