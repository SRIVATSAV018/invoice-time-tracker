<?php

namespace App\Http\Requests\Offer;

use App\Enums\GenderEnum;
use App\Enums\OfferStatusEnum;
use Illuminate\Foundation\Http\FormRequest;

class StoreOfferRequest extends FormRequest
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
            'client_id' => ['required', 'exists:clients,id'],
            'project_id' => ['required', 'exists:projects,id'],
            'status' => ['required', 'in:' . OfferStatusEnum::DRAFT->name . ',' .
                OfferStatusEnum::SENT->name . ',' .
                OfferStatusEnum::ACCEPTED->name . ',' .
                OfferStatusEnum::REJECTED->name . ',' .
                OfferStatusEnum::EXPIRED->name
            ],
            'valid_until' => ['required', 'date', 'after:now'],
            'client_company' => ['required', 'max:255'],
            'client_contact_person' => ['required', 'max:255'],
            'client_contact_person_salutation' => ['nullable', 'in:' . implode(',', array_keys(config('salutations')))],
            'client_contact_person_gender' => ['required', 'in:' . GenderEnum::MALE->name . ',' . GenderEnum::FEMALE->name],
            'client_street' => ['required', 'max:255'],
            'client_postal_code' => ['required', 'max:255'],
            'client_city' => ['required', 'max:255'],
            'client_country' => ['required', 'max:255'],
            'client_tax_number' => ['required', 'max:255'],
            'project_name' => ['required', 'max:255'],
            'project_description' => ['required', 'max:500'],
            'notes' => ['nullable', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.unit' => ['required', 'max:255'],
            'items.*.description' => ['required', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'max:255'],
            'items.*.unit_price' => ['required', 'decimal:2'],
            'items.*.total' => ['required', 'numeric'],
            'service_period_start' => ['required', 'date'],
            'service_period_end' => ['required', 'date', 'after:service_period_start']
        ];
    }
}
