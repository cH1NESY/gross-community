#!/bin/bash

# Скрипт для тестирования отправки SMS уведомлений

echo "🧪 Тестирование системы отправки SMS уведомлений..."
echo ""

# Проверяем подключение к RabbitMQ
echo "1️⃣ Проверка подключения к RabbitMQ..."
docker exec php-fpm-gross php artisan queue:status

echo ""
echo "2️⃣ Отправка тестового Job в очередь..."
docker exec php-fpm-gross php artisan tinker --execute="
use App\Jobs\SendConsultationSms;
use Illuminate\Support\Facades\Log;

try {
    \$job = SendConsultationSms::dispatch('Тестовый Пользователь', '+79991234567', 'test@example.com');
    echo '✅ Job отправлен в очередь с ID: ' . \$job->getJobId() . PHP_EOL;
    echo '📋 Проверьте логи: docker logs -f php-fpm-gross' . PHP_EOL;
    echo '📊 Проверьте RabbitMQ: http://localhost:15672' . PHP_EOL;
} catch (\Exception \$e) {
    echo '❌ Ошибка: ' . \$e->getMessage() . PHP_EOL;
}
"

echo ""
echo "3️⃣ Проверка размера очереди через 2 секунды..."
sleep 2
docker exec php-fpm-gross php artisan queue:status

echo ""
echo "✅ Тест завершен!"
echo ""
echo "📋 Для просмотра логов воркера:"
echo "   docker logs -f php-fpm-gross | grep -i 'sms\|consultation\|queue'"
echo ""
echo "📊 Для просмотра RabbitMQ Management UI:"
echo "   Откройте http://localhost:15672 (admin/password)"
echo ""
echo "🔄 Для запуска воркера очередей:"
echo "   ./start-queue-worker-daemon.sh"
