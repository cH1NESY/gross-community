<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Запускаем сидеры в правильном порядке
        $this->call([
            ReferralSeeder::class,
            EarningSeeder::class,
            WithdrawalSeeder::class,
            UserBalanceSeeder::class,
        ]);
    }
}
