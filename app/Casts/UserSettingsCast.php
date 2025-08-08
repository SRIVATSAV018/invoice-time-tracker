<?php

namespace App\Casts;

use App\DataTransferObjects\UserSettingsDTO;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

class UserSettingsCast implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function get(Model $model, string $key, mixed $value, array $attributes): UserSettingsDTO | null
    {
        if (is_null($value)) {
            return null;
        }

        if (is_string($value)) {
            $value = json_decode($value);
        }

        return (new UserSettingsDTO())->fromArray($value);
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function set(Model $model, string $key, mixed $value, array $attributes): string|false
    {
        return json_encode($value);
    }
}
