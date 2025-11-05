# Проверка работы фронтенда на порту 80

## Что нужно проверить на сервере:

### 1. Проверьте, что фронтенд собран:
```bash
ssh root@5.129.248.5
cd ~/gross-community/frontend
ls -la dist/
```

Если папки `dist` нет или она пустая - нужно собрать:
```bash
npm run build
```

### 2. Проверьте, что nginx запущен:
```bash
cd ~/gross-community/backend
docker ps | grep nginx-gross
```

### 3. Проверьте, что volume монтируется правильно:
```bash
docker exec nginx-gross ls -la /var/www/html/frontend/dist/
```

Если папка пустая или не существует - проверьте путь в docker-compose.yml

### 4. Проверьте логи nginx:
```bash
docker logs nginx-gross --tail 50
```

### 5. Проверьте доступность:
```bash
curl http://localhost/
curl http://localhost/api/health
```

### 6. Перезапустите контейнеры:
```bash
cd ~/gross-community/backend
docker-compose down
docker-compose up -d
```

## Если всё ещё не работает:

1. Убедитесь, что файлы загружены на сервер
2. Проверьте, что путь в docker-compose.yml правильный: `../frontend/dist:/var/www/html/frontend/dist:ro`
3. Проверьте права доступа к файлам

