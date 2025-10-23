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
            // optional profile fields
            'telegram_tag' => ['nullable','string','max:255','unique:users,telegram_tag'],
            'phone' => ['nullable','string','max:50','unique:users,phone'],
            'city' => ['nullable','string','max:255'],
            'referral_link' => ['nullable','string','max:1024'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Пользователь с таким email уже зарегистрирован',
            'telegram_tag.unique' => 'Пользователь с таким Telegram уже зарегистрирован',
            'phone.unique' => 'Пользователь с таким номером телефона уже зарегистрирован',
        ];
    }
}




