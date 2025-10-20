<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fullName' => ['required', 'string', 'max:255'],
            'telegramTag' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'referralLink' => ['nullable', 'string', 'max:1024'],
            'agreeToPolicy' => ['required', 'boolean'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
            'password_confirmation' => ['nullable', 'string', 'min:6'],
        ];
    }

    public function validated($key = null, $default = null)
    {
        $data = parent::validated($key, $default);
        // normalize keys to match DB columns
        return [
            'full_name' => $data['fullName'] ?? null,
            'telegram_tag' => $data['telegramTag'] ?? null,
            'phone' => $data['phone'] ?? null,
            'city' => $data['city'] ?? null,
            'email' => $data['email'] ?? null,
            'referral_link' => $data['referralLink'] ?? null,
            'agree_to_policy' => $data['agreeToPolicy'] ?? false,
            'password' => isset($data['password']) && $data['password'] ? bcrypt($data['password']) : null,
        ];
    }
}


