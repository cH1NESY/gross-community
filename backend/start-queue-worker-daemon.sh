#!/bin/bash

# Скрипт для запуска воркера очередей Laravel с RabbitMQ в фоновом режиме

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

# Проверяем, не запущен ли уже воркер
if docker exec php-fpm-gross ps aux | grep -q "[q]ueue:work rabbitmq"; then
    echo "⚠️  Воркер очередей уже запущен"
    echo "Чтобы остановить: docker exec php-fpm-gross pkill -f 'queue:work rabbitmq'"
    exit 1
fi

# Запускаем воркер в фоновом режиме через nohup
echo "🔄 Запуск воркера очередей в фоновом режиме..."
docker exec php-fpm-gross sh -c "nohup php artisan queue:work rabbitmq --verbose --tries=3 --timeout=30 --sleep=3 --max-jobs=1000 > /dev/null 2>&1 &"

# Ждем немного и проверяем
sleep 2

if docker exec php-fpm-gross ps aux | grep -q "[q]ueue:work rabbitmq"; then
    echo "✅ Воркер очередей запущен в фоновом режиме"
    echo "📋 Для просмотра логов: docker logs -f php-fpm-gross"
    echo "📊 Для проверки статуса: docker exec php-fpm-gross ps aux | grep queue:work"
    echo "🛑 Для остановки: docker exec php-fpm-gross pkill -f 'queue:work rabbitmq'"
else
    echo "❌ Ошибка при запуске воркера"
    echo "💡 Попробуйте запустить вручную: docker exec -it php-fpm-gross php artisan queue:work rabbitmq --verbose"
    exit 1
fi
