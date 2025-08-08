<?php

namespace App\Http\Requests;

use App\Rules\MobilePhoneRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyInformationRequest extends FormRequest
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
            'name' => ['required', 'max:255'],
            'address_line1' => ['required', 'max:255'],
            'address_line2' => ['nullable', 'max:255'],
            'postal_code' => ['required', 'max:20'],
            'city' => ['required', 'max:255'],
            'country' => ['required', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', new MobilePhoneRule()],
            'logo' => ['nullable', 'image', 'max:4096'],
            'website' => ['required', 'string', 'max:255']
        ];
    }
}
