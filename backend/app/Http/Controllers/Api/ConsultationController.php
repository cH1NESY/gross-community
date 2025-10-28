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

        try {
            // Отправляем SMS уведомление в очередь
            SendConsultationSms::dispatch(
                $request->input('full_name'),
                $request->input('phone'),
                $request->input('email')
            );

            Log::info('Заявка на консультацию отправлена в очередь', [
                'user_name' => $request->input('full_name'),
                'user_phone' => $request->input('phone'),
                'user_email' => $request->input('email')
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Заявка на консультацию отправлена! Мы свяжемся с вами в ближайшее время.'
            ]);

        } catch (\Exception $e) {
            Log::error('Ошибка при отправке заявки на консультацию', [
                'error' => $e->getMessage(),
                'user_name' => $request->input('full_name'),
                'user_phone' => $request->input('phone'),
                'user_email' => $request->input('email')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при отправке заявки. Попробуйте позже.'
            ], 500);
        }
    }
}