<?php

namespace App\Http\Requests\Client;

use App\Enums\GenderEnum;
use App\Rules\MobilePhoneRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateClientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::check('update', $this->route('client'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => ['required', 'max:255'],
            'contact_person' => ['nullable', 'max:255'],
            'contact_person_salutation' => ['nullable', 'in:' . implode(',', array_keys(config('salutations')))],
            'contact_person_gender' => ['required', 'in:' . GenderEnum::MALE->name . ',' . GenderEnum::FEMALE->name],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', new MobilePhoneRule()],
            'address_line1' => ['required', 'max:255'],
            'address_line2' => ['nullable', 'max:255'],
            'postal_code' => ['required', 'max:20'],
            'city' => ['required', 'max:100'],
            'country' => ['required', 'max:100'],
            'tax_number' => ['nullable', 'max:255'],
            'notes' => ['nullable', 'max:5000']
        ];
    }
}
