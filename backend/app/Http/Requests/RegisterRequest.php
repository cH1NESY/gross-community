<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6','confirmed'],
            // optional profile fields
            'telegram_tag' => ['nullable','string','max:255'],
            'phone' => ['nullable','string','max:50'],
            'city' => ['nullable','string','max:255'],
            'referral_link' => ['nullable','string','max:1024'],
        ];
    }
}



