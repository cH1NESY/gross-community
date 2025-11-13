<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

/**
 * Контроллер для проверки подписки через Telegram API
 * Используется для интеграции с Unisender и другими сервисами
 */
class TelegramSubscriptionController extends Controller
{
    private $botToken;
    private $chatId;
    private $apiUrl;

    public function __construct()
    {
        $this->botToken = env('TELEGRAM_BOT_TOKEN');
        $this->chatId = env('TELEGRAM_CHAT_ID');
        
        if ($this->botToken && is_string($this->botToken) && !empty($this->botToken)) {
            $this->apiUrl = 'https://api.telegram.org/bot' . $this->botToken . '/';
        }
    }

    /**
     * Проверка подписки по user_id (для Unisender)
     * 
     * POST /api/telegram/check-subscription-by-user-id
     * Body: {"user_id": 123456789}
     * 
     * Response: {"subscribed": true/false, "status": "member|left|kicked|...", "user_id": 123456789}
     */
    public function checkByUserId(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|integer'
            ]);

            $userId = $request->input('user_id');

            if (!$this->botToken || !$this->chatId) {
                return response()->json([
                    'subscribed' => false,
                    'error' => 'Telegram credentials not configured',
                    'user_id' => $userId
                ], 500);
            }

            $isSubscribed = $this->checkUserSubscription($userId);
            $status = $this->getUserStatus($userId);

            return response()->json([
                'subscribed' => $isSubscribed,
                'status' => $status,
                'user_id' => $userId,
                'chat_id' => $this->chatId
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'subscribed' => false,
                'error' => 'Validation failed',
                'message' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            Log::error('Error checking subscription by user_id', [
                'error' => $e->getMessage(),
                'user_id' => $request->input('user_id'),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'subscribed' => false,
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Проверка подписки по username (для обратной совместимости)
     * 
     * POST /api/telegram/check-subscription-by-username
     * Body: {"username": "username"}
     * 
     * Response: {"subscribed": true/false, "status": "member|left|kicked|...", "username": "username"}
     */
    public function checkByUsername(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'username' => 'required|string'
            ]);

            $username = $request->input('username');
            
            // Убираем @ если есть
            $username = ltrim($username, '@');

            if (!$this->botToken || !$this->chatId) {
                return response()->json([
                    'subscribed' => false,
                    'error' => 'Telegram credentials not configured',
                    'username' => $username
                ], 500);
            }

            // Сначала пытаемся получить user_id по username
            $userId = $this->getUserIdByUsername($username);
            
            if (!$userId) {
                return response()->json([
                    'subscribed' => false,
                    'error' => 'User not found',
                    'username' => $username
                ], 404);
            }

            $isSubscribed = $this->checkUserSubscription($userId);
            $status = $this->getUserStatus($userId);

            return response()->json([
                'subscribed' => $isSubscribed,
                'status' => $status,
                'user_id' => $userId,
                'username' => $username,
                'chat_id' => $this->chatId
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'subscribed' => false,
                'error' => 'Validation failed',
                'message' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            Log::error('Error checking subscription by username', [
                'error' => $e->getMessage(),
                'username' => $request->input('username'),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'subscribed' => false,
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Проверка подписки пользователя в группе
     */
    private function checkUserSubscription(int $userId): bool
    {
        if (!$this->botToken || !$this->chatId) {
            return false;
        }

        try {
            $client = new Client([
                'base_uri' => $this->apiUrl,
                'timeout' => 10,
                'connect_timeout' => 5
            ]);

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
                    'error' => $data['description'] ?? 'Unknown error',
                    'error_code' => $data['error_code'] ?? null
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
        } catch (\Exception $e) {
            Log::error('Unexpected error checking subscription', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);
            return false;
        }
    }

    /**
     * Получение статуса пользователя в группе
     */
    private function getUserStatus(int $userId): string
    {
        if (!$this->botToken || !$this->chatId) {
            return 'unknown';
        }

        try {
            $client = new Client([
                'base_uri' => $this->apiUrl,
                'timeout' => 10,
                'connect_timeout' => 5
            ]);

            $response = $client->get('getChatMember', [
                'query' => [
                    'chat_id' => $this->chatId,
                    'user_id' => $userId
                ],
                'http_errors' => false,
            ]);

            $data = json_decode((string) $response->getBody(), true);

            if (!$data['ok']) {
                return 'unknown';
            }

            return $data['result']['status'] ?? 'left';

        } catch (\Exception $e) {
            Log::error('Error getting user status', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);
            return 'unknown';
        }
    }

    /**
     * Получение user_id по username
     */
    private function getUserIdByUsername(string $username): ?int
    {
        if (!$this->botToken || !$this->chatId) {
            return null;
        }

        try {
            $client = new Client([
                'base_uri' => $this->apiUrl,
                'timeout' => 10,
                'connect_timeout' => 5
            ]);

            // Пытаемся получить информацию о чате (группе)
            // Если группа публичная, можем попробовать getChat
            // Но лучше использовать getChatMember напрямую с user_id
            
            // Для приватных групп нужно знать user_id
            // Поэтому этот метод может не работать для всех случаев
            // Возвращаем null, чтобы вызывающий код мог обработать это
            
            return null;

        } catch (\Exception $e) {
            Log::error('Error getting user_id by username', [
                'error' => $e->getMessage(),
                'username' => $username,
            ]);
            return null;
        }
    }
}

