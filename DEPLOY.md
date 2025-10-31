# Инструкция по деплою изменений на сервер

## Измененные файлы для деплоя:

### Backend:
1. `backend/config/cors.php` - обновленная конфигурация CORS с паттернами для IP адресов
2. `backend/docker/nginx/nginx.conf` - CORS заголовки в nginx
3. `backend/app/Http/Controllers/Api/ConsultationController.php` - улучшенная обработка ошибок

### Frontend:
4. `frontend/src/utils/apiBase.ts` - логика определения API base URL

---

## Способ 1: Через SCP (простая загрузка файлов)

### Шаг 1: Подключитесь к серверу
```bash
ssh root@ваш_сервер
cd ~/gross-community
```

### Шаг 2: Загрузите измененные файлы с локального компьютера

**На вашем локальном компьютере выполните:**

```bash
# Перейдите в директорию проекта
cd /home/chingis/Рабочий\ стол/grossCommunity

# Загрузите файлы бэкенда
scp backend/config/cors.php root@ваш_сервер:~/gross-community/backend/config/cors.php
scp backend/docker/nginx/nginx.conf root@ваш_сервер:~/gross-community/backend/docker/nginx/nginx.conf
scp backend/app/Http/Controllers/Api/ConsultationController.php root@ваш_сервер:~/gross-community/backend/app/Http/Controllers/Api/ConsultationController.php

# Загрузите файлы фронтенда (если используете на сервере)
scp frontend/src/utils/apiBase.ts root@ваш_сервер:~/gross-community/frontend/src/utils/apiBase.ts
```

### Шаг 3: На сервере примените изменения

```bash
# Подключитесь к серверу
ssh root@ваш_сервер
cd ~/gross-community/backend

# Очистите кэш Laravel
docker exec php-fpm-gross php artisan config:clear
docker exec php-fpm-gross php artisan cache:clear

# Перезапустите nginx
docker restart nginx-gross
```

---

## Способ 2: Через Git (если используете Git)

### На локальном компьютере:
```bash
cd /home/chingis/Рабочий\ стол/grossCommunity
git add backend/config/cors.php backend/docker/nginx/nginx.conf backend/app/Http/Controllers/Api/ConsultationController.php frontend/src/utils/apiBase.ts
git commit -m "Fix CORS and error handling"
git push
```

### На сервере:
```bash
ssh root@ваш_сервер
cd ~/gross-community
git pull origin main  # или master, в зависимости от вашей ветки

# Примените изменения
cd backend
docker exec php-fpm-gross php artisan config:clear
docker exec php-fpm-gross php artisan cache:clear
docker restart nginx-gross
```

---

## Способ 3: Прямое редактирование на сервере (если нет доступа с локальной машины)

### Подключитесь к серверу:
```bash
ssh root@ваш_сервер
cd ~/gross-community
```

### Скопируйте содержимое файлов вручную через nano/vim:

**1. Редактируйте cors.php:**
```bash
nano backend/config/cors.php
# Вставьте содержимое из локального файла
```

**2. Редактируйте nginx.conf:**
```bash
nano backend/docker/nginx/nginx.conf
# Вставьте содержимое из локального файла
```

**3. Редактируйте ConsultationController.php:**
```bash
nano backend/app/Http/Controllers/Api/ConsultationController.php
# Вставьте содержимое из локального файла
```

**4. Редактируйте apiBase.ts (если нужно):**
```bash
nano frontend/src/utils/apiBase.ts
# Вставьте содержимое из локального файла
```

**5. Примените изменения:**
```bash
cd backend
docker exec php-fpm-gross php artisan config:clear
docker exec php-fpm-gross php artisan cache:clear
docker restart nginx-gross
```

---

## Быстрая проверка после деплоя

```bash
# Проверьте что nginx работает
docker ps | grep nginx

# Проверьте логи на ошибки
docker exec php-fpm-gross tail -n 50 storage/logs/laravel.log

# Проверьте что CORS работает (должен вернуть заголовки)
curl -H "Origin: http://5.129.248.5:5173" -H "Access-Control-Request-Method: POST" -X OPTIONS http://5.129.248.5/api/consultation -v
```

---

## Если что-то пошло не так - откат:

```bash
# Откатите изменения через git
git checkout backend/config/cors.php backend/docker/nginx/nginx.conf backend/app/Http/Controllers/Api/ConsultationController.php

# Или восстановите из бэкапа (если делали)
cp backend/config/cors.php.backup backend/config/cors.php

# Перезапустите сервисы
docker exec php-fpm-gross php artisan config:clear
docker restart nginx-gross
```

