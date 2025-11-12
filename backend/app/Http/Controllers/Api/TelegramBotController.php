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
        $this->botToken = env('TELEGRAM_BOT_TOKEN');
        $this->chatId = env('TELEGRAM_CHAT_ID');
        
        if (!$this->botToken) {
            Log::error('TELEGRAM_BOT_TOKEN not configured in .env');
        }
        
        if (!$this->chatId) {
            Log::error('TELEGRAM_CHAT_ID not configured in .env');
        }
        
        if ($this->botToken) {
            $this->apiUrl = 'https://api.telegram.org/bot' . $this->botToken . '/';
        }
    }

    /**
     * Обработка webhook от Telegram
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            // Проверяем, что токен настроен
            if (!$this->botToken) {
                Log::error('TELEGRAM_BOT_TOKEN not configured');
                return response()->json(['ok' => false, 'error' => 'Bot token not configured'], 500);
            }
            
            $update = $request->all();
            Log::info('Telegram webhook received', [
                'update_id' => $update['update_id'] ?? null,
                'has_message' => isset($update['message']),
                'has_callback_query' => isset($update['callback_query'])
            ]);

            // Обработка сообщений
            if (isset($update['message'])) {
                try {
                    $this->handleMessage($update['message']);
                } catch (\Exception $e) {
                    Log::error('Error handling message', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                        'message' => $update['message']
                    ]);
                }
            }

            // Обработка callback запросов (нажатие на кнопку)
            if (isset($update['callback_query'])) {
                try {
                    $this->handleCallbackQuery($update['callback_query']);
                } catch (\Exception $e) {
                    Log::error('Error handling callback query', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                        'callback_query' => $update['callback_query']
                    ]);
                }
            }

            return response()->json(['ok' => true]);
        } catch (\Exception $e) {
            Log::error('Error processing Telegram webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            // Всегда возвращаем 200, чтобы Telegram не считал webhook нерабочим
            return response()->json(['ok' => false, 'error' => $e->getMessage()]);
        }
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
            Log::warning('Empty return URL in sendMenuWithCheckButton');
            $this->sendMessage($chatId, "❌ Ошибка: не удалось получить URL для возврата.");
            return;
        }

        $message = "Проверим вашу подписку";

        // Сохраняем return_url в сессии пользователя (используем chat_id как ключ)
        // В реальном приложении лучше использовать Redis или базу данных
        // Для простоты сохраняем в файл или используем короткий идентификатор
        $sessionKey = 'bot_return_url_' . $chatId;
        
        // Используем кеш Laravel для временного хранения (TTL 10 минут)
        Cache::put($sessionKey, $returnUrl, 600);
        
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
        
        Log::info('Sent menu with check button', [
            'chat_id' => $chatId,
            'return_url' => $returnUrl,
            'callback_data' => $callbackData
        ]);
    }

    /**
     * Обработка callback запроса (нажатие на кнопку)
     */
    private function handleCallbackQuery(array $callbackQuery): void
    {
        $callbackId = $callbackQuery['id'];
        $chatId = $callbackQuery['message']['chat']['id'];
        $userId = $callbackQuery['from']['id'];
        $data = $callbackQuery['data'] ?? '';

        // Подтверждаем получение callback
        $this->answerCallbackQuery($callbackId, "Проверяем подписку...");

        // Обработка проверки подписки
        // Формат: check_<chat_id> или check_subscription_<encoded_url>
        if (strpos($data, 'check_') === 0) {
            // Новый формат: check_<chat_id> (используем кеш)
            if (preg_match('/^check_(\d+)$/', $data, $matches)) {
                $sessionChatId = (int) $matches[1];
                $sessionKey = 'bot_return_url_' . $sessionChatId;
                $returnUrl = Cache::get($sessionKey);
                
                if (empty($returnUrl)) {
                    Log::warning('Return URL not found in cache', [
                        'chat_id' => $sessionChatId,
                        'callback_data' => $data
                    ]);
                    $this->sendMessage($chatId, "❌ Ошибка: сессия истекла. Пожалуйста, начните проверку заново.");
                    return;
                }
                
                // Удаляем из кеша после использования
                Cache::forget($sessionKey);
                
                $this->processSubscriptionCheck($chatId, $userId, $returnUrl);
            } 
            // Старый формат: check_subscription_<encoded_url> (для обратной совместимости)
            elseif (strpos($data, 'check_subscription_') === 0) {
                $encodedUrl = substr($data, 19);
                $returnUrl = base64_decode($encodedUrl);
                
                if ($returnUrl === false || empty($returnUrl)) {
                    Log::warning('Failed to decode return URL', [
                        'encoded_url' => $encodedUrl,
                        'data' => $data
                    ]);
                    $this->sendMessage($chatId, "❌ Ошибка: не удалось получить URL для возврата.");
                    return;
                }
                
                $this->processSubscriptionCheck($chatId, $userId, $returnUrl);
            }
        }
    }

    /**
     * Процесс проверки подписки
     */
    private function processSubscriptionCheck(int $chatId, int $userId, string $returnUrl): void
    {
        try {
            // Шаг 1: Отправляем сообщение "Идет проверка"
            $this->sendMessage($chatId, "⏳ Идет проверка...");

            // Шаг 2: Задержка 20 секунд (как в сценарии бота)
            // Можно настроить в .env через TELEGRAM_CHECK_DELAY (по умолчанию 20)
            $delaySeconds = (int) env('TELEGRAM_CHECK_DELAY', 20);
            sleep($delaySeconds);

            // Шаг 3: Проверяем подписку
            $isSubscribed = $this->checkUserSubscription($userId);

            // Шаг 4: Отправляем результат с кнопкой для возврата на сайт
            if ($isSubscribed) {
                $this->sendSubscriptionResult($chatId, true, $returnUrl);
            } else {
                $this->sendSubscriptionResult($chatId, false, $returnUrl);
            }
        } catch (\Exception $e) {
            Log::error('Error processing subscription check', [
                'error' => $e->getMessage(),
                'chat_id' => $chatId,
                'user_id' => $userId,
            ]);
            $this->sendMessage($chatId, "❌ Произошла ошибка при проверке подписки. Пожалуйста, попробуйте позже.");
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
            if (!$this->botToken) {
                Log::error('Cannot send message: TELEGRAM_BOT_TOKEN not configured');
                return false;
            }
            
            $client = new Client(['base_uri' => $this->apiUrl]);

            $params = [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML'
            ];

            if ($replyMarkup) {
                $params['reply_markup'] = json_encode($replyMarkup);
            }

            $response = $client->post('sendMessage', [
                'form_params' => $params,
                'http_errors' => false,
            ]);

            $data = json_decode((string) $response->getBody(), true);
            
            if (!$data['ok']) {
                Log::error('Telegram API error when sending message', [
                    'error' => $data['description'] ?? 'Unknown error',
                    'chat_id' => $chatId,
                    'error_code' => $data['error_code'] ?? null
                ]);
                return false;
            }
            
            Log::info('Message sent successfully', [
                'chat_id' => $chatId,
                'message_id' => $data['result']['message_id'] ?? null
            ]);
            
            return true;

        } catch (GuzzleException $e) {
            Log::error('Error sending Telegram message', [
                'error' => $e->getMessage(),
                'chat_id' => $chatId,
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Unexpected error sending Telegram message', [
                'error' => $e->getMessage(),
                'chat_id' => $chatId,
                'trace' => $e->getTraceAsString()
            ]);
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

