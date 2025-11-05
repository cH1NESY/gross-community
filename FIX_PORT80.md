# Исправление: фронтенд должен работать на порту 80

## Проблема:
Фронтенд открывается на `localhost:5173` (Vite dev server) вместо порта 80 (nginx)

## Решение на сервере:

### 1. Остановите Vite dev server (если запущен):
```bash
# Найдите процесс Vite
ps aux | grep vite

# Остановите его (если запущен)
pkill -f vite
```

### 2. Убедитесь, что фронтенд собран:
```bash
ssh root@5.129.248.5
cd ~/gross-community/frontend

# Проверьте наличие dist папки
ls -la dist/

# Если папки нет или она пустая - соберите:
npm run build
```

### 3. Проверьте docker-compose и nginx:
```bash
cd ~/gross-community/backend

# Проверьте, что volume правильно настроен в docker-compose.yml
cat docker-compose.yml | grep frontend/dist

# Должно быть:
# - ../frontend/dist:/var/www/html/frontend/dist:ro
```

### 4. Проверьте, что файлы доступны в контейнере:
```bash
docker exec nginx-gross ls -la /var/www/html/frontend/dist/
```

Если папка пустая - проверьте путь на хосте:
```bash
ls -la ~/gross-community/frontend/dist/
```

### 5. Перезапустите контейнеры:
```bash
cd ~/gross-community/backend
docker-compose down
docker-compose up -d
```

### 6. Проверьте логи:
```bash
docker logs nginx-gross --tail 20
```

### 7. Проверьте доступность:
```bash
# Проверьте главную страницу
curl http://localhost/ | head -20

# Должен вернуть HTML фронтенда, а не ошибку 404
```

## Важно:

- **Не запускайте `npm run dev` на сервере** - это dev сервер на порту 5173
- Используйте **только `npm run build`** для сборки продакшн версии
- Открывайте сайт по адресу **`http://5.129.248.5/`** (без порта) или **`http://5.129.248.5:80/`**

## Если всё ещё не работает:

1. Проверьте, что nginx контейнер запущен:
   ```bash
   docker ps | grep nginx-gross
   ```

2. Проверьте конфигурацию nginx:
   ```bash
   docker exec nginx-gross nginx -t
   ```

3. Проверьте, что порт 80 не занят другим процессом:
   ```bash
   netstat -tulpn | grep :80
   ```

