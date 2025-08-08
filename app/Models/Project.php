<?php

namespace App\Models;

use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'client_id',
        'name',
        'description',
        'hourly_rate',
        'starts_at',
        'ends_at',
        'tech_stack',
        'deleted_at',
        'auto_generate_invoice',
        'auto_generate_amount',
        'auto_generate_unit',
        'last_auto_generated_invoice',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime:d.m.Y H:i'
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function time_entries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }
}
