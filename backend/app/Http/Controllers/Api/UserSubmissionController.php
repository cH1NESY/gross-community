<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
// use App\Models\FormSubmission; // no longer used, storing strictly into users
use Illuminate\Http\JsonResponse;

class UserSubmissionController extends Controller
{
    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $created = User::create($data);
        return response()->json(['id' => $created->id, 'message' => 'Saved'], 201);
    }
}


