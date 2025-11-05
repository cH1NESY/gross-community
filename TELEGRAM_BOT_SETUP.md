# Настройка проверки подписки в Telegram группе

## Что реализовано:

✅ **Проверка реальной подписки в Telegram группе** через Telegram Bot API

## Требования:

- Telegram бот (создается через @BotFather)
- Бот добавлен в группу как администратор
- ID группы (можно получить через @userinfobot)

## Пошаговая настройка:

### 1. Создайте Telegram бота:

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Укажите имя бота (например: "Gross Community Bot")
   - Укажите username бота (например: "gross_community_bot")
4. Сохраните токен бота (формат: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Добавьте бота в группу:

1. Создайте или откройте вашу Telegram группу
2. Добавьте бота в группу
3. Назначьте бота администратором группы:
   - Settings → Administrators → Add Administrator
   - Выберите бота
   - Дайте боту права на просмотр участников (не обязательно давать все права)

### 3. Получите ID группы:

**Вариант 1: Через @userinfobot**
1. Добавьте `@userinfobot` в группу
2. Бот автоматически покажет ID группы (отрицательное число, например: `-1001234567890`)

**Вариант 2: Через API**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```
Найдите `chat.id` в ответе (отрицательное число для групп)

**Вариант 3: Через веб-версию Telegram**
1. Откройте группу в веб-версии Telegram (web.telegram.org)
2. В URL будет `chat_id`, например: `https://web.telegram.org/k/#-1001234567890`

### 4. Добавьте переменные в .env:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

### 5. Выполните миграцию:

```bash
cd ~/gross-community/backend
docker exec php-fpm-gross php artisan migrate
```

### 6. Перезапустите контейнеры:

```bash
docker-compose restart php-fpm
```

## Проверка работы:

1. Откройте страницу: `http://5.129.248.5/#/check-subscription`
2. Введите Telegram username (без @)
3. Нажмите "Проверить подписку"

## Важные моменты:

- ✅ Telegram username должен быть без символа `@`
- ✅ Профиль пользователя должен быть публичным (Settings → Privacy → Profile Photos → Everybody)
- ✅ Бот должен быть администратором группы
- ✅ ID группы всегда отрицательное число для групп
- ✅ Для каналов ID может быть положительным (можно использовать @channelname)

## Ограничения:

- ⚠️ Telegram Bot API требует, чтобы профиль пользователя был публичным для получения user_id по username
- ⚠️ Если профиль приватный, проверка не сработает (пользователь получит соответствующее сообщение)
- ⚠️ Для приватных профилей можно использовать альтернативный метод - сохранять user_id при регистрации/оплате

## Файлы:

1. `backend/app/Http/Controllers/Api/SubscriptionController.php` - контроллер проверки
2. `backend/database/migrations/2025_10_31_000000_add_telegram_user_id_to_users_table.php` - миграция для telegram_user_id
3. `backend/app/Models/User.php` - добавлено поле telegram_user_id

## Альтернативный метод (для приватных профилей):

Если профиль пользователя приватный, можно:
1. Попросить пользователя написать боту команду `/start`
2. Сохранить user_id из webhook'а бота
3. Использовать сохраненный user_id для проверки подписки

Но для начала текущей реализации достаточно, если профиль публичный.

