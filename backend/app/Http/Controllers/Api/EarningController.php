<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Earning;
use App\Models\UserBalance;
use Illuminate\Support\Facades\Auth;

class EarningController extends Controller
{
    /**
     * Получить все начисления пользователя
     */
    public function getEarnings(Request $request)
    {
        $user = Auth::user();
        
        $earnings = Earning::where('user_id', $user->id)
            ->with(['referral.referred'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Группируем по типам
        $groupedEarnings = $earnings->groupBy('type');
        
        $result = [
            'referral' => $groupedEarnings->get('referral', collect())->map(function ($earning) {
                return [
                    'id' => $earning->id,
                    'description' => $earning->description,
                    'amount' => $earning->amount,
                    'commission_rate' => $earning->commission_rate,
                    'status' => $earning->status,
                    'created_at' => $earning->created_at->format('d.m.Y H:i'),
                    'approved_at' => $earning->approved_at ? $earning->approved_at->format('d.m.Y H:i') : null,
                    'referral_name' => $earning->referral ? $earning->referral->referred->full_name : null,
                ];
            }),
            'bonus' => $groupedEarnings->get('bonus', collect())->map(function ($earning) {
                return [
                    'id' => $earning->id,
                    'description' => $earning->description,
                    'amount' => $earning->amount,
                    'status' => $earning->status,
                    'created_at' => $earning->created_at->format('d.m.Y H:i'),
                    'approved_at' => $earning->approved_at ? $earning->approved_at->format('d.m.Y H:i') : null,
                ];
            }),
            'manual' => $groupedEarnings->get('manual', collect())->map(function ($earning) {
                return [
                    'id' => $earning->id,
                    'description' => $earning->description,
                    'amount' => $earning->amount,
                    'status' => $earning->status,
                    'created_at' => $earning->created_at->format('d.m.Y H:i'),
                    'approved_at' => $earning->approved_at ? $earning->approved_at->format('d.m.Y H:i') : null,
                ];
            }),
        ];

        // Получаем баланс пользователя
        $balance = UserBalance::getOrCreateBalance($user->id);

        return response()->json([
            'success' => true,
            'data' => $result,
            'balance' => [
                'total_earned' => $balance->total_earned,
                'available_balance' => $balance->available_balance,
                'pending_balance' => $balance->pending_balance,
                'withdrawn_total' => $balance->withdrawn_total,
            ],
            'summary' => [
                'total_referral_earnings' => $groupedEarnings->get('referral', collect())->where('status', 'approved')->sum('amount'),
                'total_bonus_earnings' => $groupedEarnings->get('bonus', collect())->where('status', 'approved')->sum('amount'),
                'total_manual_earnings' => $groupedEarnings->get('manual', collect())->where('status', 'approved')->sum('amount'),
                'pending_earnings' => $earnings->where('status', 'pending')->sum('amount'),
            ],
        ]);
    }

    /**
     * Получить статистику начислений
     */
    public function getStats(Request $request)
    {
        $user = Auth::user();
        
        $earnings = Earning::where('user_id', $user->id)->get();
        $balance = UserBalance::getOrCreateBalance($user->id);

        $stats = [
            'total_earnings' => $earnings->where('status', 'approved')->sum('amount'),
            'pending_earnings' => $earnings->where('status', 'pending')->sum('amount'),
            'available_balance' => $balance->available_balance,
            'withdrawn_total' => $balance->withdrawn_total,
            'referral_earnings' => $earnings->where('type', 'referral')->where('status', 'approved')->sum('amount'),
            'bonus_earnings' => $earnings->where('type', 'bonus')->where('status', 'approved')->sum('amount'),
            'manual_earnings' => $earnings->where('type', 'manual')->where('status', 'approved')->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats,
        ]);
    }
}