<?php

namespace App\Http\Requests\TimeEntry;

use App\Models\TimeEntry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreTimeEntryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::check('create', TimeEntry::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_id' => ['required', 'numeric', 'exists:projects,id'],
            'description' => ['nullable', 'max:500'],
            'started_at' => ['required', 'date_format:Y-m-d\\TH:i'],
            'ended_at' => ['required', 'date_format:Y-m-d\\TH:i', 'after:started_at'],
        ];
    }
}
