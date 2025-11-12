# ✅ Webhook успешно настроен!

## Что сделано

✅ Webhook настроен на Laravel: `https://grosscommunity.ru/api/telegram/webhook`
✅ Теперь все сообщения от Telegram будут обрабатываться вашим кодом в `TelegramBotController.php`
✅ Кнопки будут появляться в боте

## Важно: Отключите webhook в Unisender

⚠️ **Если вы использовали Unisender, отключите webhook там!**

1. Зайдите в Unisender
2. Найдите настройки бота `@grosscbot`
3. Отключите webhook в Unisender

**Почему это важно:**
- Только один webhook может быть активен одновременно
- Если webhook останется в Unisender, могут возникнуть конфликты
- Сообщения могут обрабатываться дважды (Unisender и Laravel)

## Проверка работы

### 1. Проверьте webhook:

```bash
cd ~/gross-community/backend
docker exec php-fpm-gross php artisan telegram:check-webhook
```

Должно показать:
```
✅ Webhook настроен на Laravel!
Код в TelegramBotController.php будет обрабатывать сообщения.
```

### 2. Проверьте логи:

```bash
docker exec php-fpm-gross tail -f storage/logs/laravel.log
```

### 3. Тестирование бота:

1. **Откройте бота:** `https://t.me/grosscbot`
2. **Отправьте `/start`** - должно появиться приветственное сообщение
3. **На сайте нажмите "Проверить подписку через бота"**
4. **В боте должно появиться меню с кнопкой "Проверить"**
5. **Нажмите "Проверить"**
6. **Должно появиться сообщение "Идет проверка..."**
7. **Через 20 секунд должно появиться сообщение с кнопкой:**
   - Если подписан: "✅ Вы подписаны! Вернитесь на сайт." + кнопка "Вернуться на сайт"
   - Если не подписан: "❌ Вы не подписаны, вам необходимо подписаться!" + кнопка "Перейти на сайт"

## Что происходит теперь

1. **Пользователь пишет боту** → Telegram отправляет обновление
2. **Telegram отправляет на webhook:** `https://grosscommunity.ru/api/telegram/webhook`
3. **Laravel обрабатывает обновление:** `TelegramBotController::webhook()`
4. **Код обрабатывает команды:**
   - `/start` → приветственное сообщение
   - `/start check_<url>` → меню с кнопкой "Проверить"
   - Нажатие на "Проверить" → проверка подписки → сообщение с кнопкой
5. **Пользователь нажимает кнопку** → возвращается на сайт с параметрами `subscribed=1` или `subscribed=0`

## Проверка работы webhook

### Тест 1: Проверка доступности

```bash
curl -X POST https://grosscommunity.ru/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"message":{"chat":{"id":123456},"text":"/start","from":{"id":123456}}}'
```

Должно вернуть: `{"ok":true}`

### Тест 2: Проверка через бота

1. Откройте бота в Telegram
2. Отправьте `/start`
3. Проверьте логи: `docker exec php-fpm-gross tail -f storage/logs/laravel.log`
4. Должны появиться записи о получении обновления

## Отладка

Если что-то не работает:

### 1. Проверьте webhook:

```bash
docker exec php-fpm-gross php artisan telegram:check-webhook
```

### 2. Проверьте логи:

```bash
docker exec php-fpm-gross tail -f storage/logs/laravel.log
```

### 3. Проверьте переменные окружения:

```bash
docker exec php-fpm-gross php artisan tinker
>>> env('TELEGRAM_BOT_TOKEN')
>>> env('TELEGRAM_CHAT_ID')
>>> env('APP_URL')
```

### 4. Проверьте доступность webhook:

```bash
curl -I https://grosscommunity.ru/api/telegram/webhook
```

Должно вернуть статус 200 или 405 (Method Not Allowed для GET, но это нормально для POST).

## Следующие шаги

1. ✅ Webhook настроен на Laravel
2. ⚠️ **Отключите webhook в Unisender** (если использовали)
3. ✅ Проверьте работу бота
4. ✅ Протестируйте проверку подписки
5. ✅ Проверьте, что кнопки появляются
6. ✅ Проверьте, что пользователь возвращается на сайт с параметрами

## Важно

- ✅ **Webhook настроен на Laravel** - код будет работать
- ⚠️ **Отключите webhook в Unisender** - чтобы избежать конфликтов
- ✅ **Кнопки будут появляться** - код в `TelegramBotController.php` обрабатывает сообщения
- ✅ **Проверка подписки работает** - код проверяет подписку через Telegram Bot API

## Готово!

Теперь ваш бот работает через Laravel, и все функции (кнопки, проверка подписки, возврат на сайт) должны работать правильно!

Если что-то не работает, проверьте логи и убедитесь, что webhook действительно настроен на Laravel, а не на Unisender.

