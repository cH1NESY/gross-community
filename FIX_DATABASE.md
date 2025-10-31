# Исправление проблемы с подключением к базе данных

## Проблема:
```
could not translate host name "postgres" to address: Temporary failure in name resolution
```

Это означает, что Laravel не может найти контейнер PostgreSQL.

## Решение на сервере:

### 1. Проверьте, что контейнер PostgreSQL запущен:
```bash
ssh root@5.129.248.5
cd ~/gross-community/backend

docker ps | grep postgres
```

Если контейнер не запущен:
```bash
docker-compose up -d postgres
```

### 2. Проверьте настройки .env:
```bash
docker exec php-fpm-gross grep -E "DB_HOST|DB_DATABASE|DB_USERNAME|DB_PASSWORD" .env
```

Должно быть:
```
DB_CONNECTION=pgsql
DB_HOST=postgres          # ← ИМЯ СЕРВИСА из docker-compose.yml, не postgres-gross!
DB_PORT=5432
DB_DATABASE=ваша_база
DB_USERNAME=ваш_пользователь
DB_PASSWORD=ваш_пароль
```

### 3. Если DB_HOST неправильный, исправьте:
```bash
# Войдите в контейнер
docker exec -it php-fpm-gross bash

# Отредактируйте .env (или используйте sed)
sed -i 's/DB_HOST=.*/DB_HOST=postgres/' .env

# Проверьте
grep DB_HOST .env

# Выйдите
exit
```

### 4. Проверьте, что контейнеры в одной сети:
```bash
# Проверьте сети
docker network ls

# Проверьте, что php-fpm и postgres в одной сети
docker inspect php-fpm-gross | grep -A 10 Networks
docker inspect postgres-gross | grep -A 10 Networks
```

### 5. Проверьте подключение из php-fpm к postgres:
```bash
docker exec php-fpm-gross ping -c 2 postgres
```

Если ping не работает, значит проблема с сетью Docker.

### 6. Очистите кэш и перезапустите:
```bash
docker exec php-fpm-gross php artisan config:clear
docker-compose restart php-fpm
```

### 7. Проверьте подключение:
```bash
docker exec php-fpm-gross php artisan db:show
```

## Альтернативное решение:

Если проблема с сетью Docker сохраняется, можно использовать имя контейнера напрямую:
```bash
docker exec -it php-fpm-gross bash
sed -i 's/DB_HOST=.*/DB_HOST=postgres-gross/' .env
exit
docker exec php-fpm-gross php artisan config:clear
```

Но лучше исправить сеть, чтобы использовать имя сервиса `postgres`.

## Проверка после исправления:

```bash
# Должно показать информацию о БД без ошибок
docker exec php-fpm-gross php artisan db:show

# Должна выполниться без ошибок
docker exec php-fpm-gross php artisan migrate:status
```

