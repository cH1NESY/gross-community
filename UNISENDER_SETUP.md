# 🔗 Настройка интеграции с Unisender

## Преимущества использования Unisender

✅ **Unisender уже работает** - бот отвечает на команды
✅ **Не нужно настраивать webhook в Laravel** - используем существующий Unisender webhook
✅ **Проще настраивать сценарии** - все в интерфейсе Unisender
✅ **Меньше кода в Laravel** - только API для проверки подписки

## Как это работает

### Шаг 1: Unisender обрабатывает команду `/start`

Когда пользователь отправляет `/start check_<return_url>`, Unisender:
1. Получает webhook от Telegram
2. Обрабатывает команду `/start`
3. Извлекает `return_url` из параметров
4. Извлекает `user_id` из сообщения Telegram

### Шаг 2: Unisender вызывает API Laravel

Unisender отправляет POST запрос на Laravel API:
```
POST https://grosscommunity.ru/api/telegram/check-subscription-by-user-id
Content-Type: application/json

{
    "user_id": 123456789
}
```

### Шаг 3: Laravel проверяет подписку

Laravel:
1. Получает `user_id` из запроса
2. Вызывает Telegram API `getChatMember`
3. Проверяет статус пользователя в группе
4. Возвращает результат

### Шаг 4: Unisender отправляет результат

Unisender:
1. Получает ответ от Laravel: `{"subscribed": true/false, "status": "member"}`
2. Отправляет сообщение пользователю
3. Добавляет кнопку для возврата на сайт с параметром `subscribed=1` или `subscribed=0`

## API Endpoints

### 1. Проверка подписки по user_id (для Unisender)

**Endpoint:** `POST /api/telegram/check-subscription-by-user-id`

**Request:**
```json
{
    "user_id": 123456789
}
```

**Response (успех):**
```json
{
    "subscribed": true,
    "status": "member",
    "user_id": 123456789,
    "chat_id": -1003139645146
}
```

**Response (не подписан):**
```json
{
    "subscribed": false,
    "status": "left",
    "user_id": 123456789,
    "chat_id": -1003139645146
}
```

**Response (ошибка):**
```json
{
    "subscribed": false,
    "error": "Telegram credentials not configured",
    "user_id": 123456789
}
```

### 2. Проверка подписки по username (для обратной совместимости)

**Endpoint:** `POST /api/telegram/check-subscription-by-username`

**Request:**
```json
{
    "username": "username"
}
```

**Response:**
```json
{
    "subscribed": true,
    "status": "member",
    "user_id": 123456789,
    "username": "username",
    "chat_id": -1003139645146
}
```

## Настройка в Unisender

### Шаг 1: Создайте сценарий в Unisender

1. Откройте Unisender
2. Создайте новый сценарий для команды `/start check_<return_url>`
3. Настройте триггер: команда `/start` с параметром `check_`

### Шаг 2: Добавьте действие "HTTP запрос"

1. Добавьте действие "HTTP запрос" или "Вызов API"
2. Настройте запрос:
   - **URL:** `https://grosscommunity.ru/api/telegram/check-subscription-by-user-id`
   - **Method:** POST
   - **Headers:** `Content-Type: application/json`
   - **Body:** 
     ```json
     {
         "user_id": "{{telegram_user_id}}"
     }
     ```
   - **Переменная для результата:** `subscription_result`

### Шаг 3: Обработайте результат

1. Добавьте условие: если `subscription_result.subscribed == true`
2. Если подписан:
   - Отправьте сообщение: "✅ Вы подписаны! Вернитесь на сайт."
   - Добавьте кнопку: URL = `{{return_url}}?subscribed=1&success=1`
3. Если не подписан:
   - Отправьте сообщение: "❌ Вы не подписаны, вам необходимо подписаться!"
   - Добавьте кнопку: URL = `{{return_url}}?subscribed=0&success=1`

### Шаг 4: Настройте задержку (опционально)

Если нужно добавить задержку перед проверкой (как в вашем сценарии):
1. Добавьте действие "Задержка" на 20 секунд
2. После задержки вызовите API для проверки подписки

## Пример сценария в Unisender

### Триггер:
- Команда: `/start`
- Параметр начинается с: `check_`

### Действия:

1. **Извлечь return_url**
   - Из параметра команды: `check_<return_url>`
   - Сохранить в переменную: `return_url`

2. **Извлечь user_id**
   - Из сообщения Telegram: `{{message.from.id}}`
   - Сохранить в переменную: `telegram_user_id`

3. **Задержка (опционально)**
   - Задержка: 20 секунд

4. **HTTP запрос к Laravel API**
   - URL: `https://grosscommunity.ru/api/telegram/check-subscription-by-user-id`
   - Method: POST
   - Body: `{"user_id": "{{telegram_user_id}}"}`
   - Сохранить результат в: `subscription_result`

5. **Условие: subscribed == true**
   - Если да:
     - Отправить сообщение: "✅ Вы подписаны! Вернитесь на сайт."
     - Добавить кнопку: `{{return_url}}?subscribed=1&success=1`
   - Если нет:
     - Отправить сообщение: "❌ Вы не подписаны, вам необходимо подписаться!"
     - Добавить кнопку: `{{return_url}}?subscribed=0&success=1`

## Тестирование

### Тест 1: Проверка API endpoint

```bash
curl -X POST https://grosscommunity.ru/api/telegram/check-subscription-by-user-id \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123456789}'
```

Должно вернуть:
```json
{
    "subscribed": true/false,
    "status": "member|left|kicked|...",
    "user_id": 123456789,
    "chat_id": -1003139645146
}
```

### Тест 2: Проверка через Unisender

1. Откройте бота: `https://t.me/grosscbot`
2. Отправьте: `/start check_https://grosscommunity.ru/?success=1#/payment`
3. Unisender должен:
   - Вызвать API Laravel
   - Получить результат
   - Отправить сообщение с кнопкой

## Важные переменные в Unisender

- `{{telegram_user_id}}` - ID пользователя из Telegram
- `{{message.from.id}}` - ID пользователя из сообщения
- `{{message.chat.id}}` - ID чата
- `{{return_url}}` - URL для возврата на сайт (из параметра команды)

## Настройка возврата на сайт

В Unisender добавьте кнопку с URL:
```
{{return_url}}?subscribed={{subscription_result.subscribed ? 1 : 0}}&success=1
```

Или используйте условие:
- Если `subscription_result.subscribed == true`: `{{return_url}}?subscribed=1&success=1`
- Если `subscription_result.subscribed == false`: `{{return_url}}?subscribed=0&success=1`

## Преимущества этого подхода

✅ **Unisender обрабатывает сообщения** - не нужно настраивать webhook в Laravel
✅ **Laravel проверяет подписку** - используем Telegram API для проверки
✅ **Проще настраивать** - все сценарии в Unisender
✅ **Гибкость** - можно легко изменить сообщения в Unisender
✅ **Надежность** - если Unisender работает, бот будет работать

## Готово!

После настройки в Unisender бот будет:
1. Обрабатывать команду `/start check_<return_url>`
2. Вызывать API Laravel для проверки подписки
3. Отправлять сообщение с результатом
4. Добавлять кнопку для возврата на сайт

## Вопросы?

Если у вас есть вопросы по настройке в Unisender, дайте знать!

