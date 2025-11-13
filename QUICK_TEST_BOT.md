# 🧪 Быстрый тест бота

## Текущий статус

✅ **Файл логов создан** - `storage/logs/telegram-webhook.log`
✅ **Права настроены** - файл доступен для записи
✅ **Webhook работает** - возвращает `{"ok":true}`

## Тестирование

### Шаг 1: Проверьте логи в реальном времени

```bash
docker exec php-fpm-gross tail -f storage/logs/telegram-webhook.log
```

### Шаг 2: Откройте бота в Telegram

1. Откройте Telegram
2. Найдите бота: `@grosscbot` или `https://t.me/grosscbot`
3. Нажмите "Start" или отправьте `/start`

### Шаг 3: Смотрите логи

В другом терминале вы должны увидеть записи:
```
2025-11-13 XX:XX:XX - Webhook received
2025-11-13 XX:XX:XX - Update received: update_id=XXXX, has_message=yes, has_callback_query=no
2025-11-13 XX:XX:XX - Processing message: text=/start, chat_id=XXXX
2025-11-13 XX:XX:XX - Sending welcome message to chat_id=XXXX
2025-11-13 XX:XX:XX - Message sent successfully: chat_id=XXXX, message_id=XXXX
2025-11-13 XX:XX:XX - Welcome message sent: success
2025-11-13 XX:XX:XX - Message processed successfully
```

### Шаг 4: Проверьте ответ бота

Бот должен ответить:
```
👋 Привет! Я бот для проверки подписки на сообщество GROSS Community.

Используйте команду /start check_<url> для проверки подписки.
```

## Если бот не отвечает

### Проверка 1: Проверьте логи

```bash
docker exec php-fpm-gross tail -50 storage/logs/telegram-webhook.log
```

### Проверка 2: Проверьте webhook

```bash
docker exec php-fpm-gross php artisan telegram:check-webhook
```

### Проверка 3: Проверьте токен

```bash
BOT_TOKEN=$(docker exec php-fpm-gross grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
curl "https://api.telegram.org/bot${BOT_TOKEN}/getMe"
```

### Проверка 4: Тест отправки сообщения

```bash
BOT_TOKEN=$(docker exec php-fpm-gross grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
CHAT_ID=YOUR_CHAT_ID  # Замените на ваш chat_id
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d "chat_id=${CHAT_ID}&text=Test message"
```

## Проверка работы webhook

### Тест 1: Тест webhook endpoint

```bash
curl -X POST https://grosscommunity.ru/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"update_id":123456,"message":{"message_id":1,"from":{"id":123456789},"chat":{"id":123456789},"text":"/start"}}'
```

Должно вернуть: `{"ok":true}`

После этого проверьте логи:
```bash
docker exec php-fpm-gross tail -10 storage/logs/telegram-webhook.log
```

### Тест 2: Проверка логов Laravel

```bash
docker exec php-fpm-gross tail -20 storage/logs/laravel.log | grep -i telegram
```

## Важно

- ✅ **Файл логов создан** - `storage/logs/telegram-webhook.log`
- ✅ **Права настроены** - файл доступен для записи
- ✅ **Webhook всегда возвращает 200** - даже при ошибках
- ✅ **Все действия логируются** - подробное логирование всех операций

## Готово!

Бот готов к тестированию. Отправьте `/start` в боте и проверьте логи в реальном времени.

Если что-то не работает, проверьте логи:
```bash
docker exec php-fpm-gross tail -f storage/logs/telegram-webhook.log
```

