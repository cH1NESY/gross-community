# Настройка Telegram бота для проверки подписки

## Что реализовано:

1. ✅ Обработка команды `/start check_<return_url>`
2. ✅ Меню с кнопкой "Проверить"
3. ✅ Проверка подписки пользователя в группе через Telegram Bot API
4. ✅ Возврат пользователя на сайт с параметрами `subscribed=1` или `subscribed=0`
5. ✅ Webhook для получения обновлений от Telegram

## Сценарий работы бота:

1. Пользователь нажимает "Проверить подписку через бота" на сайте
2. Открывается бот с параметром `/start check_<return_url>`
3. Бот показывает меню с кнопкой "Проверить"
4. Пользователь нажимает "Проверить"
5. Бот отправляет сообщение "Идет проверка..."
6. Бот ждет 20 секунд (задержка из сценария)
7. Бот проверяет подписку в группе через Telegram Bot API
8. Бот отправляет результат:
   - Если подписан: "✅ Вы подписаны! Вернитесь на сайт." с кнопкой "Вернуться на сайт"
   - Если не подписан: "❌ Вы не подписаны, вам необходимо подписаться!" с кнопкой "Перейти на сайт"
9. При нажатии на кнопку пользователь возвращается на сайт с параметрами:
   - `subscribed=1` если подписан
   - `subscribed=0` если не подписан
10. Сайт обрабатывает параметры и показывает соответствующую модалку:
    - Если подписан: окно для создания пароля и реферальная ссылка
    - Если не подписан: сообщение об оплате

## Настройка на сервере:

### 1. Добавьте переменные в `.env`:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
TELEGRAM_BOT_USERNAME=grosscbot
TELEGRAM_GROUP_LINK=https://t.me/+tTW-bBfMvyI0ZTE1
APP_URL=https://your-domain.com
TELEGRAM_CHECK_DELAY=20  # Задержка перед проверкой в секундах (по умолчанию 20)
```

### 2. Установите webhook:

```bash
cd ~/gross-community/backend
docker exec php-fpm-gross php artisan telegram:set-webhook
```

Или вручную через curl:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-domain.com/api/telegram/webhook" \
  -d "allowed_updates=[\"message\",\"callback_query\"]"
```

### 3. Проверьте webhook:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### 4. Перезапустите контейнеры:

```bash
cd ~/gross-community/backend
docker-compose restart php-fpm
```

## Требования:

- ✅ Telegram бот создан через @BotFather
- ✅ Бот добавлен в группу как администратор
- ✅ Бот имеет права на просмотр участников группы
- ✅ ID группы получен и добавлен в `.env` как `TELEGRAM_CHAT_ID`
- ✅ Webhook настроен и работает

## Проверка работы:

1. Откройте бота в Telegram: `https://t.me/grosscbot`
2. Отправьте команду `/start`
3. Бот должен ответить приветственным сообщением

4. На сайте откройте страницу проверки подписки
5. Нажмите "Проверить подписку через бота"
6. В боте нажмите "Проверить"
7. Бот должен проверить подписку и отправить результат с кнопкой
8. При нажатии на кнопку вы должны вернуться на сайт с параметрами

## Структура файлов:

1. `backend/app/Http/Controllers/Api/TelegramBotController.php` - контроллер для обработки webhook
2. `backend/app/Console/Commands/SetTelegramWebhook.php` - команда для установки webhook
3. `backend/routes/api.php` - маршрут для webhook: `POST /api/telegram/webhook`
4. `frontend/src/pages/CheckSubscription.tsx` - страница проверки подписки
5. `frontend/src/pages/Payment.tsx` - обработка возврата с бота

## API Endpoints:

- **Webhook**: `POST /api/telegram/webhook` - принимает обновления от Telegram
- **Health Check**: `GET /api/health` - проверка работы API

## Важно:

- ⚠️ Webhook должен быть доступен по HTTPS (Telegram требует SSL)
- ⚠️ Бот должен быть администратором группы для проверки участников
- ⚠️ ID группы всегда отрицательное число для групп (например: `-1001234567890`)
- ⚠️ Задержка проверки настраивается через `TELEGRAM_CHECK_DELAY` в `.env` (по умолчанию 20 секунд, как в сценарии)

## Отладка:

Если бот не работает:

1. Проверьте логи Laravel:
```bash
docker exec php-fpm-gross tail -f storage/logs/laravel.log
```

2. Проверьте webhook:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

3. Проверьте переменные окружения:
```bash
docker exec php-fpm-gross php artisan tinker
>>> env('TELEGRAM_BOT_TOKEN')
>>> env('TELEGRAM_CHAT_ID')
```

4. Проверьте доступность webhook:
```bash
curl -X POST "https://your-domain.com/api/telegram/webhook" \
  -H "Content-Type: application/json" \
  -d '{"message":{"chat":{"id":123456},"text":"/start","from":{"id":123456}}}'
```

## Безопасность:

- Webhook endpoint публичный, но проверяет подпись Telegram (опционально)
- Рекомендуется использовать SSL для webhook
- Можно добавить проверку IP адресов Telegram (https://core.telegram.org/bots/webhooks#the-short-version)

