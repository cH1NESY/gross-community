<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'yk_payment_id', 'status', 'amount', 'currency', 'confirmation_url', 'paid', 'raw',
    ];

    protected $casts = [
        'paid' => 'boolean',
        'raw' => 'array',
        'amount' => 'decimal:2',
    ];
}


