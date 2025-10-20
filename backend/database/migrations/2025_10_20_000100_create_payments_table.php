<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('yk_payment_id')->nullable()->index();
            $table->string('status')->default('pending');
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('currency', 3)->default('RUB');
            $table->string('confirmation_url')->nullable();
            $table->boolean('paid')->default(false);
            $table->json('raw')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};


