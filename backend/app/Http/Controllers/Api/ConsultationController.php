<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendConsultationSms;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ConsultationController extends Controller
{
    /**
     * Отправить заявку на консультацию
     */
    public function requestConsultation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        // Пытаемся отправить уведомление, но не блокируем ответ пользователю
        $smsSent = false;
        
        try {
            // Пытаемся отправить в очередь RabbitMQ
            try {
                SendConsultationSms::dispatch(
                    $request->input('full_name'),
                    $request->input('phone'),
                    $request->input('email')
                )->onConnection('rabbitmq')->onQueue('default');
                
                $smsSent = true;
                Log::info('Заявка на консультацию отправлена в очередь RabbitMQ', [
                    'user_name' => $request->input('full_name'),
                    'user_phone' => $request->input('phone'),
                    'user_email' => $request->input('email')
                ]);
            } catch (\Exception $queueException) {
                // Если очередь недоступна, пробуем синхронно
                Log::warning('Очередь RabbitMQ недоступна, пробуем синхронно', [
                    'error' => $queueException->getMessage()
                ]);
                
                try {
                    SendConsultationSms::dispatchSync(
                        $request->input('full_name'),
                        $request->input('phone'),
                        $request->input('email')
                    );
                    $smsSent = true;
                    Log::info('Заявка на консультацию отправлена синхронно', [
                        'user_name' => $request->input('full_name'),
                        'user_phone' => $request->input('phone'),
                        'user_email' => $request->input('email')
                    ]);
                } catch (\Exception $syncException) {
                    // Если синхронная отправка тоже не удалась, просто логируем
                    Log::error('Не удалось отправить SMS уведомление', [
                        'error' => $syncException->getMessage(),
                        'queue_error' => $queueException->getMessage(),
                        'user_name' => $request->input('full_name'),
                        'user_phone' => $request->input('phone'),
                        'user_email' => $request->input('email')
                    ]);
                    // Продолжаем выполнение - пользователь все равно получит ответ об успехе
                }
            }
        } catch (\Exception $e) {
            // Логируем, но не прерываем выполнение
            Log::error('Неожиданная ошибка при обработке заявки на консультацию', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_name' => $request->input('full_name'),
                'user_phone' => $request->input('phone'),
                'user_email' => $request->input('email')
            ]);
        }

        // Всегда возвращаем успешный ответ, даже если SMS не отправилось
        // Это гарантирует, что пользователь не увидит ошибку из-за проблем с SMS
        return response()->json([
            'success' => true,
            'message' => 'Заявка на консультацию отправлена! Мы свяжемся с вами в ближайшее время.'
        ]);
    }
}