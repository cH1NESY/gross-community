#!/bin/bash

# Скрипт для настройки системного Nginx для Gross Community

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Настройка системного Nginx для Gross Community${NC}\n"

# Проверка, что скрипт запущен от root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Пожалуйста, запустите скрипт с sudo${NC}"
    exit 1
fi

# Определяем путь к проекту
PROJECT_PATH=$(pwd)
if [[ "$PROJECT_PATH" != *"gross-community"* ]]; then
    echo -e "${YELLOW}⚠️  Похоже, вы не в директории проекта.${NC}"
    read -p "Введите полный путь к проекту (например, /root/gross-community): " PROJECT_PATH
fi

# Проверяем существование файла конфигурации
CONFIG_FILE="$PROJECT_PATH/nginx-system.conf"
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Файл nginx-system.conf не найден в $PROJECT_PATH${NC}"
    exit 1
fi

# Останавливаем Docker Nginx
echo -e "${YELLOW}📦 Останавливаю Docker Nginx...${NC}"
cd "$PROJECT_PATH/backend" 2>/dev/null || cd "$PROJECT_PATH"
docker stop nginx-gross 2>/dev/null || echo "Docker Nginx уже остановлен или не запущен"

# Перезапускаем PHP-FPM с пробросом порта
echo -e "${YELLOW}🔄 Перезапускаю PHP-FPM с пробросом порта...${NC}"
cd "$PROJECT_PATH/backend" 2>/dev/null || cd "$PROJECT_PATH"
docker-compose up -d php-fpm 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Не удалось перезапустить через docker-compose, пробую напрямую...${NC}"
    docker restart php-fpm-gross 2>/dev/null || echo "PHP-FPM контейнер не найден"
}

# Копируем конфигурацию
echo -e "${YELLOW}📋 Копирую конфигурацию Nginx...${NC}"

# Определяем, какая структура Nginx используется
if [ -d "/etc/nginx/sites-available" ]; then
    # Debian/Ubuntu структура
    cp "$CONFIG_FILE" /etc/nginx/sites-available/gross-community
    ln -sf /etc/nginx/sites-available/gross-community /etc/nginx/sites-enabled/gross-community
    echo -e "${GREEN}✅ Конфигурация скопирована в /etc/nginx/sites-available/gross-community${NC}"
elif [ -d "/etc/nginx/conf.d" ]; then
    # CentOS/RHEL структура
    cp "$CONFIG_FILE" /etc/nginx/conf.d/gross-community.conf
    echo -e "${GREEN}✅ Конфигурация скопирована в /etc/nginx/conf.d/gross-community.conf${NC}"
else
    echo -e "${RED}❌ Не удалось определить структуру Nginx${NC}"
    exit 1
fi

# Обновляем пути в конфигурации, если нужно
if [ "$PROJECT_PATH" != "/root/gross-community" ]; then
    echo -e "${YELLOW}🔧 Обновляю пути в конфигурации...${NC}"
    if [ -f "/etc/nginx/sites-available/gross-community" ]; then
        sed -i "s|/root/gross-community|$PROJECT_PATH|g" /etc/nginx/sites-available/gross-community
    elif [ -f "/etc/nginx/conf.d/gross-community.conf" ]; then
        sed -i "s|/root/gross-community|$PROJECT_PATH|g" /etc/nginx/conf.d/gross-community.conf
    fi
fi

# Проверяем конфигурацию
echo -e "${YELLOW}🔍 Проверяю конфигурацию Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Конфигурация Nginx валидна${NC}"
else
    echo -e "${RED}❌ Ошибка в конфигурации Nginx${NC}"
    exit 1
fi

# Перезапускаем Nginx
echo -e "${YELLOW}🔄 Перезапускаю Nginx...${NC}"
systemctl restart nginx

# Проверяем статус
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx успешно запущен${NC}"
else
    echo -e "${RED}❌ Ошибка при запуске Nginx${NC}"
    systemctl status nginx
    exit 1
fi

# Проверяем PHP-FPM
echo -e "${YELLOW}🔍 Проверяю доступность PHP-FPM...${NC}"
if timeout 2 bash -c "echo > /dev/tcp/127.0.0.1/9000" 2>/dev/null; then
    echo -e "${GREEN}✅ PHP-FPM доступен на порту 9000${NC}"
else
    echo -e "${YELLOW}⚠️  PHP-FPM не отвечает на порту 9000. Проверьте:${NC}"
    echo -e "   docker port php-fpm-gross"
    echo -e "   docker logs php-fpm-gross"
fi

echo -e "\n${GREEN}✅ Настройка завершена!${NC}\n"
echo -e "Проверьте работу сайта:"
echo -e "  - Frontend: http://$(hostname -I | awk '{print $1}')/"
echo -e "  - API: http://$(hostname -I | awk '{print $1}')/api/"
echo -e "\nЛоги Nginx:"
echo -e "  - Access: /var/log/nginx/gross-community.access.log"
echo -e "  - Error: /var/log/nginx/gross-community.error.log"

