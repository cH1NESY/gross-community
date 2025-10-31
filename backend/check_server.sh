#!/bin/bash
# Скрипт для диагностики проблем на сервере

echo "=== Проверка контейнеров ==="
docker ps -a

echo ""
echo "=== Проверка подключения к базе данных ==="
docker exec php-fpm-gross php artisan db:show || echo "Ошибка подключения к БД"

echo ""
echo "=== Проверка миграций ==="
docker exec php-fpm-gross php artisan migrate:status || echo "Ошибка проверки миграций"

echo ""
echo "=== Проверка последних логов Laravel ==="
docker exec php-fpm-gross tail -n 30 storage/logs/laravel.log || echo "Логи не найдены"

echo ""
echo "=== Проверка конфигурации ==="
docker exec php-fpm-gross php artisan config:show database.connections.pgsql || echo "Конфиг не найден"

echo ""
echo "=== Проверка таблицы personal_access_tokens ==="
docker exec php-fpm-gross php artisan tinker --execute="echo DB::table('personal_access_tokens')->count();" || echo "Таблица не найдена"

echo ""
echo "=== Проверка .env переменных ==="
docker exec php-fpm-gross grep -E "DB_|APP_" .env | head -10 || echo ".env не найден"

