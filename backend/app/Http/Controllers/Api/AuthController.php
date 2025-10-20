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
            'password' => Hash::make($validated['password']),
            'telegram_tag' => $validated['telegram_tag'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'city' => $validated['city'] ?? null,
            'referral_link' => $validated['referral_link'] ?? null,
            'agree_to_policy' => true,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => ['id' => $user->id, 'full_name' => $user->full_name, 'email' => $user->email]]);
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
        return $request->user();
    }
}


