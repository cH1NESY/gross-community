<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Referral;

class ReferralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Получаем существующих пользователей
        $users = User::all();
        
        if ($users->count() < 10) {
            // Создаем дополнительных пользователей для тестирования
            for ($i = 1; $i <= 20; $i++) {
                User::create([
                    'full_name' => "Тестовый пользователь {$i}",
                    'email' => "test{$i}@example.com",
                    'telegram_tag' => "@testuser{$i}",
                    'phone' => "+7" . str_pad(rand(1000000000, 9999999999), 10, '0', STR_PAD_LEFT),
                    'city' => ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'][rand(0, 4)],
                    'referral_link' => "https://grosscommunity.com/ref/test{$i}",
                    'agree_to_policy' => true,
                ]);
            }
            $users = User::all();
        }

        // Создаем реферальные связи
        $commissionRates = [
            1 => 50.00, // 50% за прямого реферала
            2 => 25.00, // 25% за реферала 2-го уровня
            3 => 15.00, // 15% за реферала 3-го уровня
            4 => 10.00, // 10% за реферала 4-го уровня
            5 => 5.00,  // 5% за реферала 5-го уровня
        ];

        // Создаем рефералов для первых 5 пользователей
        for ($i = 0; $i < 5; $i++) {
            $referrer = $users[$i];
            
            // Создаем рефералов разных уровней
            for ($level = 1; $level <= 5; $level++) {
                $referredCount = rand(2, 5); // 2-5 рефералов на уровень
                
                for ($j = 0; $j < $referredCount; $j++) {
                    $referredIndex = ($i * 10) + ($level * 2) + $j;
                    
                    if ($referredIndex < $users->count()) {
                        Referral::firstOrCreate([
                            'referrer_id' => $referrer->id,
                            'referred_id' => $users[$referredIndex]->id,
                        ], [
                            'level' => $level,
                            'commission_rate' => $commissionRates[$level],
                        ]);
                    }
                }
            }
        }

        // Создаем дополнительные реферальные связи для демонстрации
        // Используем только существующих пользователей
        $userIds = $users->pluck('id')->toArray();
        
        // Создаем несколько дополнительных реферальных связей
        for ($i = 0; $i < 20; $i++) {
            $referrerId = $userIds[array_rand($userIds)];
            $referredId = $userIds[array_rand($userIds)];
            $level = rand(1, 5);
            
            // Не создаем самореферал
            if ($referrerId !== $referredId) {
                Referral::firstOrCreate([
                    'referrer_id' => $referrerId,
                    'referred_id' => $referredId,
                ], [
                    'level' => $level,
                    'commission_rate' => $commissionRates[$level],
                ]);
            }
        }
    }
}