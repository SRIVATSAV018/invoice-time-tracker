<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCurrencyAndTaxesRequest extends FormRequest
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
            'currency' => ['required', 'max:3'],
            'subject_to_sales_tax' => ['bool'],
            'sales_tax' => ['required_if_accepted:subject_to_sales_tax', 'numeric', 'max:100'],
            'tax_number' => ['required_if_accepted:subject_to_sales_tax', 'max:255']
        ];
    }
}
