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
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referred_id')->constrained('users')->onDelete('cascade');
            $table->integer('level')->default(1); // Уровень реферала (1-5)
            $table->decimal('commission_rate', 5, 2)->default(0.00); // Процент комиссии для этого уровня
            $table->timestamps();
            
            // Уникальная связь между реферером и рефералом
            $table->unique(['referrer_id', 'referred_id']);
            // Индексы для быстрого поиска
            $table->index(['referrer_id', 'level']);
            $table->index('referred_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};