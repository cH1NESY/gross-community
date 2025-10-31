<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use GuzzleHttp\Client;
use App\Models\Payment;

class PaymentController extends Controller
{
    // Создание платежа в YooKassa и возврат ссылки на оплату
    public function create(Request $request): JsonResponse
    {
        $amount = (float)($request->input('amount', 3500));

        $shopId = env('YK_SHOP_ID');
        $secret = env('YK_SECRET');
        if (!$shopId || !$secret) {
            return response()->json(['message' => 'YooKassa credentials are not configured'], 500);
        }

        // Определяем return_url динамически
        $returnUrl = $this->getReturnUrl($request);

        $client = new Client(['base_uri' => 'https://api.yookassa.ru/v3/']);

        $payload = [
            'amount' => [
                'value' => number_format($amount, 2, '.', ''),
                'currency' => 'RUB',
            ],
            'capture' => true,
            'description' => 'Покупка вступления',
            'confirmation' => [
                'type' => 'redirect',
                'return_url' => $returnUrl,
            ],
        ];

        $idempotenceKey = (string) Str::uuid();

        $response = $client->post('payments', [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode($shopId . ':' . $secret),
                'Idempotence-Key' => $idempotenceKey,
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode($payload, JSON_UNESCAPED_UNICODE),
            'http_errors' => false,
        ]);

        $status = $response->getStatusCode();
        $data = json_decode((string) $response->getBody(), true);

        if ($status >= 400) {
            return response()->json(['message' => 'YooKassa error', 'data' => $data], 502);
        }

        $payment = Payment::create([
            'user_id' => optional($request->user())->id,
            'yk_payment_id' => $data['id'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'amount' => $amount,
            'currency' => 'RUB',
            'confirmation_url' => $data['confirmation']['confirmation_url'] ?? null,
            'paid' => ($data['paid'] ?? false) ? true : false,
            'raw' => $data,
        ]);

        return response()->json([
            'payment_id' => $data['id'] ?? null,
            'confirmation_url' => $data['confirmation']['confirmation_url'] ?? null,
            'status' => $data['status'] ?? null,
            'db_id' => $payment->id,
        ]);
    }

    // Webhook от YooKassa (опционально: можно обработать статус)
    public function webhook(Request $request): JsonResponse
    {
        $event = $request->all();
        $object = $event['object'] ?? [];
        $ykId = $object['id'] ?? null;
        if ($ykId) {
            $payment = Payment::where('yk_payment_id', $ykId)->first();
            if ($payment) {
                $payment->update([
                    'status' => $object['status'] ?? $payment->status,
                    'paid' => (bool)($object['paid'] ?? $payment->paid),
                    'raw' => $event,
                ]);
            }
        }
        return response()->json(['ok' => true]);
    }

    /**
     * Определяет правильный return_url для редиректа после оплаты
     */
    private function getReturnUrl(Request $request): string
    {
        // 1. Если указан явно в запросе - используем его
        $requestUrl = $request->input('return_url');
        if ($requestUrl) {
            return $requestUrl;
        }

        // 2. Пытаемся определить из заголовка Origin или Referer
        $origin = $request->header('Origin');
        $referer = $request->header('Referer');
        
        $frontendUrl = null;
        if ($origin) {
            $frontendUrl = rtrim($origin, '/');
        } elseif ($referer) {
            try {
                $parsed = parse_url($referer);
                $frontendUrl = $parsed['scheme'] . '://' . $parsed['host'];
                if (isset($parsed['port'])) {
                    $frontendUrl .= ':' . $parsed['port'];
                }
            } catch (\Exception $e) {
                // Игнорируем ошибки парсинга
            }
        }

        // 3. Используем переменную окружения
        if (!$frontendUrl) {
            $frontendUrl = env('FRONTEND_URL', env('YK_RETURN_URL'));
        }

        // 4. Если все еще не определено - используем дефолт
        if (!$frontendUrl) {
            $frontendUrl = 'http://localhost:5173';
        }

        // Убираем слэш в конце и добавляем путь с параметрами
        // Используем query параметры ДО hash для лучшей совместимости
        $frontendUrl = rtrim($frontendUrl, '/');
        // Формат: http://domain:port/?success=1#/payment
        // Это гарантирует, что параметр будет виден и в search, и может быть обработан в hash
        return $frontendUrl . '/?success=1#/payment';
    }
}


