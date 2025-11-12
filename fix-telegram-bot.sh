#!/bin/bash

# Скрипт для полного исправления Telegram бота
# Использование: ./fix-telegram-bot.sh

set -e

echo "🔧 Исправление Telegram бота..."

cd "$(dirname "$0")/backend"

# Проверяем, что Docker контейнер запущен
if ! docker ps | grep -q php-fpm-gross; then
    echo "❌ Docker контейнер php-fpm-gross не запущен"
    echo "Запустите: docker-compose up -d"
    exit 1
fi

echo "📝 Шаг 1: Обновление APP_URL в .env..."

# Обновляем APP_URL в .env (на хосте, так как volume монтируется)
sed -i 's|APP_URL=http://localhost|APP_URL=https://grosscommunity.ru|g' .env
sed -i 's|APP_URL=http://127.0.0.1|APP_URL=https://grosscommunity.ru|g' .env

# Если APP_URL все еще не правильный, устанавливаем его явно
if ! grep -q "^APP_URL=https://grosscommunity.ru" .env; then
    # Удаляем старую строку APP_URL
    sed -i '/^APP_URL=/d' .env
    # Добавляем правильную строку
    echo "APP_URL=https://grosscommunity.ru" >> .env
fi

# Проверяем, что изменение применилось
APP_URL=$(grep "^APP_URL=" .env | cut -d'=' -f2)
echo "APP_URL в .env: $APP_URL"

if [[ "$APP_URL" != "https://grosscommunity.ru" ]]; then
    echo "⚠️ APP_URL все еще не правильный: $APP_URL"
    echo "Установка правильного значения..."
    sed -i 's|^APP_URL=.*|APP_URL=https://grosscommunity.ru|g' .env
    APP_URL=$(grep "^APP_URL=" .env | cut -d'=' -f2)
    echo "APP_URL после исправления: $APP_URL"
fi

echo ""
echo "🧹 Шаг 2: Очистка кеша..."

# Очищаем все кеши
docker exec php-fpm-gross php artisan config:clear 2>&1 | grep -v "Xdebug\|Cannot load" || true
docker exec php-fpm-gross php artisan cache:clear 2>&1 | grep -v "Xdebug\|Cannot load" || true
docker exec php-fpm-gross php artisan route:clear 2>&1 | grep -v "Xdebug\|Cannot load" || true
docker exec php-fpm-gross php artisan view:clear 2>&1 | grep -v "Xdebug\|Cannot load" || true

# Удаляем закешированные конфигурационные файлы
docker exec php-fpm-gross rm -f bootstrap/cache/config.php 2>&1 || true

echo "✅ Кеш очищен"

echo ""
echo "🔄 Шаг 3: Перезапуск контейнера..."

# Перезапускаем контейнер
docker-compose restart php-fpm

echo "✅ Контейнер перезапущен"

echo ""
echo "⏳ Ожидание запуска контейнера..."
sleep 5

echo ""
echo "📡 Шаг 4: Переустановка webhook..."

# Переустанавливаем webhook (игнорируем предупреждения о HTTPS для локального тестирования)
docker exec php-fpm-gross php artisan telegram:set-webhook 2>&1 | grep -v "Xdebug\|Cannot load" || {
    echo "⚠️ Не удалось установить webhook автоматически"
    echo "Проверьте, что APP_URL=https://grosscommunity.ru в .env"
}

echo ""
echo "🔍 Шаг 5: Проверка webhook..."

# Проверяем webhook
docker exec php-fpm-gross php artisan telegram:check-webhook 2>&1 | grep -v "Xdebug\|Cannot load"

echo ""
echo "✅ Готово!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Откройте бота: https://t.me/grosscbot"
echo "2. Отправьте /start"
echo "3. Бот должен ответить приветственным сообщением"
echo ""
echo "📊 Для проверки логов:"
echo "docker exec php-fpm-gross tail -f storage/logs/laravel.log"

