# Настройка системного Nginx для Gross Community

## ⚠️ ВАЖНО: docker-compose.yml уже обновлен!

В файле `backend/docker-compose.yml` уже добавлен проброс порта PHP-FPM (`127.0.0.1:9000:9000`).

## Шаг 1: Остановить Docker Nginx

Сначала нужно остановить Docker Nginx, чтобы освободить порт 80:

```bash
cd ~/gross-community/backend
docker stop nginx-gross
# Или можно закомментировать сервис web в docker-compose.yml
```

## Шаг 2: Перезапустить PHP-FPM с новым портом

Перезапустите PHP-FPM контейнер, чтобы применить проброс порта:

```bash
cd ~/gross-community/backend
docker-compose up -d php-fpm
```

Проверьте, что порт проброшен:

```bash
docker port php-fpm-gross
# Должно показать: 127.0.0.1:9000->9000/tcp
```

### Вариант B: Использовать unix socket (более безопасно)

Если у вас есть общий volume между Docker и хостом, можно использовать unix socket.

## Шаг 3: Скопировать конфигурацию Nginx

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

## Шаг 4: Настроить пути в конфигурации

Отредактируйте конфигурацию и укажите правильные пути:

```bash
sudo nano /etc/nginx/sites-available/gross-community
```

Измените пути, если проект находится не в `/root/gross-community/`:

- `/root/gross-community/frontend/dist` - путь к собранному фронтенду
- `/root/gross-community/backend/storage/app/public/` - путь к storage
- `/var/www/html/public` - путь к Laravel public внутри Docker контейнера (это путь внутри контейнера, не меняйте)

## Шаг 5: Проверить конфигурацию

```bash
sudo nginx -t
```

## Шаг 6: Перезапустить Nginx

```bash
sudo systemctl restart nginx
```

## Шаг 7: Проверить работу

```bash
# Проверить статус Nginx
sudo systemctl status nginx

# Проверить логи
sudo tail -f /var/log/nginx/gross-community.error.log
sudo tail -f /var/log/nginx/gross-community.access.log

# Проверить доступность PHP-FPM
curl http://127.0.0.1:9000  # Должен вернуть ошибку, но не "connection refused"
```

## Важные замечания

1. **Путь к проекту**: Убедитесь, что путь `/root/gross-community/` правильный. Если проект в другом месте, измените в конфигурации.

2. **PHP-FPM порт**: Если PHP-FPM не доступен на `127.0.0.1:9000`, проверьте:
   ```bash
   docker exec php-fpm-gross netstat -tlnp | grep 9000
   docker port php-fpm-gross
   ```

3. **Права доступа**: Убедитесь, что Nginx может читать файлы:
   ```bash
   sudo chown -R www-data:www-data /root/gross-community/frontend/dist
   # Или добавьте nginx пользователя в группу с доступом
   ```

4. **Docker Nginx**: Если хотите полностью убрать Docker Nginx, можно удалить сервис из `docker-compose.yml` или просто не запускать его.

## Альтернатива: Использовать HTTP проксирование

Если FastCGI не работает, можно использовать HTTP проксирование через специальный прокси-сервер или изменить архитектуру. Но FastCGI - стандартный и правильный способ.

## Проверка после настройки

1. Откройте сайт в браузере: `http://ваш-ip-адрес`
2. Проверьте API: `http://ваш-ip-адрес/api/health` (если есть такой endpoint)
3. Проверьте статику: `http://ваш-ip-адрес/0.jpg` (должна загрузиться картинка)

