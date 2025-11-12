<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class SetTelegramWebhook extends Command
{
    protected $signature = 'telegram:set-webhook {--skip-https-check : Skip HTTPS check (for local testing only)}';
    protected $description = 'Set Telegram bot webhook URL';

    public function handle(): int
    {
        $botToken = env('TELEGRAM_BOT_TOKEN');
        $appUrl = env('APP_URL');
        $skipHttpsCheck = $this->option('skip-https-check') || env('TELEGRAM_SKIP_HTTPS_CHECK', false);

        if (!$botToken) {
            $this->error('TELEGRAM_BOT_TOKEN not set in .env');
            return 1;
        }

        if (!$appUrl) {
            $this->error('APP_URL not set in .env');
            return 1;
        }

        // Проверяем, что URL начинается с https (если не пропущена проверка)
        if (!$skipHttpsCheck && strpos($appUrl, 'https://') !== 0) {
            $this->error('APP_URL must start with https:// (Telegram requires HTTPS for webhooks)');
            $this->warn('Current APP_URL: ' . $appUrl);
            $this->info('');
            $this->info('Solutions:');
            $this->info('1. Install SSL certificate (Let\'s Encrypt) for your domain');
            $this->info('2. Use a reverse proxy with SSL (Cloudflare, etc.)');
            $this->info('3. For local testing: use --skip-https-check flag (webhook will fail, but you can test locally)');
            $this->info('4. For testing: use ngrok or similar tunneling service');
            $this->info('');
            $this->info('Example: APP_URL=https://grosscommunity.ru');
            $this->info('Or use: php artisan telegram:set-webhook --skip-https-check');
            return 1;
        }

        $webhookUrl = rtrim($appUrl, '/') . '/api/telegram/webhook';

        if ($skipHttpsCheck) {
            $this->warn('⚠️ Skipping HTTPS check (for local testing only)');
        }

        $this->info("Setting webhook URL: {$webhookUrl}");

        try {
            $client = new Client(['base_uri' => 'https://api.telegram.org/bot' . $botToken . '/']);

            $response = $client->post('setWebhook', [
                'form_params' => [
                    'url' => $webhookUrl,
                    'allowed_updates' => json_encode(['message', 'callback_query'])
                ],
                'http_errors' => false,
            ]);

            $data = json_decode((string) $response->getBody(), true);

            if ($data['ok']) {
                $this->info('✅ Webhook set successfully!');
                if (isset($data['result']['url'])) {
                    $this->info("Webhook URL: {$data['result']['url']}");
                }
                return 0;
            } else {
                $this->error('Failed to set webhook: ' . ($data['description'] ?? 'Unknown error'));
                return 1;
            }

        } catch (GuzzleException $e) {
            $this->error('Error setting webhook: ' . $e->getMessage());
            return 1;
        }
    }
}

