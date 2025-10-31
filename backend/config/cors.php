<?php

// Собираем все возможные origins
$allowedOrigins = [];
$originsFromEnv = [
    env('FRONTEND_URL'),
    env('FRONTEND_URL_ALT'),
    env('PUBLIC_TUNNEL_URL'),
];

// Добавляем явно указанные origins
$explicitOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://5.129.248.5:5173',
    'http://5.129.248.5',
];

// Объединяем и убираем пустые значения
$allowedOrigins = array_filter(array_merge($originsFromEnv, $explicitOrigins));

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,

    // Паттерны для поддержки любых IP адресов с любыми портами
    'allowed_origins_patterns' => [
        '#^http://(\d{1,3}\.){3}\d{1,3}(:\d+)?$#', // http://IP:PORT или http://IP
        '#^https://(\d{1,3}\.){3}\d{1,3}(:\d+)?$#', // https://IP:PORT или https://IP
        '#^http://localhost:\d+$#', // localhost с любым портом
        '#^http://127\.0\.0\.1:\d+$#', // 127.0.0.1 с любым портом
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];


