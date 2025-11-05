# Настройка фронтенда на порту 80

## Что сделано:

1. ✅ Настроен Nginx для отдачи статики фронтенда на порту 80
2. ✅ API запросы (`/api/*`) перенаправляются на Laravel
3. ✅ Hash-based routing настроен для SPA
4. ✅ Обновлен docker-compose.yml для монтирования dist фронтенда

## Структура:

- **Фронтенд**: `/var/www/html/frontend/dist` (статика React)
- **API**: `/var/www/html/public/index.php` (Laravel)
- **Порт**: 80 (стандартный HTTP)

## Что нужно сделать на сервере:

### 1. Соберите фронтенд:
```bash
cd ~/gross-community/frontend
npm run build
```

### 2. Обновите docker-compose.yml и nginx.conf:
Загрузите исправленные файлы:
- `backend/docker-compose.yml`
- `backend/docker/nginx/nginx.conf`

### 3. Перезапустите контейнеры:
```bash
cd ~/gross-community/backend
docker-compose down
docker-compose up -d
```

### 4. Проверьте работу:
```bash
# Проверьте, что nginx запущен
docker ps | grep nginx-gross

# Проверьте логи nginx
docker logs nginx-gross --tail 20

# Проверьте доступность
curl http://localhost/
curl http://localhost/api/health
```

## Структура URL:

- **Фронтенд**: `http://5.129.248.5/` или `http://5.129.248.5/#/payment`
- **API**: `http://5.129.248.5/api/user`, `http://5.129.248.5/api/register` и т.д.

## Результат:

Теперь сайт доступен на порту 80 без указания порта:
- `http://5.129.248.5/` вместо `http://5.129.248.5:5173/`

API запросы автоматически определяются через `apiBase.ts`, который использует `window.location.origin` когда нет порта 5173.

