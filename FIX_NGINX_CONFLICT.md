# Исправление конфликта конфигураций Nginx

## Проблема

Ошибка: `conflicting server name "_" on 0.0.0.0:80, ignored`

Это означает, что уже есть другая конфигурация Nginx, которая слушает на порту 80.

## Решение

### Вариант 1: Удалить старую конфигурацию (рекомендуется)

```bash
# 1. Найти все конфигурации, которые слушают на порту 80
sudo grep -r "listen 80" /etc/nginx/sites-enabled/
sudo grep -r "listen 80" /etc/nginx/conf.d/

# 2. Удалить или отключить старую конфигурацию
# Если в sites-enabled:
sudo rm /etc/nginx/sites-enabled/старая-конфигурация
# Или переименовать в sites-available, чтобы отключить:
sudo mv /etc/nginx/sites-enabled/старая-конфигурация /etc/nginx/sites-available/старая-конфигурация.disabled

# Если в conf.d:
sudo mv /etc/nginx/conf.d/старая-конфигурация.conf /etc/nginx/conf.d/старая-конфигурация.conf.disabled

# 3. Удалить старый симлинк и создать новый
sudo rm /etc/nginx/sites-enabled/gross-community
sudo ln -s /etc/nginx/sites-available/gross-community /etc/nginx/sites-enabled/

# 4. Проверить и перезапустить
sudo nginx -t
sudo systemctl restart nginx
```

### Вариант 2: Использовать default_server (уже применено)

Конфигурация уже обновлена с `default_server`, что означает, что она будет использоваться по умолчанию. Но нужно удалить или отключить старую конфигурацию.

### Вариант 3: Изменить server_name на уникальный

Если хотите оставить обе конфигурации, измените server_name в новой:

```bash
sudo nano /etc/nginx/sites-available/gross-community
```

Измените:
```nginx
server_name gross-community.local ваш-домен.com;
```

## Быстрое решение

```bash
# 1. Найти и отключить старую конфигурацию
sudo ls -la /etc/nginx/sites-enabled/
sudo ls -la /etc/nginx/conf.d/

# 2. Отключить все кроме gross-community (если нужно)
# Например, если есть default:
sudo rm /etc/nginx/sites-enabled/default

# 3. Убедиться, что gross-community активна
sudo rm -f /etc/nginx/sites-enabled/gross-community
sudo ln -s /etc/nginx/sites-available/gross-community /etc/nginx/sites-enabled/

# 4. Обновить конфигурацию с default_server
sudo cp ~/gross-community/nginx-system.conf /etc/nginx/sites-available/gross-community

# 5. Проверить и перезапустить
sudo nginx -t
sudo systemctl restart nginx
```

## Проверка

```bash
# Проверить, что конфликт устранен
sudo nginx -t

# Проверить статус
sudo systemctl status nginx

# Проверить, что сайт работает
curl http://localhost
```


