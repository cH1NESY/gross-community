<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Referral;
use App\Models\Earning;

class EarningSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $referrals = Referral::with(['referrer', 'referred'])->get();
        
        // Создаем начисления для рефералов
        foreach ($referrals as $referral) {
            // Создаем несколько начислений для каждого реферала
            $earningCount = rand(1, 3);
            
            for ($i = 0; $i < $earningCount; $i++) {
                $baseAmount = rand(1000, 5000); // Базовая сумма от реферала
                $commissionAmount = ($baseAmount * $referral->commission_rate) / 100;
                
                Earning::create([
                    'user_id' => $referral->referrer_id,
                    'referral_id' => $referral->id,
                    'type' => 'referral',
                    'description' => "Комиссия за реферала {$referral->referred->full_name} (уровень {$referral->level})",
                    'amount' => $commissionAmount,
                    'commission_rate' => $referral->commission_rate,
                    'status' => rand(0, 1) ? 'approved' : 'pending', // 50% одобренных
                    'approved_at' => rand(0, 1) ? now()->subDays(rand(1, 30)) : null,
                ]);
            }
        }

        // Создаем дополнительные начисления (бонусы)
        $users = User::limit(10)->get();
        
        foreach ($users as $user) {
            // Бонус за активность
            Earning::create([
                'user_id' => $user->id,
                'referral_id' => null,
                'type' => 'bonus',
                'description' => 'Бонус за активность в сообществе',
                'amount' => rand(500, 1500),
                'commission_rate' => 0.00,
                'status' => 'approved',
                'approved_at' => now()->subDays(rand(1, 15)),
            ]);

            // Бонус за участие в мероприятиях
            if (rand(0, 1)) {
                Earning::create([
                    'user_id' => $user->id,
                    'referral_id' => null,
                    'type' => 'bonus',
                    'description' => 'Бонус за участие в мероприятии',
                    'amount' => rand(800, 2000),
                    'commission_rate' => 0.00,
                    'status' => 'approved',
                    'approved_at' => now()->subDays(rand(1, 20)),
                ]);
            }
        }

        // Создаем ручные начисления (от администратора)
        $adminUsers = User::limit(5)->get();
        
        foreach ($adminUsers as $user) {
            Earning::create([
                'user_id' => $user->id,
                'referral_id' => null,
                'type' => 'manual',
                'description' => 'Ручное начисление от администратора',
                'amount' => rand(1000, 3000),
                'commission_rate' => 0.00,
                'status' => 'approved',
                'approved_at' => now()->subDays(rand(1, 10)),
            ]);
        }
    }
}