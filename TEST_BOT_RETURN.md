# 🧪 Тестирование возврата с бота

## Что было исправлено

1. **App.tsx** теперь проверяет параметры `subscribed` и `success` в URL при загрузке
2. Если параметры найдены, происходит автоматическое перенаправление на страницу Payment
3. **Payment.tsx** обрабатывает параметры из hash и показывает соответствующие модальные окна

## Как протестировать

### Тест 1: Пользователь подписан (subscribed=1)

1. Откройте в браузере: `https://grosscommunity.ru/?subscribed=1&success=1`
2. Должно произойти:
   - Автоматическое перенаправление на `#/payment?subscribed=1&success=1`
   - Появление модального окна:
     - Если пароль НЕ установлен → `PasswordSetupModal` (окно для создания пароля)
     - Если пароль УЖЕ установлен → `TelegramModal` (окно с реферальной ссылкой)

### Тест 2: Пользователь не подписан (subscribed=0)

1. Откройте в браузере: `https://grosscommunity.ru/?subscribed=0&success=1`
2. Должно произойти:
   - Автоматическое перенаправление на `#/payment?subscribed=0&success=1`
   - Появление модального окна `PaymentRequiredModal` (сообщение о необходимости оплаты)

## Проверка в консоли браузера

Откройте консоль разработчика (F12) и проверьте логи:

```
[App] Found bot return parameters, redirecting to payment page
[Payment] Payment return check: { search: "...", hash: "#/payment?subscribed=1&success=1", ... }
[Payment] Found subscribed parameter, processing: true/false
[Payment] handleBotSubscriptionResult called with subscribed: true/false
```

## Если не работает

1. **Проверьте консоль браузера** - должны быть логи `[App]` и `[Payment]`
2. **Проверьте URL** - должен быть `?subscribed=1&success=1` или `?subscribed=0&success=1`
3. **Проверьте, что вы авторизованы** - должен быть токен в `localStorage.getItem('api_token')`
4. **Проверьте, что страница Payment загружается** - в консоли должны быть логи от `Payment.tsx`

## Готово!

Теперь при возврате с бота по ссылкам:
- `https://grosscommunity.ru/?subscribed=1&success=1` → покажется окно для создания пароля или реферальная ссылка
- `https://grosscommunity.ru/?subscribed=0&success=1` → покажется сообщение об оплате

