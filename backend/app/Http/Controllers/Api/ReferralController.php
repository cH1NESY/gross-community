<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ReferralController extends Controller
{
    /**
     * Получить всех рефералов пользователя до 5 уровня
     */
    public function getReferrals(Request $request)
    {
        $user = Auth::user();
        
        $referrals = Referral::where('referrer_id', $user->id)
            ->where('level', '<=', 5)
            ->with(['referred'])
            ->orderBy('level')
            ->orderBy('created_at', 'desc')
            ->get();

        // Группируем по уровням
        $groupedReferrals = $referrals->groupBy('level');
        
        $result = [];
        for ($level = 1; $level <= 5; $level++) {
            $levelReferrals = $groupedReferrals->get($level, collect());
            
            $result[] = [
                'level' => $level,
                'commission_rate' => $this->getCommissionRate($level),
                'count' => $levelReferrals->count(),
                'referrals' => $levelReferrals->map(function ($referral) {
                    return [
                        'id' => $referral->referred->id,
                        'name' => $referral->referred->full_name,
                        'email' => $referral->referred->email,
                        'telegram_tag' => $referral->referred->telegram_tag,
                        'city' => $referral->referred->city,
                        'joined_at' => $referral->referred->created_at->format('d.m.Y'),
                        'commission_rate' => $referral->commission_rate,
                    ];
                })
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $result,
            'total_referrals' => $referrals->count(),
            'referral_link' => $user->referral_link,
        ]);
    }

    /**
     * Получить статистику рефералов
     */
    public function getStats(Request $request)
    {
        $user = Auth::user();
        
        $referrals = Referral::where('referrer_id', $user->id)
            ->where('level', '<=', 5)
            ->get();

        $stats = [];
        for ($level = 1; $level <= 5; $level++) {
            $levelReferrals = $referrals->where('level', $level);
            $stats[] = [
                'level' => $level,
                'count' => $levelReferrals->count(),
                'commission_rate' => $this->getCommissionRate($level),
            ];
        }

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'total_referrals' => $referrals->count(),
        ]);
    }

    /**
     * Получить процент комиссии для уровня
     */
    private function getCommissionRate($level)
    {
        $rates = [
            1 => 50.00,
            2 => 25.00,
            3 => 15.00,
            4 => 10.00,
            5 => 5.00,
        ];

        return $rates[$level] ?? 0.00;
    }
}