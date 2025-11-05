# Пересборка фронтенда для порта 80

## Проблема:
- Порт 5173: актуальная версия (Vite dev server)
- Порт 80: старая версия (старая сборка в dist/)

## Решение:

### На сервере выполните:

```bash
ssh root@5.129.248.5
cd ~/gross-community/frontend

# 1. Убедитесь, что все зависимости установлены
npm install

# 2. Соберите актуальную версию
npm run build

# 3. Проверьте, что сборка создана
ls -la dist/

# Должны быть файлы:
# - index.html
# - assets/ (с JS и CSS файлами)
# - изображения и т.д.

# 4. Проверьте, что nginx видит новую сборку
docker exec nginx-gross ls -la /var/www/html/frontend/dist/

# 5. Если нужно, перезапустите nginx
docker restart nginx-gross
```

## После сборки:

Откройте сайт по адресу: `http://5.129.248.5/` (без порта)

Должна отображаться актуальная версия.

## Автоматизация:

Чтобы не собирать вручную каждый раз, можно добавить в скрипт деплоя:

```bash
# В deploy.sh или отдельный скрипт
cd ~/gross-community/frontend
npm run build
cd ../backend
docker-compose restart nginx-gross
```

