<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\RegisterRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password' => null, // Пароль будет установлен после оплаты
            'telegram_tag' => $validated['telegram_tag'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'city' => $validated['city'] ?? null,
            'referral_link' => $validated['referral_link'] ?? null,
            'agree_to_policy' => true,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token, 
            'user' => [
                'id' => $user->id, 
                'full_name' => $user->full_name, 
                'email' => $user->email
            ]
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();
        if (!$user || !$user->password || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Неверный email или пароль']]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;
        return response()->json(['token' => $token, 'user' => ['id' => $user->id, 'full_name' => $user->full_name, 'email' => $user->email]]);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        return [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'telegram_tag' => $user->telegram_tag,
            'phone' => $user->phone,
            'city' => $user->city,
            'referral_link' => $user->referral_link,
            'has_password' => !is_null($user->password),
            'created_at' => $user->created_at,
        ];
    }

    public function setupPassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:6',
            'password_confirmation' => 'required|string|same:password',
        ]);

        $user = $request->user();
        
        // Обновляем пароль
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Генерируем реферальную ссылку если её нет
        if (!$user->referral_link) {
            $referralLink = url('/') . '?ref=' . $user->id;
            $user->update(['referral_link' => $referralLink]);
        }

        return response()->json([
            'message' => 'Пароль успешно установлен',
            'referral_link' => $user->referral_link
        ]);
    }
}


