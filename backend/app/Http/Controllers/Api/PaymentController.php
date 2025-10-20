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
                'return_url' => env('YK_RETURN_URL', 'http://localhost:5173#/payment?success=1'),
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
}


