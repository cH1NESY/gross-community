<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class TelegramBotController extends Controller
{
    private $botToken;
    private $chatId;
    private $apiUrl;

    public function __construct()
    {
        // Минимальная инициализация без логирования, чтобы избежать ошибок при инициализации
        // Используем env() напрямую, так как config() может быть закеширован
        $this->botToken = env('TELEGRAM_BOT_TOKEN') ?: getenv('TELEGRAM_BOT_TOKEN') ?: null;
        $this->chatId = env('TELEGRAM_CHAT_ID') ?: getenv('TELEGRAM_CHAT_ID') ?: null;
        
        if ($this->botToken && is_string($this->botToken) && !empty($this->botToken)) {
            $this->apiUrl = 'https://api.telegram.org/bot' . $this->botToken . '/';
        }
    }

    /**
     * Обработка webhook от Telegram
     */
    public function webhook(Request $request): JsonResponse
    {
        // ВАЖНО: Всегда возвращаем 200 OK, чтобы Telegram не считал webhook нерабочим
        
        // Быстрый ответ - сразу возвращаем успех
        // Обработку выполняем после, чтобы не блокировать ответ
        
        $response = response()->json(['ok' => true]);
        
        // Обрабатываем обновление асинхронно (не блокируем ответ)
        try {
            // Проверяем, что токен настроен
            if (empty($this->botToken)) {
                // Логируем только если можем
                try {
                    Log::error('TELEGRAM_BOT_TOKEN not configured in webhook');
                } catch (\Throwable $logError) {
                    error_log('TELEGRAM_BOT_TOKEN not configured');
                }
                return $response;
            }
            
            $update = $request->all();
            
            // Логируем получение обновления (безопасно)
            try {
                Log::info('Telegram webhook received', [
                    'update_id' => $update['update_id'] ?? null,
                    'has_message' => isset($update['message']),
                    'has_callback_query' => isset($update['callback_query'])
                ]);
            } catch (\Throwable $logError) {
                // Если логирование не работает, просто продолжаем
            }

            // Обработка сообщений
            if (isset($update['message'])) {
                try {
                    $this->handleMessage($update['message']);
                } catch (\Throwable $e) {
                    try {
                        Log::error('Error handling message', [
                            'error' => $e->getMessage(),
                            'line' => $e->getLine()
                        ]);
                    } catch (\Throwable $logError) {
                        error_log('Error handling message: ' . $e->getMessage());
                    }
                }
            }

            // Обработка callback запросов (нажатие на кнопку)
            if (isset($update['callback_query'])) {
                try {
                    $this->handleCallbackQuery($update['callback_query']);
                } catch (\Throwable $e) {
                    try {
                        Log::error('Error handling callback query', [
                            'error' => $e->getMessage(),
                            'line' => $e->getLine()
                        ]);
                    } catch (\Throwable $logError) {
                        error_log('Error handling callback query: ' . $e->getMessage());
                    }
                }
            }
            
        } catch (\Throwable $e) {
            // Ловим все исключения
            try {
                Log::error('Fatal error in Telegram webhook', [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]);
            } catch (\Throwable $logError) {
                error_log('Fatal error in Telegram webhook: ' . $e->getMessage());
            }
        }
        
        // Всегда возвращаем успех
        return $response;
    }

    /**
     * Обработка сообщений (команда /start)
     */
    private function handleMessage(array $message): void
    {
        $chatId = $message['chat']['id'];
        $text = $message['text'] ?? '';
        $userId = $message['from']['id'] ?? null;

        // Обработка команды /start
        if (strpos($text, '/start') === 0) {
            $params = $this->parseStartParams($text);
            $this->handleStartCommand($chatId, $params, $userId);
        }
    }

    /**
     * Парсинг параметров из команды /start
     * Формат: /start check_<return_url>
     * Telegram автоматически заменяет пробелы на подчеркивания в URL
     */
    private function parseStartParams(string $text): array
    {
        $parts = explode(' ', $text, 2);
        $params = ['command' => 'start'];

        if (isset($parts[1])) {
            $param = $parts[1];
            // Проверяем, начинается ли с check_
            if (strpos($param, 'check_') === 0) {
                $params['action'] = 'check';
                // Убираем "check_" и декодируем URL
                $encodedUrl = substr($param, 6);
                // Telegram может заменить некоторые символы, пробуем декодировать
                $returnUrl = urldecode($encodedUrl);
                // Если URL не декодировался правильно, используем как есть
                if (empty($returnUrl) || !filter_var($returnUrl, FILTER_VALIDATE_URL)) {
                    // Пробуем заменить подчеркивания обратно на нужные символы
                    $returnUrl = str_replace('_', '%', $encodedUrl);
                    $returnUrl = urldecode($returnUrl);
                }
                $params['return_url'] = $returnUrl;
                
                Log::info('Parsed start params', [
                    'original_param' => $param,
                    'return_url' => $returnUrl
                ]);
            }
        }

        return $params;
    }

    /**
     * Обработка команды /start
     */
    private function handleStartCommand(int $chatId, array $params, ?int $userId): void
    {
        if (isset($params['action']) && $params['action'] === 'check') {
            // Показываем меню с кнопкой "Проверить"
            $this->sendMenuWithCheckButton($chatId, $params['return_url'] ?? '');
        } else {
            // Обычное приветствие
            $this->sendWelcomeMessage($chatId);
        }
    }

    /**
     * Отправка меню с кнопкой "Проверить"
     * Используем сессию для хранения return_url, так как callback_data ограничен 64 байтами
     */
    private function sendMenuWithCheckButton(int $chatId, string $returnUrl): void
    {
        if (empty($returnUrl)) {
            $this->sendMessage($chatId, "❌ Ошибка: не удалось получить URL для возврата.");
            return;
        }

        $message = "Проверим вашу подписку";

        // Сохраняем return_url в кеше Laravel для временного хранения (TTL 10 минут)
        $sessionKey = 'bot_return_url_' . $chatId;
        
        try {
            Cache::put($sessionKey, $returnUrl, 600);
        } catch (\Throwable $e) {
            // Если кеш не работает, просто продолжаем
            try {
                Log::warning('Failed to save return URL in cache', ['error' => $e->getMessage()]);
            } catch (\Throwable $logError) {
                // Если логирование не работает, продолжаем
            }
        }
        
        // Используем короткий callback_data с chat_id
        $callbackData = 'check_' . $chatId;

        $keyboard = [
            'inline_keyboard' => [
                [
                    [
                        'text' => 'Проверить',
                        'callback_data' => $callbackData
                    ]
                ]
            ]
        ];

        $this->sendMessage($chatId, $message, $keyboard);
    }

    /**
     * Обработка callback запроса (нажатие на кнопку)
     */
    private function handleCallbackQuery(array $callbackQuery): void
    {
        $callbackId = $callbackQuery['id'] ?? null;
        $chatId = $callbackQuery['message']['chat']['id'] ?? null;
        $userId = $callbackQuery['from']['id'] ?? null;
        $data = $callbackQuery['data'] ?? '';

        if (!$callbackId || !$chatId || !$userId) {
            return;
        }

        // Подтверждаем получение callback
        $this->answerCallbackQuery($callbackId, "Проверяем подписку...");

        // Обработка проверки подписки
        // Формат: check_<chat_id>
        if (strpos($data, 'check_') === 0 && preg_match('/^check_(\d+)$/', $data, $matches)) {
            $sessionChatId = (int) $matches[1];
            $sessionKey = 'bot_return_url_' . $sessionChatId;
            
            try {
                $returnUrl = Cache::get($sessionKey);
            } catch (\Throwable $e) {
                $returnUrl = null;
            }
            
            if (empty($returnUrl)) {
                $this->sendMessage($chatId, "❌ Ошибка: сессия истекла. Пожалуйста, начните проверку заново.");
                return;
            }
            
            // Удаляем из кеша после использования
            try {
                Cache::forget($sessionKey);
            } catch (\Throwable $e) {
                // Если не удалось удалить из кеша, продолжаем
            }
            
            $this->processSubscriptionCheck($chatId, $userId, $returnUrl);
        }
    }

    /**
     * Процесс проверки подписки
     */
    private function processSubscriptionCheck(int $chatId, int $userId, string $returnUrl): void
    {
        // Шаг 1: Отправляем сообщение "Идет проверка"
        $this->sendMessage($chatId, "⏳ Идет проверка...");

        // Шаг 2: Задержка 20 секунд (как в сценарии бота)
        // Можно настроить в .env через TELEGRAM_CHECK_DELAY (по умолчанию 20)
        $delaySeconds = (int) env('TELEGRAM_CHECK_DELAY', 20);
        if ($delaySeconds > 0 && $delaySeconds < 60) {
            sleep($delaySeconds);
        }

        // Шаг 3: Проверяем подписку
        $isSubscribed = $this->checkUserSubscription($userId);

        // Шаг 4: Отправляем результат с кнопкой для возврата на сайт
        if ($isSubscribed) {
            $this->sendSubscriptionResult($chatId, true, $returnUrl);
        } else {
            $this->sendSubscriptionResult($chatId, false, $returnUrl);
        }
    }

    /**
     * Проверка подписки пользователя в группе
     */
    private function checkUserSubscription(int $userId): bool
    {
        if (!$this->botToken || !$this->chatId) {
            Log::error('Telegram credentials not configured');
            return false;
        }

        try {
            $client = new Client(['base_uri' => $this->apiUrl]);

            $response = $client->get('getChatMember', [
                'query' => [
                    'chat_id' => $this->chatId,
                    'user_id' => $userId
                ],
                'http_errors' => false,
            ]);

            $data = json_decode((string) $response->getBody(), true);

            if (!$data['ok']) {
                Log::error('Error checking subscription', [
                    'user_id' => $userId,
                    'error' => $data['description'] ?? 'Unknown error'
                ]);
                return false;
            }

            $status = $data['result']['status'] ?? 'left';
            // Статусы: 'creator', 'administrator', 'member', 'restricted', 'left', 'kicked'
            return in_array($status, ['creator', 'administrator', 'member', 'restricted']);

        } catch (GuzzleException $e) {
            Log::error('Telegram API request failed', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);
            return false;
        }
    }

    /**
     * Отправка результата проверки подписки
     */
    private function sendSubscriptionResult(int $chatId, bool $isSubscribed, string $returnUrl): void
    {
        // Формируем URL для возврата на сайт
        // returnUrl уже содержит ?success=1#/payment, нужно добавить subscribed параметр
        $returnUrlParsed = parse_url($returnUrl);
        $scheme = $returnUrlParsed['scheme'] ?? 'http';
        $host = $returnUrlParsed['host'] ?? '';
        $path = $returnUrlParsed['path'] ?? '/';
        $query = $returnUrlParsed['query'] ?? '';
        $fragment = $returnUrlParsed['fragment'] ?? '';
        
        // Добавляем параметры subscribed и success
        $params = [];
        if ($query) {
            parse_str($query, $params);
        }
        $params['success'] = '1';
        $params['subscribed'] = $isSubscribed ? '1' : '0';
        
        $newQuery = http_build_query($params);
        
        // Формируем полный URL с hash (если был)
        $redirectUrl = $scheme . '://' . $host . $path;
        if ($newQuery) {
            $redirectUrl .= '?' . $newQuery;
        }
        if ($fragment) {
            $redirectUrl .= '#' . $fragment;
        }

        // Настройка: показывать ли кнопки (можно настроить через .env)
        $showButtons = env('TELEGRAM_SHOW_BUTTONS', true);

        if ($isSubscribed) {
            $message = "✅ Вы подписаны! Вернитесь на сайт.";
        } else {
            $message = "❌ Вы не подписаны, вам необходимо подписаться!";
        }

        // Если кнопки включены, добавляем их
        if ($showButtons) {
            $keyboard = [
                'inline_keyboard' => [
                    [
                        [
                            'text' => $isSubscribed ? 'Вернуться на сайт' : 'Перейти на сайт',
                            'url' => $redirectUrl
                        ]
                    ]
                ]
            ];
            $this->sendMessage($chatId, $message, $keyboard);
        } else {
            // Если кнопки отключены, отправляем только текст с URL в сообщении
            $messageWithUrl = $message . "\n\n" . $redirectUrl;
            $this->sendMessage($chatId, $messageWithUrl);
        }
    }

    /**
     * Отправка обычного приветственного сообщения
     */
    private function sendWelcomeMessage(int $chatId): void
    {
        $message = "👋 Привет! Я бот для проверки подписки на сообщество GROSS Community.\n\n" .
                   "Используйте команду /start check_<url> для проверки подписки.";
        
        $this->sendMessage($chatId, $message);
    }

    /**
     * Отправка сообщения в Telegram
     */
    private function sendMessage(int $chatId, string $text, ?array $replyMarkup = null): bool
    {
        try {
            if (empty($this->botToken) || empty($this->apiUrl)) {
                try {
                    Log::error('Cannot send message: TELEGRAM_BOT_TOKEN not configured');
                } catch (\Throwable $e) {
                    error_log('Cannot send message: TELEGRAM_BOT_TOKEN not configured');
                }
                return false;
            }
            
            $client = new Client([
                'base_uri' => $this->apiUrl,
                'timeout' => 10,
                'connect_timeout' => 5
            ]);

            $params = [
                'chat_id' => $chatId,
                'text' => $text
            ];

            // Используем HTML parse mode только если текст содержит HTML теги
            if (strip_tags($text) !== $text) {
                $params['parse_mode'] = 'HTML';
            }

            if ($replyMarkup) {
                $params['reply_markup'] = json_encode($replyMarkup);
            }

            $response = $client->post('sendMessage', [
                'form_params' => $params,
                'http_errors' => false,
            ]);

            $responseBody = (string) $response->getBody();
            $data = json_decode($responseBody, true);
            
            if (!is_array($data) || !isset($data['ok']) || !$data['ok']) {
                try {
                    Log::error('Telegram API error when sending message', [
                        'error' => $data['description'] ?? 'Unknown error',
                        'chat_id' => $chatId,
                        'error_code' => $data['error_code'] ?? null,
                        'response' => $responseBody
                    ]);
                } catch (\Throwable $e) {
                    error_log('Telegram API error: ' . ($data['description'] ?? 'Unknown error'));
                }
                return false;
            }
            
            try {
                Log::info('Message sent successfully', [
                    'chat_id' => $chatId,
                    'message_id' => $data['result']['message_id'] ?? null
                ]);
            } catch (\Throwable $e) {
                // Если логирование не работает, просто продолжаем
            }
            
            return true;

        } catch (GuzzleException $e) {
            try {
                Log::error('Guzzle error sending Telegram message', [
                    'error' => $e->getMessage(),
                    'chat_id' => $chatId
                ]);
            } catch (\Throwable $logError) {
                error_log('Guzzle error: ' . $e->getMessage());
            }
            return false;
        } catch (\Throwable $e) {
            try {
                Log::error('Unexpected error sending Telegram message', [
                    'error' => $e->getMessage(),
                    'chat_id' => $chatId,
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]);
            } catch (\Throwable $logError) {
                error_log('Error sending message: ' . $e->getMessage());
            }
            return false;
        }
    }

    /**
     * Ответ на callback query
     */
    private function answerCallbackQuery(string $callbackId, ?string $text = null): void
    {
        try {
            $client = new Client(['base_uri' => $this->apiUrl]);

            $params = [
                'callback_query_id' => $callbackId,
            ];

            if ($text) {
                $params['text'] = $text;
            }

            $client->post('answerCallbackQuery', [
                'form_params' => $params,
                'http_errors' => false,
            ]);

        } catch (GuzzleException $e) {
            Log::error('Error answering callback query', [
                'error' => $e->getMessage(),
                'callback_id' => $callbackId,
            ]);
        }
    }
}

