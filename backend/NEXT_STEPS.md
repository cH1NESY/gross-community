# 📋 Следующие шаги для завершения интеграции SMS уведомлений

## ✅ Что уже сделано:

1. ✅ RabbitMQ добавлен в docker-compose.yml
2. ✅ Установлен пакет laravel-queue-rabbitmq
3. ✅ Настроена конфигурация очередей
4. ✅ Создан Job SendConsultationSms с явным указанием соединения RabbitMQ
5. ✅ Создан контроллер ConsultationController
6. ✅ Добавлен API endpoint `/api/consultation`
7. ✅ Обновлен фронтенд для отправки запросов
8. ✅ Созданы скрипты для запуска воркера
9. ✅ Создана команда для проверки статуса очереди
10. ✅ Создан тестовый скрипт

## 🚀 Что нужно сделать сейчас:

### Шаг 1: Добавить переменные в .env

Добавьте в `.env` файл (если еще не добавили):

```env
# RabbitMQ Configuration
RABBITMQ_HOST=rabbitmq-gross
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASS=password
RABBITMQ_VHOST=/

# SMS Configuration
SMS_PHONE_NUMBER=89243513155
SMS_PROVIDER_URL=https://sms.ru/sms/send
SMS_API_KEY=your-sms-api-key-here

# Queue Configuration
QUEUE_CONNECTION=rabbitmq
```

**Важно:** Замените `your-sms-api-key-here` на реальный API ключ вашего SMS провайдера.

### Шаг 2: Перезапустить контейнеры (если нужно)

```bash
cd backend
docker-compose restart
```

### Шаг 3: Запустить воркер очередей

**Для разработки (интерактивный режим):**
```bash
cd backend
./start-queue-worker.sh
```

**Для production (фоновый режим):**
```bash
cd backend
./start-queue-worker-daemon.sh
```

### Шаг 4: Протестировать систему

```bash
cd backend
./test-sms-system.sh
```

Или вручную через форму на сайте:
1. Откройте сайт
2. Заполните форму регистрации
3. Нажмите "Получить консультацию"
4. Проверьте логи воркера

### Шаг 5: Проверить статус

```bash
docker exec php-fpm-gross php artisan queue:status
```

### Шаг 6: Мониторинг

**RabbitMQ Management UI:**
- URL: http://localhost:15672
- Логин: admin
- Пароль: password

**Логи воркера:**
```bash
docker logs -f php-fpm-gross | grep -i 'sms\|consultation\|queue'
```

**Логи Laravel:**
```bash
docker exec php-fpm-gross tail -f storage/logs/laravel.log
```

## 🔧 Настройка SMS провайдера

### Вариант 1: Использовать SMS.ru (рекомендуется)

1. Зарегистрируйтесь на https://sms.ru
2. Получите API_ID из личного кабинета
3. Добавьте в `.env`:
   ```env
   SMS_API_KEY=ваш-api-id-здесь
   SMS_PROVIDER_URL=https://sms.ru/sms/send
   SMS_PHONE_NUMBER=89243513155
   ```

**Важно:** 
- API_ID находится в личном кабинете SMS.ru
- Номер телефона должен быть в формате: 79243513155 (без + и пробелов)
- URL правильный: `https://sms.ru/sms/send` (не `api.sms.ru`)

### Вариант 2: Использовать другой провайдер

Измените метод `sendSms()` в `app/Jobs/SendConsultationSms.php` под API вашего провайдера.

### Вариант 3: Только логирование (для тестирования)

Оставьте `SMS_API_KEY` пустым в `.env`:
```env
SMS_API_KEY=
```

В этом случае SMS будут только логироваться, но не отправляться.

## 📊 Проверка работы

### Проверка 1: Job отправляется в очередь
```bash
docker exec php-fpm-gross php artisan tinker
>>> App\Jobs\SendConsultationSms::dispatch('Тест', '79991234567', 'test@example.com')
```

### Проверка 2: Проверка очереди
```bash
docker exec php-fpm-gross php artisan queue:status
```

### Проверка 3: Проверка RabbitMQ
Откройте http://localhost:15672 и проверьте:
- Queues → default (должна быть очередь)
- Overview → Messages (количество сообщений)

## 🐛 Возможные проблемы и решения

### Проблема: Воркер не обрабатывает задачи

**Решение:**
1. Проверьте, что воркер запущен: `docker exec php-fpm-gross ps aux | grep queue:work`
2. Проверьте логи: `docker logs -f php-fpm-gross`
3. Перезапустите воркер: `./start-queue-worker-daemon.sh`

### Проблема: RabbitMQ недоступен

**Решение:**
```bash
docker-compose up -d rabbitmq
docker ps | grep rabbitmq
```

### Проблема: SMS не отправляются

**Решение:**
1. Проверьте, что `SMS_API_KEY` установлен в `.env`
2. Проверьте логи: `docker exec php-fpm-gross tail -f storage/logs/laravel.log`
3. Проверьте, что воркер обрабатывает задачи

## 📝 Следующие улучшения (опционально)

1. **Добавить уведомления по email** (в дополнение к SMS)
2. **Добавить веб-хуки** для других систем уведомлений
3. **Добавить метрики** и мониторинг через Prometheus/Grafana
4. **Добавить retry механизм** с экспоненциальным backoff
5. **Добавить очередь приоритетов** для срочных уведомлений
6. **Добавить API для просмотра истории** отправленных уведомлений
