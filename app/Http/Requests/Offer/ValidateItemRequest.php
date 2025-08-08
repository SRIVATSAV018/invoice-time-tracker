<?php

namespace App\Http\Requests\Offer;

use Illuminate\Foundation\Http\FormRequest;

class ValidateItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'unit' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:500'],
            'quantity' => ['required', 'numeric', 'min:1'],
            'unit_price' => ['required', 'decimal:2', 'min:1']
        ];
    }
}
