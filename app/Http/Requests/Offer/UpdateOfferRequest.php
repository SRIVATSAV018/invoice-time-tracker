<?php

namespace App\Http\Requests\Offer;

use App\Enums\OfferStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateOfferRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::check('update', $this->route('offer'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'in:' . OfferStatusEnum::DRAFT->name . ',' .
                OfferStatusEnum::SENT->name . ',' .
                OfferStatusEnum::ACCEPTED->name . ',' .
                OfferStatusEnum::REJECTED->name . ',' .
                OfferStatusEnum::EXPIRED->name
            ],
            'valid_until' => ['required', 'date', 'after:now'],
            'notes' => ['nullable', 'max:5000'],
            'items' => ['required', 'array', 'min:1'],
            'project_description' => ['required', 'max:500'],
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
