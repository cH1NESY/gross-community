# 🧪 Инструкция по тестированию SMS уведомлений

## ✅ Быстрый тест (рекомендуется)

```bash
cd backend
./test-sms-direct.sh
```

## 📋 Пошаговая проверка

### Шаг 1: Проверка настроек

Убедитесь, что в `.env` правильно указаны:
```env
QUEUE_CONNECTION=rabbitmq
SMS_API_KEY=ваш-api-id-от-sms.ru
SMS_PHONE_NUMBER=89243513155
SMS_PROVIDER_URL=https://sms.ru/sms/send
```

### Шаг 2: Перезагрузка конфигурации

```bash
docker exec php-fpm-gross php artisan config:clear
docker exec php-fpm-gross php artisan cache:clear
```

### Шаг 3: Запуск воркера очередей

**Важно:** Воркер должен быть запущен для обработки задач!

```bash
cd backend
./start-queue-worker-daemon.sh
```

Проверьте, что воркер запущен:
```bash
docker exec php-fpm-gross ps aux | grep queue:work
```

### Шаг 4: Отправка тестового SMS

```bash
cd backend
./test-sms-direct.sh
```

Или вручную через Tinker:
```bash
docker exec php-fpm-gross php artisan tinker
>>> App\Jobs\SendConsultationSms::dispatch('Тест', '79991234567', 'test@example.com')
```

### Шаг 5: Проверка логов

```bash
# Логи Laravel (SMS отправка)
docker exec php-fpm-gross tail -f storage/logs/laravel.log | grep -i sms

# Все логи воркера
docker logs -f php-fpm-gross | grep -i 'sms\|consultation\|queue'
```

### Шаг 6: Проверка через сайт

1. Откройте сайт
2. Заполните форму регистрации
3. Нажмите "Получить консультацию"
4. Проверьте логи и SMS на телефоне

## 🔍 Проверка статуса

### Проверка очереди
```bash
docker exec php-fpm-gross php artisan queue:status
```

### Проверка RabbitMQ Management UI
Откройте http://localhost:15672 и проверьте:
- Queues → default (должна быть очередь)
- Overview → Messages

### Проверка баланса SMS.ru
Откройте https://sms.ru/my/balance и проверьте баланс

## ❗ Возможные проблемы

### SMS не отправляется

**Проверьте:**
1. Запущен ли воркер: `docker exec php-fpm-gross ps aux | grep queue:work`
2. Правильность API ключа в `.env`
3. Баланс на SMS.ru (минимум 5 рублей)
4. Формат номера телефона (должен быть 79243513155 без + и пробелов)
5. Логи: `docker exec php-fpm-gross tail -50 storage/logs/laravel.log`

### Ошибка "ACCESS_REFUSED" в RabbitMQ

**Решение:**
```bash
# Проверьте переменные в .env
docker exec php-fpm-gross grep RABBITMQ /var/www/html/.env

# Перезапустите RabbitMQ
docker-compose restart rabbitmq
```

### Job не обрабатывается

**Решение:**
```bash
# Остановите старый воркер
docker exec php-fpm-gross pkill -f 'queue:work rabbitmq'

# Запустите новый
./start-queue-worker-daemon.sh
```

## 📱 Формат SMS сообщения

После успешной отправки на номер **89243513155** придет SMS:

```
Новая заявка на консультацию!
Имя: [Имя пользователя]
Телефон: [Телефон пользователя]
Email: [Email пользователя]
Время: [Дата и время заявки]
```

## ✅ Признаки успешной отправки

1. В логах Laravel: `SMS успешно отправлено через SMS.ru`
2. В RabbitMQ Management UI: очередь пуста (задачи обработаны)
3. На телефоне приходит SMS сообщение
4. В логах есть баланс после отправки

## 🎯 Готово к использованию!

После успешного теста система готова к работе. Все запросы на консультацию через форму будут автоматически отправлять SMS уведомления на номер 89243513155!
