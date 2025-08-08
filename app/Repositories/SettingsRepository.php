<?php

namespace App\Repositories;

use Illuminate\Support\Facades\Auth;

class SettingsRepository
{
    public function update(array $data): void
    {
        $user = Auth::user();

        if (is_null($user->settings)) {
            $user->settings = [];
        }

        $user->settings = [
            ...$user->settings->toArray(),
            ...$data
        ];
        $user->save();
    }
}
