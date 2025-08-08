<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;

class Client extends Model implements \OwenIt\Auditing\Contracts\Auditable
{
    use SoftDeletes, HasFactory, Auditable;

    protected $fillable = [
        'company_name',
        'contact_person',
        'email',
        'phone',
        'address_line1',
        'address_line2',
        'postal_code',
        'city',
        'country',
        'tax_number',
        'notes',
        'user_id',
        'contact_person_salutation',
        'contact_person_gender',
    ];

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    public function time_entries(): HasManyThrough
    {
        return $this->hasManyThrough(
            TimeEntry::class,
            Project::class,
            'client_id',
            'project_id',
            'id',
            'id'
        );
    }
}
