<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Earning extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'referral_id',
        'type',
        'description',
        'amount',
        'commission_rate',
        'status',
        'approved_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    /**
     * Пользователь, которому начислено
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Связь с рефералом (если начисление за реферала)
     */
    public function referral(): BelongsTo
    {
        return $this->belongsTo(Referral::class);
    }

    /**
     * Получить начисления пользователя
     */
    public static function getUserEarnings($userId, $status = null)
    {
        $query = self::where('user_id', $userId);
        
        if ($status) {
            $query->where('status', $status);
        }
        
        return $query->with('referral.referred')->orderBy('created_at', 'desc')->get();
    }

    /**
     * Получить общую сумму начислений пользователя
     */
    public static function getTotalEarnings($userId, $status = 'approved')
    {
        return self::where('user_id', $userId)
            ->where('status', $status)
            ->sum('amount');
    }
}