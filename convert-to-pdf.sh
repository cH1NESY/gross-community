#!/bin/bash

# Скрипт для конвертации HTML документов в PDF
# Требует установки wkhtmltopdf

echo "Конвертация HTML документов в PDF..."

# Проверяем наличие wkhtmltopdf
if ! command -v wkhtmltopdf &> /dev/null; then
    echo "wkhtmltopdf не установлен. Устанавливаем..."
    
    # Для Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y wkhtmltopdf
    # Для CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y wkhtmltopdf
    # Для macOS
    elif command -v brew &> /dev/null; then
        brew install wkhtmltopdf
    else
        echo "Не удалось установить wkhtmltopdf автоматически. Установите вручную."
        exit 1
    fi
fi

# Конвертируем HTML в PDF
echo "Конвертируем privacy-policy.html в PDF..."
wkhtmltopdf --page-size A4 --margin-top 20mm --margin-bottom 20mm --margin-left 20mm --margin-right 20mm \
    frontend/public/privacy-policy.html frontend/public/privacy-policy.pdf

echo "Конвертируем personal-data-consent.html в PDF..."
wkhtmltopdf --page-size A4 --margin-top 20mm --margin-bottom 20mm --margin-left 20mm --margin-right 20mm \
    frontend/public/personal-data-consent.html frontend/public/personal-data-consent.pdf

echo "Конвертация завершена!"
echo "PDF файлы созданы:"
echo "- frontend/public/privacy-policy.pdf"
echo "- frontend/public/personal-data-consent.pdf"
