# Исправление ошибки 500 на сервере

## Что исправлено:

1. ✅ Добавлена обработка ошибок в `AuthController` (методы `register` и `user`)
2. ✅ Добавлено логирование ошибок в Laravel
3. ✅ Улучшены сообщения об ошибках

## Что нужно сделать на сервере:

### 1. Загрузите исправленные файлы:
- `backend/app/Http/Controllers/Api/AuthController.php`
- `backend/docker/nginx/nginx.conf` (если еще не загружен)

### 2. Проверьте логи Laravel для диагностики:

```bash
ssh root@5.129.248.5
cd ~/gross-community/backend

# Посмотрите последние ошибки
docker exec php-fpm-gross tail -n 50 storage/logs/laravel.log
```

### 3. Проверьте базу данных и миграции:

```bash
# Проверьте подключение к БД
docker exec php-fpm-gross php artisan db:show

# Проверьте статус миграций
docker exec php-fpm-gross php artisan migrate:status

# Если миграции не выполнены, выполните их
docker exec php-fpm-gross php artisan migrate

# Проверьте, существует ли таблица personal_access_tokens (нужна для Sanctum)
docker exec php-fpm-gross php artisan tinker --execute="echo 'Tokens: ' . DB::table('personal_access_tokens')->count();"
```

### 4. Очистите кэш конфигурации:

```bash
docker exec php-fpm-gross php artisan config:clear
docker exec php-fpm-gross php artisan cache:clear
docker exec php-fpm-gross php artisan route:clear
```

### 5. Проверьте переменные окружения:

```bash
# Убедитесь, что БД настроена правильно
docker exec php-fpm-gross grep -E "DB_" .env

# Должны быть:
# DB_CONNECTION=pgsql
# DB_HOST=postgres-gross (или название вашего контейнера)
# DB_PORT=5432
# DB_DATABASE=...
# DB_USERNAME=...
# DB_PASSWORD=...
```

### 6. Перезапустите контейнеры:

```bash
cd ~/gross-community/backend
docker-compose restart php-fpm
docker-compose restart nginx
```

### 7. Проверьте работоспособность:

```bash
# Проверьте health endpoint
curl http://localhost/api/health

# Должен вернуть: {"status":"ok"}
```

## Возможные причины ошибки 500:

1. **База данных недоступна** - проверьте, что контейнер postgres запущен:
   ```bash
   docker ps | grep postgres
   ```

2. **Миграции не выполнены** - выполните:
   ```bash
   docker exec php-fpm-gross php artisan migrate
   ```

3. **Таблица personal_access_tokens отсутствует** - выполните миграции Sanctum:
   ```bash
   docker exec php-fpm-gross php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   docker exec php-fpm-gross php artisan migrate
   ```

4. **Неверные настройки .env** - проверьте переменные DB_*

## После исправления:

Теперь при ошибках в логах Laravel (`storage/logs/laravel.log`) будет детальная информация о проблеме. Это поможет точно определить причину ошибки 500.

