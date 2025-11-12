<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class SubscriptionController extends Controller
{
    /**
     * Проверка реальной подписки пользователя в Telegram группе через Bot API
     */
    public function checkSubscription(Request $request): JsonResponse
    {
        $validator = \Validator::make($request->all(), [
            'telegram_username' => 'required|string|max:32|regex:/^[a-zA-Z0-9_]+$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        $username = $request->input('telegram_username');
        $botToken = env('TELEGRAM_BOT_TOKEN');
        $chatId = env('TELEGRAM_CHAT_ID'); // ID группы (например: -1001234567890)
        $botUsername = env('TELEGRAM_BOT_USERNAME');
        $groupLink = env('TELEGRAM_GROUP_LINK', 'https://t.me/+tTW-bBfMvyI0ZTE1');
        $botHandle = $botUsername ? '@' . ltrim($botUsername, '@') : null;
        $botUrl = $botUsername ? 'https://t.me/' . ltrim($botUsername, '@') : null;

        if (!$botToken || !$chatId) {
            Log::error('Telegram credentials not configured', [
                'has_bot_token' => !empty($botToken),
                'has_chat_id' => !empty($chatId),
            ]);

            return response()->json([
                'success' => false,
                'subscribed' => false,
                'message' => 'Сервис проверки подписки не настроен. Пожалуйста, обратитесь в поддержку.'
            ], 500);
        }

        try {
            $client = new Client(['base_uri' => 'https://api.telegram.org/bot' . $botToken . '/']);

            // Получаем user_id по username через Telegram API
            // Это работает только для публичных профилей
            $getUserResponse = $client->get('getChat', [
                'query' => [
                    'chat_id' => '@' . $username
                ],
                'http_errors' => false,
            ]);

            $userData = json_decode((string) $getUserResponse->getBody(), true);

            if (!$userData['ok'] || !isset($userData['result']['id'])) {
                $errorCode = $userData['error_code'] ?? null;
                $description = $userData['description'] ?? 'unknown error';

                Log::warning('Unable to resolve Telegram username', [
                    'username' => $username,
                    'error_code' => $errorCode,
                    'description' => $description,
                ]);

                if ($errorCode === 403) {
                    $message = $botHandle
                        ? "Пожалуйста, сначала откройте бота {$botHandle} и нажмите «Start», затем повторите проверку."
                        : 'Пожалуйста, сначала откройте нашего Telegram-бота и нажмите «Start», затем повторите проверку.';

                    return response()->json([
                        'success' => false,
                        'subscribed' => false,
                        'message' => $message,
                        'bot_link' => $botUrl,
                    ], 403);
                }

                if (in_array($errorCode, [400, 404], true)) {
                    return response()->json([
                        'success' => false,
                        'subscribed' => false,
                        'message' => 'Не удалось найти пользователя с таким username. Убедитесь, что профиль публичный и username указан без символа @.',
                        'bot_link' => $botUrl,
                    ], 404);
                }

                return response()->json([
                    'success' => false,
                    'subscribed' => false,
                    'message' => 'Telegram API временно недоступен. Попробуйте позже или напишите в поддержку.',
                    'bot_link' => $botUrl,
                ], 502);
            }

            $userId = $userData['result']['id'];

            // Шаг 2: Проверяем, является ли пользователь членом группы
            $memberResponse = $client->get('getChatMember', [
                'query' => [
                    'chat_id' => $chatId,
                    'user_id' => $userId
                ],
                'http_errors' => false,
            ]);

            $memberData = json_decode((string) $memberResponse->getBody(), true);

            if (!$memberData['ok']) {
                $errorCode = $memberData['error_code'] ?? 0;
                $errorMessage = $memberData['description'] ?? 'Unknown error';

                Log::error('Telegram API error in getChatMember', [
                    'error_code' => $errorCode,
                    'error_message' => $errorMessage,
                    'username' => $username,
                    'user_id' => $userId,
                    'chat_id' => $chatId,
                ]);

                if ($errorCode === 403) {
                    $message = $botHandle
                        ? "Похоже, бот был удален из группы или заблокирован. Проверьте, что {$botHandle} все еще администратор группы и повторите попытку."
                        : 'Похоже, бот потерял доступ к группе. Проверьте права бота и повторите попытку.';

                    return response()->json([
                        'success' => false,
                        'subscribed' => false,
                        'message' => $message,
                        'bot_link' => $botUrl,
                        'join_link' => $groupLink,
                    ], 500);
                }

                // Ошибка 400 - пользователь не найден в группе
                if ($errorCode === 400) {
                    return response()->json([
                        'success' => true,
                        'subscribed' => false,
                        'message' => 'Вы не являетесь участником группы. Пожалуйста, присоединитесь к нашему Telegram сообществу.',
                        'join_link' => $groupLink,
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'subscribed' => false,
                    'message' => 'Ошибка при проверке подписки. Пожалуйста, попробуйте позже или обратитесь в поддержку.',
                    'join_link' => $groupLink,
                ], 500);
            }

            $status = $memberData['result']['status'] ?? 'left';

            // Статусы: 'creator', 'administrator', 'member', 'restricted', 'left', 'kicked'
            $isSubscribed = in_array($status, ['creator', 'administrator', 'member', 'restricted']);

            if ($isSubscribed) {
                return response()->json([
                    'success' => true,
                    'subscribed' => true,
                    'message' => 'Отлично! Вы подписаны на наше Telegram сообщество. Добро пожаловать!',
                    'status' => $status,
                    'join_link' => $groupLink,
                    'bot_link' => $botUrl,
                ]);
            }

            return response()->json([
                'success' => true,
                'subscribed' => false,
                'message' => 'Вы не подписаны на наше сообщество. Пожалуйста, присоединитесь к группе для получения доступа.',
                'status' => $status,
                'join_link' => $groupLink,
                'bot_link' => $botUrl,
            ]);

        } catch (GuzzleException $e) {
            Log::error('Telegram API request failed', [
                'error' => $e->getMessage(),
                'username' => $username,
            ]);

            return response()->json([
                'success' => false,
                'subscribed' => false,
                'message' => 'Ошибка при подключении к Telegram API. Пожалуйста, попробуйте позже.'
            ], 500);
        } catch (\Exception $e) {
            Log::error('Unexpected error in checkSubscription', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'username' => $username,
            ]);

            return response()->json([
                'success' => false,
                'subscribed' => false,
                'message' => 'Произошла неожиданная ошибка. Пожалуйста, попробуйте позже.'
            ], 500);
        }
    }
}

