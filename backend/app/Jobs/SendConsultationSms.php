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
     * Отправка SMS через API SMS.ru
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

        // Форматируем номер телефона (убираем все кроме цифр, начинаем с 7 или 8)
        $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);
        
        // Если номер начинается с 8, заменяем на 7
        if (strlen($phoneNumber) >= 10 && $phoneNumber[0] == '8') {
            $phoneNumber = '7' . substr($phoneNumber, 1);
        }
        
        // Если номер не начинается с 7, добавляем 7
        if (strlen($phoneNumber) == 10 && $phoneNumber[0] != '7') {
            $phoneNumber = '7' . $phoneNumber;
        }
        
        // Валидация формата номера (должен быть 11 цифр, начинаться с 7)
        if (strlen($phoneNumber) != 11 || $phoneNumber[0] != '7') {
            throw new \Exception('Неверный формат номера телефона. Должен быть в формате: 79243513155');
        }
        
        // SMS.ru API URL
        $apiUrl = env('SMS_PROVIDER_URL', 'https://sms.ru/sms/send');
        
        // Буквенный отправитель (если настроен)
        $from = env('SMS_FROM', null);
        
        try {
            $params = [
                'api_id' => $apiKey,
                'to' => $phoneNumber,
                'msg' => $message,
                'json' => 1
            ];
            
            // Добавляем отправителя, если он настроен
            if ($from) {
                $params['from'] = $from;
            }
            
            $response = Http::timeout(15)
                ->asForm()
                ->post($apiUrl, $params);

            if (!$response->successful()) {
                throw new \Exception('SMS API вернул HTTP ошибку: ' . $response->status() . ' - ' . $response->body());
            }

            $rawBody = $response->body();
            $result = $response->json();
            
            // Логируем сырой ответ для отладки
            Log::info('SMS.ru API Response', [
                'raw_body' => $rawBody,
                'parsed_json' => $result,
                'status_code' => $response->status()
            ]);
            
            // Проверяем статус ответа от SMS.ru
            if (!isset($result['status'])) {
                Log::error('Неверный формат ответа от SMS.ru API', [
                    'raw_body' => $rawBody,
                    'parsed_json' => $result,
                    'is_array' => is_array($result)
                ]);
                throw new \Exception('Неверный формат ответа от SMS.ru API. Ответ: ' . substr($rawBody, 0, 500));
            }
            
            // SMS.ru возвращает статус "OK" при успехе и код статуса 100
            if ($result['status'] === 'OK') {
                $statusCode = $result['status_code'] ?? null;
                
                // Проверяем статус отправки для конкретного номера
                if (isset($result['sms'][$phoneNumber])) {
                    $smsStatus = $result['sms'][$phoneNumber];
                    
                    // Проверяем успешность отправки для конкретного номера
                    if ($smsStatus['status'] === 'OK' && $smsStatus['status_code'] == 100) {
                        Log::info('SMS успешно отправлено через SMS.ru', [
                            'to' => $phoneNumber,
                            'sms_id' => $smsStatus['sms_id'] ?? null,
                            'status_code' => $smsStatus['status_code'],
                            'balance' => $result['balance'] ?? null
                        ]);
                        return;
                    } elseif ($smsStatus['status'] === 'ERROR' || $smsStatus['status_code'] != 100) {
                        // Ошибка при отправке на конкретный номер
                        $errorText = $smsStatus['status_text'] ?? 'Неизвестная ошибка';
                        $errorCode = $smsStatus['status_code'] ?? 'unknown';
                        
                        Log::error('SMS.ru вернул ошибку для номера', [
                            'phone' => $phoneNumber,
                            'error_code' => $errorCode,
                            'error_text' => $errorText
                        ]);
                        
                        throw new \Exception("SMS.ru вернул ошибку: {$errorText} (код: {$errorCode})");
                    }
                }
                
                // Если статус OK, но нет детальной информации по номеру
                if ($statusCode == 100) {
                    Log::info('SMS успешно отправлено через SMS.ru (без детальной информации)', [
                        'to' => $phoneNumber,
                        'status_code' => $statusCode,
                        'balance' => $result['balance'] ?? null
                    ]);
                    return;
                }
            }
            
            // Обработка ошибок от SMS.ru
            $errorMessage = $result['status_text'] ?? 'Неизвестная ошибка';
            $errorCode = $result['status_code'] ?? 'unknown';
            
            throw new \Exception("SMS.ru вернул ошибку: {$errorMessage} (код: {$errorCode})");
            
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            throw new \Exception('Ошибка подключения к SMS.ru API: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Ошибка отправки SMS через SMS.ru', [
                'error' => $e->getMessage(),
                'phone' => $phoneNumber,
                'api_url' => $apiUrl
            ]);
            throw $e;
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