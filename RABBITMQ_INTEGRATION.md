# Интеграция RabbitMQ для SMS уведомлений

## 🚀 Настройка и запуск

### 1. Запуск сервисов
```bash
cd backend
docker-compose up -d
```

### 2. Настройка переменных окружения
Добавьте в `.env` файл:
```env
# RabbitMQ Configuration
RABBITMQ_HOST=rabbitmq-gross
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASS=password
RABBITMQ_VHOST=/

# SMS Configuration
SMS_PHONE_NUMBER=89243513155
SMS_PROVIDER_URL=https://api.sms.ru/sms/send
SMS_API_KEY=your-sms-api-key-here

# Queue Configuration
QUEUE_CONNECTION=rabbitmq
```

### 3. Запуск воркера очередей
```bash
./start-queue-worker.sh
```

### 4. Проверка работы
- Откройте форму регистрации
- Нажмите "Получить консультацию"
- Проверьте логи воркера и RabbitMQ Management UI (http://localhost:15672)

## 📱 Как это работает

1. **Пользователь** заполняет форму регистрации и нажимает "Получить консультацию"
2. **Frontend** отправляет POST запрос на `/api/consultation` с данными пользователя
3. **Backend** создает Job `SendConsultationSms` и отправляет его в очередь RabbitMQ
4. **Воркер очередей** обрабатывает Job и отправляет SMS на номер 89243513155
5. **SMS** содержит информацию о пользователе: имя, телефон, email, время заявки

## 🔧 Компоненты системы

### Backend
- **ConsultationController** - обработка запросов на консультацию
- **SendConsultationSms Job** - асинхронная отправка SMS
- **RabbitMQ** - очередь сообщений
- **Laravel Queue** - система очередей Laravel

### Frontend
- **ConsultationModal** - модальное окно для запроса консультации
- **JoinModal** - форма регистрации с кнопкой консультации
- **App.tsx** - управление состоянием модалов

## 📊 Мониторинг

### RabbitMQ Management UI
- URL: http://localhost:15672
- Логин: admin
- Пароль: password

### Логи воркера
```bash
docker logs -f php-fpm-gross
```

### Логи RabbitMQ
```bash
docker logs -f rabbitmq-gross
```

## 🛠️ Отладка

### Проверка подключения к RabbitMQ
```bash
docker exec php-fpm-gross php artisan tinker
>>> Queue::connection('rabbitmq')->size()
```

### Тестирование Job
```bash
docker exec php-fpm-gross php artisan tinker
>>> App\Jobs\SendConsultationSms::dispatch('Тест', '1234567890', 'test@example.com')
```

### Просмотр очередей
```bash
docker exec php-fpm-gross php artisan queue:monitor
```

## 🔒 Безопасность

- SMS API ключ хранится в переменных окружения
- Все запросы валидируются
- Ошибки логируются, но не показываются пользователю
- Таймауты предотвращают зависание системы

## 📝 Формат SMS

```
Новая заявка на консультацию!
Имя: [Имя пользователя]
Телефон: [Телефон пользователя]
Email: [Email пользователя]
Время: [Дата и время заявки]
```
