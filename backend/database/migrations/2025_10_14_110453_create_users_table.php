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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('full_name')->nullable();
            $table->string('telegram_tag')->nullable();
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->string('referral_link')->nullable();
            $table->string('email')->nullable();
            $table->boolean('agree_to_policy')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['full_name','telegram_tag','phone','city','referral_link','agree_to_policy']);
        });
    }
};
