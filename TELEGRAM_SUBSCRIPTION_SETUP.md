# Настройка проверки подписки в Telegram

## Что реализовано:

1. ✅ Страница проверки подписки (`/check-subscription`)
2. ✅ API endpoint для проверки через Telegram Bot API
3. ✅ Интеграция в дизайн сайта (градиенты, розовые акценты)
4. ✅ Ссылка в Header (десктоп и мобильная версии)

## Настройка на сервере:

### 1. Создайте Telegram бота:

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям и получите токен бота (например: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Добавьте бота в группу:

1. Создайте или откройте вашу Telegram группу
2. Добавьте бота в группу как администратора
3. Дайте боту права на просмотр участников

### 3. Получите ID группы:

**Вариант 1: Через бота @userinfobot**
1. Добавьте `@userinfobot` в группу
2. Бот покажет ID группы (например: `-1001234567890`)

**Вариант 2: Через getUpdates API**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```
Найдите `chat.id` в ответе (отрицательное число для групп)

### 4. Добавьте переменные в .env:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

### 5. Перезапустите контейнеры:

```bash
cd ~/gross-community/backend
docker-compose restart php-fpm
```

## Проверка работы:

1. Откройте страницу: `http://5.129.248.5/#/check-subscription`
2. Введите Telegram username (без @)
3. Нажмите "Проверить подписку"

## API Endpoint:

- **URL**: `POST /api/check-subscription`
- **Body**: `{ "telegram_username": "username" }`
- **Response**: 
  ```json
  {
    "success": true,
    "subscribed": true/false,
    "message": "Сообщение",
    "status": "member" // или "left", "kicked", etc.
  }
  ```

## Файлы для деплоя:

1. `frontend/src/pages/CheckSubscription.tsx` - страница проверки
2. `frontend/src/App.tsx` - добавлен роут
3. `frontend/src/components/Header.tsx` - добавлена ссылка
4. `backend/app/Http/Controllers/Api/SubscriptionController.php` - контроллер
5. `backend/routes/api.php` - добавлен маршрут

## Важно:

- Telegram username должен быть без символа `@`
- Бот должен быть администратором группы для проверки участников
- ID группы всегда отрицательное число для групп
- Для каналов ID может быть положительным (например: `@channelname`)

