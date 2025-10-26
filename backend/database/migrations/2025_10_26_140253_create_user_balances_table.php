<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('total_earned', 10, 2)->default(0.00); // Общая сумма заработанного
            $table->decimal('available_balance', 10, 2)->default(0.00); // Доступный баланс для вывода
            $table->decimal('pending_balance', 10, 2)->default(0.00); // Ожидающие одобрения средства
            $table->decimal('withdrawn_total', 10, 2)->default(0.00); // Общая сумма выведенных средств
            $table->timestamps();
            
            // Уникальный баланс для каждого пользователя
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_balances');
    }
};