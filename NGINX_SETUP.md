# Настройка системного Nginx для Gross Community

## ⚠️ ВАЖНО: docker-compose.yml уже обновлен!

В файле `backend/docker-compose.yml` Docker Nginx теперь работает на порту 8080 вместо 80.

## Шаг 1: Перезапустить Docker контейнеры

Перезапустите Docker Nginx, чтобы применить новый порт:

```bash
cd ~/gross-community/backend
docker-compose up -d web
```

Проверьте, что Docker Nginx работает на порту 8080:

```bash
docker port nginx-gross
# Должно показать: 127.0.0.1:8080->80/tcp
```

## Шаг 2: Скопировать конфигурацию Nginx

Скопируйте файл `nginx-system.conf` в директорию конфигураций Nginx:

```bash
# На сервере
sudo cp /root/gross-community/nginx-system.conf /etc/nginx/sites-available/gross-community
sudo ln -s /etc/nginx/sites-available/gross-community /etc/nginx/sites-enabled/
```

Или если используете `/etc/nginx/conf.d/`:

```bash
sudo cp /root/gross-community/nginx-system.conf /etc/nginx/conf.d/gross-community.conf
```

## Шаг 3: Проверить конфигурацию

```bash
sudo nginx -t
```

## Шаг 4: Перезапустить Nginx

```bash
sudo systemctl restart nginx
```

## Шаг 5: Проверить работу

```bash
# Проверить статус Nginx
sudo systemctl status nginx

# Проверить логи
sudo tail -f /var/log/nginx/gross-community.error.log
sudo tail -f /var/log/nginx/gross-community.access.log

# Проверить доступность Docker Nginx
curl http://127.0.0.1:8080  # Должен вернуть содержимое сайта
```

## Важные замечания

1. **Docker Nginx**: Теперь работает на порту 8080 и доступен только локально (`127.0.0.1:8080`)

2. **Системный Nginx**: Проксирует все запросы с порта 80 на Docker Nginx на порту 8080

3. **Архитектура**:
   - Пользователь → Системный Nginx (порт 80) → Docker Nginx (порт 8080) → PHP-FPM → PostgreSQL
   - Все запросы проходят через системный Nginx, который проксирует их на Docker Nginx

## Проверка после настройки

1. Откройте сайт в браузере: `http://ваш-ip-адрес`
2. Проверьте API: `http://ваш-ip-адрес/api/health` (если есть такой endpoint)
3. Проверьте статику: `http://ваш-ip-адрес/0.jpg` (должна загрузиться картинка)

