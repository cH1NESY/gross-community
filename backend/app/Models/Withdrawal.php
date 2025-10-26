<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'payment_method',
        'payment_details',
        'status',
        'rejection_reason',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array',
        'processed_at' => 'datetime',
    ];

    /**
     * Пользователь, который запросил вывод
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Получить заявки на вывод пользователя
     */
    public static function getUserWithdrawals($userId, $status = null)
    {
        $query = self::where('user_id', $userId);
        
        if ($status) {
            $query->where('status', $status);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Получить общую сумму выведенных средств
     */
    public static function getTotalWithdrawn($userId)
    {
        return self::where('user_id', $userId)
            ->where('status', 'completed')
            ->sum('amount');
    }

    /**
     * Проверить, можно ли создать новую заявку на вывод
     */
    public static function canCreateWithdrawal($userId)
    {
        // Проверяем, есть ли активная заявка
        $activeWithdrawal = self::where('user_id', $userId)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();
            
        return !$activeWithdrawal;
    }
}