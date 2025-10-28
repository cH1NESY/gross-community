<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendConsultationSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 30;
    public $tries = 3;

    protected $userName;
    protected $userPhone;
    protected $userEmail;

    /**
     * Create a new job instance.
     */
    public function __construct(string $userName, string $userPhone, string $userEmail)
    {
        $this->userName = $userName;
        $this->userPhone = $userPhone;
        $this->userEmail = $userEmail;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $message = "Новая заявка на консультацию!\n";
            $message .= "Имя: {$this->userName}\n";
            $message .= "Телефон: {$this->userPhone}\n";
            $message .= "Email: {$this->userEmail}\n";
            $message .= "Время: " . now()->format('d.m.Y H:i');

            $this->sendSms($message);
            
            Log::info('SMS отправлено успешно', [
                'user_name' => $this->userName,
                'user_phone' => $this->userPhone,
                'message' => $message
            ]);
        } catch (\Exception $e) {
            Log::error('Ошибка отправки SMS', [
                'error' => $e->getMessage(),
                'user_name' => $this->userName,
                'user_phone' => $this->userPhone
            ]);
            
            throw $e;
        }
    }

    /**
     * Отправка SMS через API
     */
    private function sendSms(string $message): void
    {
        $phoneNumber = env('SMS_PHONE_NUMBER', '89243513155');
        $apiKey = env('SMS_API_KEY');
        
        if (!$apiKey) {
            // Если нет API ключа, просто логируем сообщение
            Log::info('SMS уведомление (без API):', [
                'to' => $phoneNumber,
                'message' => $message
            ]);
            return;
        }

        $response = Http::timeout(10)->post(env('SMS_PROVIDER_URL', 'https://api.sms.ru/sms/send'), [
            'api_id' => $apiKey,
            'to' => $phoneNumber,
            'msg' => $message,
            'json' => 1
        ]);

        if (!$response->successful()) {
            throw new \Exception('SMS API вернул ошибку: ' . $response->body());
        }

        $result = $response->json();
        
        if (isset($result['status']) && $result['status'] !== 'OK') {
            throw new \Exception('SMS не отправлено: ' . ($result['status_text'] ?? 'Неизвестная ошибка'));
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Job SendConsultationSms failed', [
            'error' => $exception->getMessage(),
            'user_name' => $this->userName,
            'user_phone' => $this->userPhone,
            'user_email' => $this->userEmail
        ]);
    }
}