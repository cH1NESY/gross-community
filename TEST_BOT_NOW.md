# 🧪 Тестирование бота - Пошаговая инструкция

## Текущий статус

✅ **Webhook работает** - тест возвращает `{"ok":true}`
✅ **APP_URL правильный** - `https://grosscommunity.ru`
✅ **Токен настроен** - `TELEGRAM_BOT_TOKEN` существует
✅ **Chat ID настроен** - `TELEGRAM_CHAT_ID` установлен
✅ **Pending updates: 0** - все обновления обработаны
⚠️ **Последняя ошибка была** в 22:50:24 (это было до наших исправлений)

## Что было добавлено

1. ✅ **Детальное логирование** - все действия логируются в `storage/logs/telegram-webhook.log`
2. ✅ **Безопасная обработка ошибок** - все исключения ловятся
3. ✅ **Улучшенная отправка сообщений** - добавлены таймауты и проверки

## Тестирование бота

### Шаг 1: Проверьте логи в реальном времени

```bash
docker exec php-fpm-gross tail -f storage/logs/telegram-webhook.log
```

Этот файл будет показывать все запросы к webhook в реальном времени.

### Шаг 2: Откройте бота

1. Откройте Telegram
2. Найдите бота: `@grosscbot` или `https://t.me/grosscbot`
3. Нажмите "Start" или отправьте `/start`

### Шаг 3: Смотрите логи

В другом терминале смотрите логи:
```bash
docker exec php-fpm-gross tail -f storage/logs/telegram-webhook.log
```

Вы должны увидеть:
```
2025-11-13 XX:XX:XX - Webhook received
2025-11-13 XX:XX:XX - Update received: update_id=XXXX, has_message=yes, has_callback_query=no
2025-11-13 XX:XX:XX - Processing message: text=/start, chat_id=XXXX
2025-11-13 XX:XX:XX - Sending welcome message to chat_id=XXXX
2025-11-13 XX:XX:XX - Message sent successfully: chat_id=XXXX, message_id=XXXX
2025-11-13 XX:XX:XX - Message processed successfully
```

### Шаг 4: Проверьте ответ бота

Бот должен ответить:
```
👋 Привет! Я бот для проверки подписки на сообщество GROSS Community.

Используйте команду /start check_<url> для проверки подписки.
```

## Если бот не отвечает

### Проблема 1: Логи не появляются

**Решение:**

1. Проверьте права доступа к файлу логов:
```bash
docker exec php-fpm-gross ls -la storage/logs/telegram-webhook.log
```

2. Если файл не существует, создайте его:
```bash
docker exec php-fpm-gross touch storage/logs/telegram-webhook.log
docker exec php-fpm-gross chmod 666 storage/logs/telegram-webhook.log
```

3. Проверьте права на директорию:
```bash
docker exec php-fpm-gross chmod -R 775 storage/logs
```

### Проблема 2: Бот не отвечает, но логи показывают запросы

**Решение:**

1. Проверьте токен:
```bash
BOT_TOKEN=$(docker exec php-fpm-gross grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
curl "https://api.telegram.org/bot${BOT_TOKEN}/getMe"
```

2. Проверьте, что бот может отправлять сообщения:
```bash
BOT_TOKEN=$(docker exec php-fpm-gross grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
CHAT_ID=$(docker exec php-fpm-gross grep "^TELEGRAM_CHAT_ID=" .env | cut -d'=' -f2)
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d "chat_id=${CHAT_ID}&text=Test message"
```

### Проблема 3: Ошибки в логах

**Решение:**

1. Проверьте логи:
```bash
docker exec php-fpm-gross tail -50 storage/logs/telegram-webhook.log
```

2. Найдите ошибку
3. Исправьте проблему
4. Перезапустите контейнер:
```bash
docker-compose restart php-fpm
```

## Проверка работы

### Тест 1: Проверка webhook endpoint

```bash
curl -X POST https://grosscommunity.ru/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"update_id":123456,"message":{"message_id":1,"from":{"id":123456789},"chat":{"id":123456789},"text":"/start"}}'
```

Должно вернуть: `{"ok":true}`

После этого проверьте логи:
```bash
docker exec php-fpm-gross tail -20 storage/logs/telegram-webhook.log
```

Должны появиться записи о получении и обработке сообщения.

### Тест 2: Проверка бота

1. Откройте бота: `https://t.me/grosscbot`
2. Отправьте `/start`
3. Бот должен ответить приветственным сообщением
4. Проверьте логи:
```bash
docker exec php-fpm-gross tail -20 storage/logs/telegram-webhook.log
```

### Тест 3: Проверка отправки сообщений

```bash
BOT_TOKEN=$(docker exec php-fpm-gross grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  -d "chat_id=YOUR_CHAT_ID&text=Test message"
```

Замените `YOUR_CHAT_ID` на ваш реальный chat_id.

## Важно

- ✅ **Логи теперь записываются в `storage/logs/telegram-webhook.log`**
- ✅ **Все действия логируются подробно**
- ✅ **Ошибки логируются с полной информацией**
- ✅ **Webhook всегда возвращает 200 OK**

## Готово!

После тестирования бот должен работать правильно. Если что-то не работает, проверьте логи:

```bash
docker exec php-fpm-gross tail -f storage/logs/telegram-webhook.log
```

И отправьте `/start` в бота - вы должны увидеть все действия в реальном времени.

