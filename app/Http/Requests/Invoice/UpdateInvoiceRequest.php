<?php

namespace App\Http\Requests\Invoice;

use App\Enums\InvoiceStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateInvoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::check('update', $this->route('invoice'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:' .
                InvoiceStatusEnum::DRAFT->name . ',' .
                InvoiceStatusEnum::OPEN->name . ',' .
                InvoiceStatusEnum::SENT->name . ',' .
                InvoiceStatusEnum::APPROVED->name . ',' .
                InvoiceStatusEnum::UNDER_REVIEW->name . ',' .
                InvoiceStatusEnum::PAID->name . ',' .
                InvoiceStatusEnum::OVERDUE->name . ','
            ],
            'issued_at' => ['required', 'date'],
            'due_at' => ['required', 'date', 'after:issued_at'],
            'notes' => ['nullable', 'max:5000'],
            'email_send_scheduled_at' => ['nullable', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.unit' => ['required', 'max:255'],
            'items.*.description' => ['required', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'max:255'],
            'items.*.unit_price' => ['required', 'numeric'],
            'service_period_start' => ['required', 'date'],
            'service_period_end' => ['nullable', 'date', 'after:service_period_start']
        ];
    }
}
