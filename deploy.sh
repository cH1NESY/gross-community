#!/bin/bash

# Скрипт для деплоя изменений на сервер
# Использование: ./deploy.sh user@server:/path/to/project

set -e

# Проверка аргументов
if [ -z "$1" ]; then
    echo "Использование: ./deploy.sh user@server:/path/to/project"
    echo "Пример: ./deploy.sh root@5.129.248.5:~/gross-community"
    exit 1
fi

SERVER_PATH="$1"
SERVER=$(echo "$SERVER_PATH" | cut -d: -f1)
REMOTE_PATH=$(echo "$SERVER_PATH" | cut -d: -f2)

echo "🚀 Начинаем деплой на сервер..."
echo "Сервер: $SERVER"
echo "Путь: $REMOTE_PATH"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для выполнения команд
run_cmd() {
    echo -e "${YELLOW}Выполняю: $1${NC}"
    ssh "$SERVER" "$1"
}

# Функция для загрузки файлов
upload_file() {
    echo -e "${YELLOW}Загружаю: $1 -> $2${NC}"
    scp "$1" "${SERVER}:${2}"
}

echo -e "\n${GREEN}📦 Шаг 1: Загрузка файлов...${NC}"

# Backend файлы
upload_file "backend/config/cors.php" "${REMOTE_PATH}/backend/config/cors.php"
upload_file "backend/docker/nginx/nginx.conf" "${REMOTE_PATH}/backend/docker/nginx/nginx.conf"
upload_file "backend/app/Http/Controllers/Api/ConsultationController.php" "${REMOTE_PATH}/backend/app/Http/Controllers/Api/ConsultationController.php"

# Frontend файлы
upload_file "frontend/src/utils/apiBase.ts" "${REMOTE_PATH}/frontend/src/utils/apiBase.ts"
upload_file "frontend/src/pages/CheckSubscription.tsx" "${REMOTE_PATH}/frontend/src/pages/CheckSubscription.tsx"
upload_file "frontend/src/App.tsx" "${REMOTE_PATH}/frontend/src/App.tsx"
upload_file "frontend/src/components/Header.tsx" "${REMOTE_PATH}/frontend/src/components/Header.tsx"

echo -e "\n${GREEN}⚙️  Шаг 2: Применение изменений на сервере...${NC}"

# Пересборка фронтенда (ВАЖНО!)
echo -e "${YELLOW}Собираю фронтенд...${NC}"
run_cmd "cd ${REMOTE_PATH}/frontend && npm install && npm run build"

# Очистка кэша Laravel
run_cmd "cd ${REMOTE_PATH}/backend && docker exec php-fpm-gross php artisan config:clear"
run_cmd "cd ${REMOTE_PATH}/backend && docker exec php-fpm-gross php artisan cache:clear"

# Перезапуск nginx
run_cmd "cd ${REMOTE_PATH}/backend && docker restart nginx-gross"

echo -e "\n${GREEN}✅ Деплой завершен успешно!${NC}"
echo -e "\nПроверьте работу сайта:"
echo -e "Frontend (порт 80): http://5.129.248.5/"
echo -e "Backend API: http://5.129.248.5/api/health"

