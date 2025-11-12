# Быстрое исправление: Почему кнопки не появляются в боте

## Проблема

Если вы настраиваете бота через **Unisender**, то webhook настроен на **Unisender**, а не на ваше Laravel приложение. Поэтому код в `TelegramBotController.php` **не выполняется**.

## Решение

### Шаг 1: Проверьте текущий webhook

```bash
cd ~/gross-community/backend
docker exec php-fpm-gross php artisan telegram:check-webhook
```

Команда покажет:
- ✅ Куда настроен webhook (Unisender или Laravel)
- ⚠️ Есть ли ошибки
- 📡 URL webhook

### Шаг 2: Переключите webhook на Laravel

Если webhook настроен на Unisender, выполните:

```bash
cd ~/gross-community/backend
docker exec php-fpm-gross php artisan telegram:set-webhook
```

### Шаг 3: Отключите webhook в Unisender

1. Зайдите в Unisender
2. Найдите настройки бота
3. Отключите webhook там

**⚠️ Важно:** Только один webhook может быть активен - либо Unisender, либо Laravel.

### Шаг 4: Проверьте работу

1. Откройте бота: `https://t.me/grosscbot`
2. Отправьте `/start`
3. Должно появиться приветственное сообщение
4. На сайте нажмите "Проверить подписку через бота"
5. В боте нажмите "Проверить"
6. Должно появиться сообщение с кнопкой

## Как это работает

1. **Пользователь пишет боту** → Telegram отправляет обновление
2. **Telegram отправляет на webhook URL**:
   - Если webhook → Unisender → Unisender обрабатывает (ваш код не работает)
   - Если webhook → Laravel → Laravel обрабатывает (ваш код работает)
3. **Laravel обрабатывает обновление** → Отправляет сообщение с кнопкой

## Проверка

### Проверка webhook:

```bash
docker exec php-fpm-gross php artisan telegram:check-webhook
```

### Проверка логов:

```bash
docker exec php-fpm-gross tail -f storage/logs/laravel.log
```

### Тестирование:

1. Откройте бота
2. Отправьте `/start check_<url>`
3. Должно появиться меню с кнопкой "Проверить"
4. Нажмите "Проверить"
5. Должно появиться сообщение с кнопкой для возврата на сайт

## Важно

- ✅ **Webhook должен быть на Laravel**, а не на Unisender
- ✅ **Только один webhook активен** - либо Unisender, либо Laravel
- ✅ **Если webhook на Unisender** - код Laravel **не выполняется**
- ✅ **Если webhook на Laravel** - Unisender **не обрабатывает** сообщения

## Вывод

**Для работы кнопок в боте:**
1. Переключите webhook на Laravel: `php artisan telegram:set-webhook`
2. Отключите webhook в Unisender
3. Проверьте работу бота

**После этого кнопки будут появляться, так как код Laravel будет обрабатывать сообщения.**

