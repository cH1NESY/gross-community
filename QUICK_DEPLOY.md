# Быстрый деплой (самый простой способ)

## 🚀 Автоматический деплой одной командой:

```bash
cd "/home/chingis/Рабочий стол/grossCommunity"
./deploy.sh root@5.129.248.5:~/gross-community
```

Скрипт автоматически:
1. Загрузит все измененные файлы
2. Очистит кэш Laravel
3. Перезапустит nginx

---

## 📋 Ручной деплой (если скрипт не работает):

### На вашем локальном компьютере:

```bash
cd "/home/chingis/Рабочий стол/grossCommunity"

# Замените IP на ваш сервер
SERVER="root@5.129.248.5"
REMOTE_PATH="~/gross-community"

# Загрузите файлы
scp backend/config/cors.php $SERVER:$REMOTE_PATH/backend/config/cors.php
scp backend/docker/nginx/nginx.conf $SERVER:$REMOTE_PATH/backend/docker/nginx/nginx.conf
scp backend/app/Http/Controllers/Api/ConsultationController.php $SERVER:$REMOTE_PATH/backend/app/Http/Controllers/Api/ConsultationController.php
scp frontend/src/utils/apiBase.ts $SERVER:$REMOTE_PATH/frontend/src/utils/apiBase.ts

# Примените изменения
ssh $SERVER "cd $REMOTE_PATH/backend && docker exec php-fpm-gross php artisan config:clear && docker exec php-fpm-gross php artisan cache:clear && docker restart nginx-gross"
```

---

## ✅ Проверка после деплоя:

```bash
# Подключитесь к серверу
ssh root@5.129.248.5

# Проверьте статус контейнеров
docker ps

# Проверьте логи на ошибки
docker exec php-fpm-gross tail -n 20 storage/logs/laravel.log
```

---

## 🔧 Если что-то пошло не так:

```bash
ssh root@5.129.248.5
cd ~/gross-community/backend

# Перезапустите все контейнеры
docker-compose restart

# Или перезапустите конкретные
docker restart nginx-gross php-fpm-gross
```

