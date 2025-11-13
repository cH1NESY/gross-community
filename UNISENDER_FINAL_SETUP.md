# ✅ Финальная настройка интеграции с Unisender

## Текущая логика работы

### При возврате с `subscribed=1` (пользователь подписан):

1. **Если пароль НЕ установлен:**
   - Показывается модальное окно `PasswordSetupModal` для создания пароля
   - После создания пароля автоматически показывается `TelegramModal` с реферальной ссылкой

2. **Если пароль УЖЕ установлен:**
   - Сразу показывается `TelegramModal` с реферальной ссылкой

### При возврате с `subscribed=0` (пользователь НЕ подписан):

- Показывается модальное окно `PaymentRequiredModal` с сообщением о необходимости оплаты
- Кнопка "Перейти к оплате" запускает процесс оплаты

## Настройка в Unisender

### Шаг 1: Триггер

В Unisender настройте триггер для команды `/start` с параметром `check_`:
- Команда: `/start`
- Параметр начинается с: `check_`

### Шаг 2: Извлечение данных

1. **Извлечь `return_url`:**
   - Из параметра команды: `check_<return_url>`
   - Убрать префикс `check_`
   - Декодировать URL
   - Сохранить в переменную: `return_url`

2. **Извлечь `user_id`:**
   - Из сообщения Telegram: `{{message.from.id}}`
   - Сохранить в переменную: `telegram_user_id`

### Шаг 3: Задержка (опционально)

Если нужна задержка перед проверкой:
- Добавьте действие "Задержка" на 20 секунд

### Шаг 4: HTTP запрос к Laravel API

Добавьте действие "HTTP запрос":
- **URL:** `https://grosscommunity.ru/api/telegram/check-subscription-by-user-id`
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "user_id": "{{telegram_user_id}}"
  }
  ```
- **Сохранить результат в:** `subscription_result`

### Шаг 5: Обработка результата

Добавьте условие (фильтр):

**Если `subscription_result.subscribed == true` (подписан):**
- Отправить сообщение: "✅ Вы подписаны! Вернитесь на сайт."
- Добавить кнопку:
  - Текст: "Вернуться на сайт"
  - URL: `{{return_url}}?subscribed=1&success=1`

**Если `subscription_result.subscribed == false` (не подписан):**
- Отправить сообщение: "❌ Вы не подписаны, вам необходимо подписаться!"
- Добавить кнопку:
  - Текст: "Перейти на сайт"
  - URL: `{{return_url}}?subscribed=0&success=1`

## Пример полного сценария в Unisender

```
1. Старт (триггер: /start check_*)
   ↓
2. Извлечь return_url из параметра
   ↓
3. Извлечь telegram_user_id из message.from.id
   ↓
4. [Опционально] Задержка 20 секунд
   ↓
5. HTTP запрос:
   POST https://grosscommunity.ru/api/telegram/check-subscription-by-user-id
   Body: {"user_id": "{{telegram_user_id}}"}
   Результат → subscription_result
   ↓
6. Фильтр: subscription_result.subscribed == true?
   ├─ Да → Сообщение "✅ Вы подписаны!" + Кнопка: {{return_url}}?subscribed=1&success=1
   └─ Нет → Сообщение "❌ Вы не подписаны!" + Кнопка: {{return_url}}?subscribed=0&success=1
```

## Что происходит на сайте

### При `subscribed=1&success=1`:

1. Пользователь возвращается на сайт
2. `Payment.tsx` обрабатывает параметр `subscribed=1`
3. Проверяется наличие пароля:
   - **Нет пароля** → Показывается `PasswordSetupModal` → После создания пароля → `TelegramModal` с реферальной ссылкой
   - **Есть пароль** → Сразу показывается `TelegramModal` с реферальной ссылкой

### При `subscribed=0&success=1`:

1. Пользователь возвращается на сайт
2. `Payment.tsx` обрабатывает параметр `subscribed=0`
3. Показывается `PaymentRequiredModal` с сообщением о необходимости оплаты
4. Кнопка "Перейти к оплате" запускает процесс оплаты

## Тестирование

### Тест 1: Проверка API

```bash
curl -X POST https://grosscommunity.ru/api/telegram/check-subscription-by-user-id \
  -H "Content-Type: application/json" \
  -d '{"user_id": YOUR_TELEGRAM_USER_ID}'
```

Должно вернуть:
```json
{
  "subscribed": true/false,
  "status": "member|left|kicked|...",
  "user_id": YOUR_TELEGRAM_USER_ID,
  "chat_id": -1003139645146
}
```

### Тест 2: Полный флоу

1. Откройте бота: `https://t.me/grosscbot`
2. Отправьте: `/start check_https://grosscommunity.ru/?success=1#/payment`
3. Unisender должен:
   - Вызвать API Laravel
   - Получить результат
   - Отправить сообщение с кнопкой
4. Нажмите кнопку в боте
5. На сайте должно появиться соответствующее модальное окно

## Важные моменты

✅ **URL для возврата должен быть закодирован** в параметре команды `/start`
✅ **Unisender должен декодировать URL** перед использованием в кнопке
✅ **Параметры `subscribed` и `success`** должны быть добавлены к `return_url` в Unisender
✅ **На сайте логика уже настроена** - модальные окна показываются автоматически

## Готово!

После настройки в Unisender весь процесс будет работать автоматически:
- Бот проверяет подписку через Laravel API
- Пользователь возвращается на сайт с правильными параметрами
- Сайт показывает нужные модальные окна в зависимости от статуса подписки

