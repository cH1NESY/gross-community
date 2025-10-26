<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'full_name',
        'telegram_tag',
        'phone',
        'city',
        'referral_link',
        'agree_to_policy',
        'api_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Рефералы пользователя (кого он пригласил)
     */
    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    /**
     * Кто пригласил пользователя
     */
    public function referrer(): HasOne
    {
        return $this->hasOne(Referral::class, 'referred_id');
    }

    /**
     * Начисления пользователя
     */
    public function earnings(): HasMany
    {
        return $this->hasMany(Earning::class);
    }

    /**
     * Заявки на вывод средств
     */
    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    /**
     * Баланс пользователя
     */
    public function balance(): HasOne
    {
        return $this->hasOne(UserBalance::class);
    }

    /**
     * Получить всех рефералов до определенного уровня
     */
    public function getReferralsUpToLevel($maxLevel = 5)
    {
        return $this->referrals()
            ->where('level', '<=', $maxLevel)
            ->with('referred')
            ->get();
    }

    /**
     * Получить общий доход от рефералов
     */
    public function getTotalReferralEarnings()
    {
        return $this->earnings()
            ->where('type', 'referral')
            ->where('status', 'approved')
            ->sum('amount');
    }
}
