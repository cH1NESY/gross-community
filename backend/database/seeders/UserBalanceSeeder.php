<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserBalance;
use App\Models\Earning;
use App\Models\Withdrawal;

class UserBalanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        
        foreach ($users as $user) {
            // Получаем все начисления пользователя
            $approvedEarnings = Earning::where('user_id', $user->id)
                ->where('status', 'approved')
                ->sum('amount');
                
            $pendingEarnings = Earning::where('user_id', $user->id)
                ->where('status', 'pending')
                ->sum('amount');
                
            $totalEarnings = Earning::where('user_id', $user->id)->sum('amount');
            
            // Получаем все выведенные средства
            $withdrawnTotal = Withdrawal::where('user_id', $user->id)
                ->where('status', 'completed')
                ->sum('amount');
                
            // Рассчитываем доступный баланс
            $availableBalance = $approvedEarnings - $withdrawnTotal;
            
            // Создаем или обновляем баланс пользователя
            UserBalance::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'total_earned' => $totalEarnings,
                    'available_balance' => max(0, $availableBalance), // Не может быть отрицательным
                    'pending_balance' => $pendingEarnings,
                    'withdrawn_total' => $withdrawnTotal,
                ]
            );
        }
    }
}