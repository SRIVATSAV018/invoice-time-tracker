<?php

namespace App\Models;

use App\Observers\OfferObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Auditable;

#[ObservedBy(OfferObserver::class)]
class Offer extends Model implements \OwenIt\Auditing\Contracts\Auditable
{
    use SoftDeletes, Auditable, HasFactory;


    protected $fillable = [
        'offer_number',
        'client_id',
        'project_id',
        'status',
        'client_company',
        'client_contact_person_gender',
        'client_contact_person',
        'client_contact_person_salutation',
        'client_street',
        'client_postal_code',
        'client_city',
        'client_country',
        'client_tax_number',
        'project_name',
        'notes',
        'net_total',
        'tax_rate',
        'tax_total',
        'gross_total',
        'pdf_url',
        'accepted_by_ip',
        'valid_until',
        'sent_at',
        'accepted_at',
        'project_description',
        'service_period_start',
        'service_period_end',
    ];

    protected function casts(): array
    {
        return [
            'valid_until' => 'date:Y-m-d',
            'sent_at' => 'datetime',
            'accepted_at' => 'datetime',
            'service_period_start' => 'date',
            'service_period_end' => 'date',
            'accepted_by_ip' => 'encrypted'
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OfferItem::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function getFileName(): string
    {
        return sprintf(
            '%s_AN-%s_%s.pdf',
            $this->created_at->format('Y-m-d'),
            $this->offer_number,
            $this->client_company
        );
    }
}
