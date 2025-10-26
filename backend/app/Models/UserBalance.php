<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_earned',
        'available_balance',
        'pending_balance',
        'withdrawn_total',
    ];

    protected $casts = [
        'total_earned' => 'decimal:2',
        'available_balance' => 'decimal:2',
        'pending_balance' => 'decimal:2',
        'withdrawn_total' => 'decimal:2',
    ];

    /**
     * Пользователь
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Получить или создать баланс пользователя
     */
    public static function getOrCreateBalance($userId)
    {
        return self::firstOrCreate(
            ['user_id' => $userId],
            [
                'total_earned' => 0.00,
                'available_balance' => 0.00,
                'pending_balance' => 0.00,
                'withdrawn_total' => 0.00,
            ]
        );
    }

    /**
     * Обновить баланс после начисления
     */
    public function addEarning($amount, $status = 'pending')
    {
        $this->total_earned += $amount;
        
        if ($status === 'approved') {
            $this->available_balance += $amount;
        } else {
            $this->pending_balance += $amount;
        }
        
        $this->save();
    }

    /**
     * Обновить баланс после одобрения начисления
     */
    public function approveEarning($amount)
    {
        $this->pending_balance -= $amount;
        $this->available_balance += $amount;
        $this->save();
    }

    /**
     * Обновить баланс после вывода средств
     */
    public function processWithdrawal($amount)
    {
        $this->available_balance -= $amount;
        $this->withdrawn_total += $amount;
        $this->save();
    }
}