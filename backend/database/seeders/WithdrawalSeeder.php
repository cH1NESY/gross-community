<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Withdrawal;

class WithdrawalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::limit(15)->get();
        
        $paymentMethods = ['card', 'bank_account', 'qiwi', 'yoomoney'];
        $statuses = ['completed', 'pending', 'processing', 'rejected'];
        
        foreach ($users as $user) {
            // Создаем несколько заявок на вывод для каждого пользователя
            $withdrawalCount = rand(1, 4);
            
            for ($i = 0; $i < $withdrawalCount; $i++) {
                $amount = rand(1000, 10000);
                $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
                $status = $statuses[array_rand($statuses)];
                
                $paymentDetails = $this->generatePaymentDetails($paymentMethod);
                
                $withdrawal = Withdrawal::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'payment_method' => $paymentMethod,
                    'payment_details' => $paymentDetails,
                    'status' => $status,
                    'rejection_reason' => $status === 'rejected' ? 'Недостаточно средств на балансе' : null,
                    'processed_at' => in_array($status, ['completed', 'rejected']) ? now()->subDays(rand(1, 30)) : null,
                ]);
            }
        }
    }
    
    private function generatePaymentDetails($paymentMethod)
    {
        switch ($paymentMethod) {
            case 'card':
                return [
                    'card_number' => '**** **** **** ' . rand(1000, 9999),
                    'cardholder_name' => 'Иван Иванов',
                    'bank' => 'Сбербанк'
                ];
            case 'bank_account':
                return [
                    'account_number' => '40817810123456789012',
                    'bank_name' => 'Сбербанк',
                    'bik' => '044525225'
                ];
            case 'qiwi':
                return [
                    'phone' => '+7' . rand(9000000000, 9999999999),
                    'wallet_id' => rand(10000000000, 99999999999)
                ];
            case 'yoomoney':
                return [
                    'wallet_number' => rand(10000000000, 99999999999),
                    'phone' => '+7' . rand(9000000000, 9999999999)
                ];
            default:
                return [];
        }
    }
}