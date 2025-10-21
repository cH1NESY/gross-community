<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserSubmissionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PaymentController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/users', [UserSubmissionController::class, 'store']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/setup-password', [AuthController::class, 'setupPassword']);
});

// Платежи (публичный create, webhook)
Route::post('/payments', [PaymentController::class, 'create']);
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);


