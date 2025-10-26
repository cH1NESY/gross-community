<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'referrer_id',
        'referred_id',
        'level',
        'commission_rate',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
    ];

    /**
     * Реферер (кто пригласил)
     */
    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    /**
     * Реферал (кого пригласили)
     */
    public function referred(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    /**
     * Получить всех рефералов пользователя по уровню
     */
    public static function getReferralsByLevel($userId, $level = null)
    {
        $query = self::where('referrer_id', $userId);
        
        if ($level) {
            $query->where('level', $level);
        }
        
        return $query->with('referred')->get();
    }

    /**
     * Получить всех рефералов пользователя до определенного уровня
     */
    public static function getReferralsUpToLevel($userId, $maxLevel = 5)
    {
        return self::where('referrer_id', $userId)
            ->where('level', '<=', $maxLevel)
            ->with('referred')
            ->get();
    }
}