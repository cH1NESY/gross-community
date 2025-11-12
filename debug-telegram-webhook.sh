#!/bin/bash

# Скрипт для диагностики проблем с Telegram webhook
# Использование: ./debug-telegram-webhook.sh

set -e

echo "🔍 Диагностика Telegram webhook..."

cd "$(dirname "$0")/backend"

# Проверяем, что Docker контейнер запущен
if ! docker ps | grep -q php-fpm-gross; then
    echo "❌ Docker контейнер php-fpm-gross не запущен"
    exit 1
fi

echo "1️⃣ Проверка .env файла..."
echo "APP_URL:"
docker exec php-fpm-gross grep "^APP_URL=" .env
echo ""
echo "TELEGRAM_BOT_TOKEN:"
docker exec php-fpm-gross grep "^TELEGRAM_BOT_TOKEN=" .env | sed 's/=.*/=***HIDDEN***/'
echo ""
echo "TELEGRAM_CHAT_ID:"
docker exec php-fpm-gross grep "^TELEGRAM_CHAT_ID=" .env

echo ""
echo "2️⃣ Проверка переменных в контейнере..."
docker exec php-fpm-gross php artisan tinker --execute="echo 'APP_URL: ' . env('APP_URL') . PHP_EOL; echo 'TELEGRAM_BOT_TOKEN: ' . (env('TELEGRAM_BOT_TOKEN') ? 'EXISTS' : 'NOT FOUND') . PHP_EOL; echo 'TELEGRAM_CHAT_ID: ' . (env('TELEGRAM_CHAT_ID') ? env('TELEGRAM_CHAT_ID') : 'NOT FOUND') . PHP_EOL;" 2>&1 | grep -v "Xdebug\|Cannot load\|Tinker"

echo ""
echo "3️⃣ Проверка webhook..."
docker exec php-fpm-gross php artisan telegram:check-webhook 2>&1 | grep -v "Xdebug\|Cannot load"

echo ""
echo "4️⃣ Последние 20 строк логов..."
docker exec php-fpm-gross tail -20 storage/logs/laravel.log | grep -i "telegram\|webhook\|error" || echo "Нет записей о Telegram/webhook"

echo ""
echo "5️⃣ Тест webhook endpoint..."
BOT_TOKEN=$(docker exec php-fpm-gross grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
if [ -n "$BOT_TOKEN" ]; then
    echo "Тестирую webhook..."
    curl -X POST https://grosscommunity.ru/api/telegram/webhook \
      -H "Content-Type: application/json" \
      -d "{\"update_id\":999999,\"message\":{\"message_id\":1,\"from\":{\"id\":123456789,\"is_bot\":false,\"first_name\":\"Test\"},\"chat\":{\"id\":123456789,\"first_name\":\"Test\",\"type\":\"private\"},\"date\":$(date +%s),\"text\":\"/start\"}}" \
      2>&1 | head -5
else
    echo "⚠️ TELEGRAM_BOT_TOKEN не найден"
fi

echo ""
echo "6️⃣ Проверка доступности webhook..."
curl -I https://grosscommunity.ru/api/telegram/webhook 2>&1 | head -3

echo ""
echo "✅ Диагностика завершена!"
echo ""
echo "📝 Если видите ошибки:"
echo "1. Проверьте логи: docker exec php-fpm-gross tail -f storage/logs/laravel.log"
echo "2. Запустите скрипт исправления: ./fix-telegram-bot.sh"
echo "3. Проверьте, что APP_URL правильный в .env"

