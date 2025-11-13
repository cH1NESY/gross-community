# 🔗 Интеграция с Unisender

## Варианты интеграции

Есть два способа работать с ботом:

### Вариант 1: Полностью через Unisender (РЕКОМЕНДУЕТСЯ, если Unisender уже работает)

**Преимущества:**
- ✅ Unisender уже работает и бот отвечает
- ✅ Не нужно настраивать webhook в Laravel
- ✅ Unisender управляет всеми сообщениями и кнопками
- ✅ Проще настраивать сценарии в Unisender

**Как это работает:**
1. Unisender обрабатывает команду `/start check_<return_url>`
2. Unisender вызывает API Laravel для проверки подписки
3. Laravel проверяет подписку через Telegram API
4. Laravel возвращает результат в Unisender
5. Unisender отправляет сообщение пользователю с кнопкой для возврата на сайт

### Вариант 2: Полностью через Laravel (текущий подход)

**Преимущества:**
- ✅ Полный контроль над логикой бота
- ✅ Можно настроить любую логику
- ✅ Нет зависимости от Unisender

**Недостатки:**
- ❌ Нужно настраивать webhook в Laravel
- ❌ Нужно отключать webhook в Unisender
- ❌ Сложнее настраивать

## Решение: Гибридный подход

**Лучший вариант:** Unisender обрабатывает сообщения, Laravel проверяет подписку

### Как это работает:

1. **Unisender обрабатывает команду `/start`**
   - Unisender получает webhook от Telegram
   - Unisender обрабатывает команду `/start check_<return_url>`
   - Unisender вызывает API Laravel для проверки подписки

2. **Laravel проверяет подписку**
   - Unisender отправляет POST запрос на `/api/telegram/check-subscription`
   - Laravel проверяет подписку через Telegram API
   - Laravel возвращает результат: `{"subscribed": true/false}`

3. **Unisender отправляет результат**
   - Unisender получает результат от Laravel
   - Unisender отправляет сообщение пользователю
   - Unisender добавляет кнопку для возврата на сайт с параметром `subscribed=1` или `subscribed=0`

## Настройка

### Шаг 1: Создайте API endpoint для проверки подписки

Уже есть: `/api/check-subscription` (SubscriptionController)

Нужно создать новый endpoint специально для Unisender:
- `/api/telegram/check-subscription-by-user-id` - проверка по user_id из Telegram

### Шаг 2: Настройте Unisender

В Unisender добавьте вызов API Laravel:
- URL: `https://grosscommunity.ru/api/telegram/check-subscription-by-user-id`
- Method: POST
- Body: `{"user_id": "{telegram_user_id}"}`
- Response: `{"subscribed": true/false}`

### Шаг 3: Настройте возврат на сайт

В Unisender добавьте кнопку для возврата на сайт:
- URL: `{return_url}?subscribed={result}` (где `{result}` = `1` или `0`)

## API Endpoints

### 1. Проверка подписки по user_id (для Unisender)

```php
POST /api/telegram/check-subscription-by-user-id
Content-Type: application/json

{
    "user_id": 123456789
}

Response:
{
    "subscribed": true,
    "status": "member"
}
```

### 2. Проверка подписки по username (существующий)

```php
POST /api/check-subscription
Content-Type: application/json

{
    "username": "username"
}

Response:
{
    "subscribed": true,
    "status": "member"
}
```

## Реализация

### Вариант A: Использовать существующий endpoint

Можно использовать существующий `/api/check-subscription`, но нужно добавить поддержку `user_id`.

### Вариант B: Создать новый endpoint специально для Unisender

Создать новый endpoint `/api/telegram/check-subscription-by-user-id`, который принимает `user_id` напрямую.

## Рекомендация

**Используйте Unisender для обработки сообщений, Laravel для проверки подписки.**

Это самый простой и надежный способ:
- ✅ Unisender уже работает
- ✅ Не нужно настраивать webhook в Laravel
- ✅ Не нужно отключать Unisender
- ✅ Можно использовать существующий API Laravel
- ✅ Проще настраивать сценарии в Unisender

## Следующие шаги

1. Создать API endpoint для проверки подписки по user_id
2. Настроить Unisender для вызова этого API
3. Настроить Unisender для отправки сообщения с кнопкой возврата на сайт
4. Протестировать весь процесс

## Вопросы

1. Как Unisender получает `user_id` от Telegram?
2. Может ли Unisender вызывать внешний API?
3. Может ли Unisender добавлять параметры в URL для возврата на сайт?

## Готово!

Если вы хотите использовать Unisender, я могу:
1. Создать API endpoint для проверки подписки по user_id
2. Настроить интеграцию с Unisender
3. Обновить документацию

Скажите, какой вариант вам больше подходит?

