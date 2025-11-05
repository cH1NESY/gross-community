# Выполнение миграций на сервере

## Проблема решена частично:
✅ Подключение к БД работает (Host: postgres)
❌ Таблицы не созданы (Tables: 0)

## Что нужно сделать:

```bash
ssh root@5.129.248.5
cd ~/gross-community/backend

# 1. Выполните миграции
docker exec php-fpm-gross php artisan migrate

# Если возникнут ошибки с правами, выполните с --force
docker exec php-fpm-gross php artisan migrate --force

# 2. Проверьте, что таблицы созданы
docker exec php-fpm-gross php artisan db:show

# Должно показать больше 0 таблиц

# 3. Очистите кэш конфигурации
docker exec php-fpm-gross php artisan config:clear
docker exec php-fpm-gross php artisan cache:clear

# 4. Перезапустите контейнеры
docker-compose restart php-fpm
```

## После выполнения миграций:

Проверьте, что все работает:
```bash
# Должен вернуть список таблиц
docker exec php-fpm-gross php artisan tinker --execute="echo 'Tables: ' . DB::select('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'')->count();"
```

Теперь API запросы должны работать!



