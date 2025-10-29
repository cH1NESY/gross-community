#!/bin/bash

# Скрипт для прямого тестирования отправки SMS через SMS.ru API

echo "🧪 Тестирование отправки SMS через SMS.ru..."
echo ""

# Проверяем наличие API ключа
API_KEY=$(docker exec php-fpm-gross grep SMS_API_KEY /var/www/html/.env | cut -d '=' -f2 | tr -d ' ')

if [ -z "$API_KEY" ] || [ "$API_KEY" == "your-sms-api-key-here" ]; then
    echo "❌ SMS_API_KEY не настроен в .env файле"
    echo "💡 Добавьте SMS_API_KEY=ваш-api-id в .env"
    exit 1
fi

PHONE=$(docker exec php-fpm-gross grep SMS_PHONE_NUMBER /var/www/html/.env | cut -d '=' -f2 | tr -d ' ')

if [ -z "$PHONE" ]; then
    PHONE="89243513155"
fi

echo "📱 Отправка тестового SMS на номер: $PHONE"
echo "🔑 Используется API ключ: ${API_KEY:0:10}..."
echo ""

# Отправляем тестовый Job
docker exec php-fpm-gross php artisan tinker --execute="
use App\Jobs\SendConsultationSms;
use Illuminate\Support\Facades\Log;

try {
    echo '📤 Отправка Job в очередь...' . PHP_EOL;
    \$job = SendConsultationSms::dispatch('Тестовый Пользователь', '+79991234567', 'test@example.com');
    echo '✅ Job успешно отправлен в очередь!' . PHP_EOL;
    echo '📋 Job ID: ' . (\$job->getJobId() ?? 'N/A') . PHP_EOL;
    echo '' . PHP_EOL;
    echo '⏳ Ожидание обработки (5 секунд)...' . PHP_EOL;
    sleep(5);
    echo '' . PHP_EOL;
    echo '📊 Проверка логов:' . PHP_EOL;
    echo '   docker logs php-fpm-gross | grep -i sms | tail -10' . PHP_EOL;
    echo '' . PHP_EOL;
    echo '💡 Если SMS не отправилось, проверьте:' . PHP_EOL;
    echo '   1. Запущен ли воркер: docker exec php-fpm-gross ps aux | grep queue:work' . PHP_EOL;
    echo '   2. Логи Laravel: docker exec php-fpm-gross tail -20 storage/logs/laravel.log' . PHP_EOL;
    echo '   3. Баланс на SMS.ru: https://sms.ru/my/balance' . PHP_EOL;
} catch (\Exception \$e) {
    echo '❌ Ошибка: ' . \$e->getMessage() . PHP_EOL;
}
"

echo ""
echo "✅ Тест завершен!"
