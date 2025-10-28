#!/bin/bash

# Скрипт для запуска воркера очередей Laravel с RabbitMQ

echo "🚀 Запуск воркера очередей Laravel..."

# Проверяем, что контейнер PHP-FPM запущен
if ! docker ps | grep -q "php-fpm-gross"; then
    echo "❌ Контейнер php-fpm-gross не запущен. Запустите docker-compose up -d"
    exit 1
fi

# Проверяем, что RabbitMQ запущен
if ! docker ps | grep -q "rabbitmq-gross"; then
    echo "❌ Контейнер rabbitmq-gross не запущен. Запустите docker-compose up -d rabbitmq"
    exit 1
fi

echo "✅ Все контейнеры запущены"

# Запускаем воркер очередей
echo "🔄 Запуск воркера очередей..."
docker exec -it php-fpm-gross php artisan queue:work rabbitmq --verbose --tries=3 --timeout=30

echo "✅ Воркер очередей остановлен"
