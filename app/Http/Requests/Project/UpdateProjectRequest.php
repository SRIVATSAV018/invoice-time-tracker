<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::check('update', $this->route('project'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'client_id' => ['required', 'numeric', 'exists:clients,id'],
            'name' => ['required', 'max:255'],
            'description' => ['nullable', 'max:5000'],
            'hourly_rate' => ['required', 'regex:/^\d{1,}\.\d{2}$/'],
            'starts_at' => ['required', 'date:Y-m-d'],
            'ends_at' => ['nullable', 'date:Y-m-d'],
            'tech_stack' => ['nullable', 'max:255'],
            'auto_generate_invoice' => ['boolean'],
            'auto_generate_amount' => ['required_if_accepted:auto_generate_invoice'],
        ];
    }
}
