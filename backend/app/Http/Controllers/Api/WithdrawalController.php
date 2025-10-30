<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Withdrawal;
use App\Models\UserBalance;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class WithdrawalController extends Controller
{
    /**
     * Получить все заявки на вывод средств пользователя
     */
    public function getWithdrawals(Request $request)
    {
        $user = Auth::user();
        
        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $result = $withdrawals->map(function ($withdrawal) {
            return [
                'id' => $withdrawal->id,
                'amount' => $withdrawal->amount,
                'payment_method' => $withdrawal->payment_method,
                'payment_details' => $withdrawal->payment_details,
                'status' => $withdrawal->status,
                'rejection_reason' => $withdrawal->rejection_reason,
                'created_at' => $withdrawal->created_at->format('d.m.Y H:i'),
                'processed_at' => $withdrawal->processed_at ? $withdrawal->processed_at->format('d.m.Y H:i') : null,
            ];
        });

        // Получаем баланс пользователя
        $balance = UserBalance::getOrCreateBalance($user->id);

        return response()->json([
            'success' => true,
            'data' => $result,
            'balance' => [
                'available_balance' => $balance->available_balance,
                'pending_balance' => $balance->pending_balance,
                'withdrawn_total' => $balance->withdrawn_total,
            ],
        ]);
    }

    /**
     * Создать новую заявку на вывод средств
     */
    public function createWithdrawal(Request $request)
    {
        $user = Auth::user();
        
        // Валидация
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:100|max:100000',
            'payment_method' => 'required|in:card,bank_account,qiwi,yoomoney',
            'payment_details' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Раньше блокировали, если была активная заявка. Теперь разрешаем — заявки завершаются автоматически.

        // Получаем баланс пользователя
        $balance = UserBalance::getOrCreateBalance($user->id);

        // Проверяем, достаточно ли средств
        if ($request->amount > $balance->available_balance) {
            return response()->json([
                'success' => false,
                'message' => 'Недостаточно средств на балансе',
                'available_balance' => $balance->available_balance,
            ], 400);
        }

        // Создаем заявку и сразу завершаем (без админ-подтверждения)
        $withdrawal = Withdrawal::create([
            'user_id' => $user->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_details' => $request->payment_details,
            'status' => 'completed',
            'processed_at' => now(),
        ]);

        // Моментально корректируем баланс
        $balance->available_balance = $balance->available_balance - $withdrawal->amount;
        if ($balance->available_balance < 0) {
            $balance->available_balance = 0; // страховка
        }
        $balance->withdrawn_total = $balance->withdrawn_total + $withdrawal->amount;
        $balance->save();

        Log::info('Withdrawal auto-completed', [
            'withdrawal_id' => $withdrawal->id,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Заявка на вывод средств выполнена',
            'data' => [
                'id' => $withdrawal->id,
                'amount' => $withdrawal->amount,
                'payment_method' => $withdrawal->payment_method,
                'status' => $withdrawal->status,
                'created_at' => $withdrawal->created_at->format('d.m.Y H:i'),
                'processed_at' => $withdrawal->processed_at->format('d.m.Y H:i'),
            ],
        ]);
    }

    /**
     * Получить доступные способы вывода средств
     */
    public function getPaymentMethods(Request $request)
    {
        $methods = [
            'card' => [
                'name' => 'Банковская карта',
                'description' => 'Вывод на банковскую карту',
                'fields' => [
                    'card_number' => 'Номер карты',
                    'cardholder_name' => 'Имя держателя карты',
                    'bank' => 'Банк',
                ],
            ],
            'bank_account' => [
                'name' => 'Банковский счет',
                'description' => 'Вывод на банковский счет',
                'fields' => [
                    'account_number' => 'Номер счета',
                    'bank_name' => 'Название банка',
                    'bik' => 'БИК',
                ],
            ],
            'qiwi' => [
                'name' => 'QIWI Кошелек',
                'description' => 'Вывод на QIWI кошелек',
                'fields' => [
                    'phone' => 'Номер телефона',
                    'wallet_id' => 'ID кошелька',
                ],
            ],
            'yoomoney' => [
                'name' => 'ЮMoney',
                'description' => 'Вывод на ЮMoney кошелек',
                'fields' => [
                    'wallet_number' => 'Номер кошелька',
                    'phone' => 'Номер телефона',
                ],
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }

    /**
     * Подтвердить (одобрить) заявку на вывод средств [ADMIN]
     * Требует заголовок X-Admin-Token, совпадающий с env('ADMIN_API_TOKEN')
     */
    public function approveWithdrawal(Request $request, int $id)
    {
        if ($request->header('X-Admin-Token') !== env('ADMIN_API_TOKEN')) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещен'], 403);
        }

        $withdrawal = Withdrawal::find($id);
        if (!$withdrawal) {
            return response()->json(['success' => false, 'message' => 'Заявка не найдена'], 404);
        }
        if ($withdrawal->status !== 'pending' && $withdrawal->status !== 'processing') {
            return response()->json(['success' => false, 'message' => 'Неверный статус заявки'], 400);
        }

        $balance = UserBalance::getOrCreateBalance($withdrawal->user_id);

        // Финализация вывода: списываем доступный баланс и увеличиваем withdrawn_total,
        // если ещё не резервировали. Если резерва не было, проверим достаточно ли средств.
        if ($withdrawal->status === 'pending') {
            if ($withdrawal->amount > $balance->available_balance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Недостаточно средств на балансе для одобрения',
                ], 400);
            }
            $balance->available_balance = $balance->available_balance - $withdrawal->amount;
        }
        $balance->withdrawn_total = $balance->withdrawn_total + $withdrawal->amount;
        $balance->save();

        $withdrawal->status = 'completed';
        $withdrawal->processed_at = now();
        $withdrawal->rejection_reason = null;
        $withdrawal->save();

        Log::info('Withdrawal approved', ['withdrawal_id' => $withdrawal->id]);

        return response()->json(['success' => true, 'message' => 'Заявка одобрена']);
    }

    /**
     * Отклонить заявку на вывод средств [ADMIN]
     */
    public function rejectWithdrawal(Request $request, int $id)
    {
        if ($request->header('X-Admin-Token') !== env('ADMIN_API_TOKEN')) {
            return response()->json(['success' => false, 'message' => 'Доступ запрещен'], 403);
        }

        $withdrawal = Withdrawal::find($id);
        if (!$withdrawal) {
            return response()->json(['success' => false, 'message' => 'Заявка не найдена'], 404);
        }
        if ($withdrawal->status !== 'pending' && $withdrawal->status !== 'processing') {
            return response()->json(['success' => false, 'message' => 'Неверный статус заявки'], 400);
        }

        $reason = $request->input('reason');

        $withdrawal->status = 'rejected';
        $withdrawal->processed_at = now();
        $withdrawal->rejection_reason = $reason;
        $withdrawal->save();

        // Возврат денег: если хотим, можно возвращать в available_balance, но чаще это делается вручную.
        // Вернём сумму в доступный баланс, если она была зарезервирована логикой выше на стороне бизнеса.
        $balance = UserBalance::getOrCreateBalance($withdrawal->user_id);
        $balance->available_balance = $balance->available_balance + $withdrawal->amount;
        $balance->save();

        Log::info('Withdrawal rejected', ['withdrawal_id' => $withdrawal->id]);

        return response()->json(['success' => true, 'message' => 'Заявка отклонена']);
    }
}