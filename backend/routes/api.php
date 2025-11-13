<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserSubmissionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\EarningController;
use App\Http\Controllers\Api\WithdrawalController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\TelegramSubscriptionController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/users', [UserSubmissionController::class, 'store']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/consultation', [ConsultationController::class, 'requestConsultation']);
Route::post('/check-subscription', [SubscriptionController::class, 'checkSubscription']);

// Telegram Subscription Check API (для Unisender и других сервисов)
Route::post('/telegram/check-subscription-by-user-id', [TelegramSubscriptionController::class, 'checkByUserId']);
Route::post('/telegram/check-subscription-by-username', [TelegramSubscriptionController::class, 'checkByUsername']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/setup-password', [AuthController::class, 'setupPassword']);
    
    // Реферальная программа
    Route::get('/referrals', [ReferralController::class, 'getReferrals']);
    Route::get('/referrals/stats', [ReferralController::class, 'getStats']);
    
    // Вознаграждения
    Route::get('/earnings', [EarningController::class, 'getEarnings']);
    Route::get('/earnings/stats', [EarningController::class, 'getStats']);
    
    // Вывод средств
    Route::get('/withdrawals', [WithdrawalController::class, 'getWithdrawals']);
    Route::post('/withdrawals', [WithdrawalController::class, 'createWithdrawal']);
    Route::get('/withdrawals/payment-methods', [WithdrawalController::class, 'getPaymentMethods']);
});

// Платежи (публичный create, webhook)
Route::post('/payments', [PaymentController::class, 'create']);
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// Админ-операции по выводам (по заголовку X-Admin-Token)
Route::post('/withdrawals/{id}/approve', [WithdrawalController::class, 'approveWithdrawal']);
Route::post('/withdrawals/{id}/reject', [WithdrawalController::class, 'rejectWithdrawal']);


