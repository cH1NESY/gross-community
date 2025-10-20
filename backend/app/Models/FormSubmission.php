<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    protected $table = 'users';

    protected $fillable = [
        'full_name',
        'telegram_tag',
        'phone',
        'city',
        'email',
        'referral_link',
        'agree_to_policy',
    ];
}


