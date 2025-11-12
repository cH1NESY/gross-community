<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class CheckTelegramWebhook extends Command
{
    protected $signature = 'telegram:check-webhook';
    protected $description = 'Check current Telegram bot webhook configuration';

    public function handle(): int
    {
        $botToken = env('TELEGRAM_BOT_TOKEN');

        if (!$botToken) {
            $this->error('TELEGRAM_BOT_TOKEN not set in .env');
            return 1;
        }

        $this->info('🔍 Checking current webhook configuration...');
        $this->info('');

        try {
            $client = new Client(['base_uri' => 'https://api.telegram.org/bot' . $botToken . '/']);

            $response = $client->get('getWebhookInfo', [
                'http_errors' => false,
            ]);

            $data = json_decode((string) $response->getBody(), true);

            if (!$data['ok']) {
                $this->error('Failed to get webhook info: ' . ($data['description'] ?? 'Unknown error'));
                return 1;
            }

            $result = $data['result'];
            $webhookUrl = $result['url'] ?? 'не настроен';
            $pendingUpdates = $result['pending_update_count'] ?? 0;
            $hasCustomCert = $result['has_custom_certificate'] ?? false;
            $lastErrorDate = $result['last_error_date'] ?? null;
            $lastErrorMessage = $result['last_error_message'] ?? null;

            $this->info("📡 Webhook URL: {$webhookUrl}");
            $this->info("⏳ Pending updates: {$pendingUpdates}");
            
            if ($hasCustomCert) {
                $this->info("🔒 Custom certificate: да");
            }

            if ($lastErrorDate) {
                $this->warn("❌ Last error: " . date('Y-m-d H:i:s', $lastErrorDate));
                $this->warn("   Message: {$lastErrorMessage}");
            }

            $this->info('');

            // Анализ webhook
            if (empty($webhookUrl) || $webhookUrl === '') {
                $this->warn('⚠️ Webhook не настроен!');
                $this->info('Установите webhook: php artisan telegram:set-webhook');
            } elseif (strpos($webhookUrl, 'unisender') !== false || strpos($webhookUrl, 'unisender.ru') !== false) {
                $this->warn('⚠️ Webhook настроен на Unisender!');
                $this->info('');
                $this->info('Для использования кода Laravel нужно:');
                $this->info('1. Отключить webhook в Unisender');
                $this->info('2. Установить webhook на Laravel: php artisan telegram:set-webhook');
            } elseif (strpos($webhookUrl, env('APP_URL', '')) !== false || strpos($webhookUrl, '/api/telegram/webhook') !== false) {
                $this->info('✅ Webhook настроен на Laravel!');
                $this->info('Код в TelegramBotController.php будет обрабатывать сообщения.');
            } else {
                $this->warn('⚠️ Webhook настроен на неизвестный URL: ' . $webhookUrl);
                $this->info('Проверьте, правильно ли настроен webhook.');
            }

            return 0;

        } catch (GuzzleException $e) {
            $this->error('Error checking webhook: ' . $e->getMessage());
            return 1;
        }
    }
}

