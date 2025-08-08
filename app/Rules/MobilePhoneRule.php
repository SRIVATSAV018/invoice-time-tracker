<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MobilePhoneRule implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $result = preg_match('/^\+[0-9]{1,3}[[:space:]]?[0-9]{3}[[:space:]]?[0-9]{8}/', $value);

        if ($result === 0) {
            $fail('Das Format stimmt nicht überein. Bitte nutze ein Format wie folgt: +49 123 12345678');
        }
    }
}
