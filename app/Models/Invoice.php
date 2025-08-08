<?php

namespace App\Models;

use App\Observers\InvoiceObserver;
use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use OwenIt\Auditing\Auditable;

#[ObservedBy(InvoiceObserver::class)]
class Invoice extends Model implements \OwenIt\Auditing\Contracts\Auditable
{
    /** @use HasFactory<InvoiceFactory> */
    use SoftDeletes, HasFactory, Auditable;

    protected $fillable = [
        'client_id',
        'invoice_number',
        'issued_at',
        'due_at',
        'status',
        'client_company',
        'client_address_line1',
        'client_postal_code',
        'client_city',
        'client_country',
        'notes',
        'project_id',
        'email_send_scheduled_at',
        'email_sent_at',
        'is_pdf_generating',
        'pdf_path',
        'service_period_start',
        'service_period_end',
    ];

    protected $appends = [
        'does_pdf_exist',
        'pdf_url'
    ];

    protected function casts(): array
    {
        return [
            'due_at' => 'date:Y-m-d',
            'issued_at' => 'date:Y-m-d',
            'service_period_start' => 'date:Y-m-d',
            'service_period_end' => 'date:Y-m-d',
            'email_send_scheduled_at' => 'datetime',
            'email_sent_at' => 'datetime'
        ];
    }

    public function getDoesPdfExistAttribute(): bool
    {
        if (is_null($this->pdf_path)) {
            return false;
        }

        if (!Storage::disk('local')->exists($this->pdf_path)) {
            return false;
        }

        return true;
    }

    public function getPdfUrlAttribute(): string | null
    {
        if (!$this->does_pdf_exist) {
            return null;
        }

        return route('invoices.preview', ['invoice' => $this]);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(InvoiceReminder::class);
    }

    public static function calculate(self $invoice)
    {
        $netTotal = 0;
        $tax = 0;

        $userId = $invoice->loadMissing('client.user')->client->user_id;

        $companyDetails = CompanyDetails::currentUser($userId)->first();
        $invoice->loadMissing('items');

        // Calculat net total for all items.
        foreach ($invoice->items as $item) {
            $netTotal += ($item->unit_price * $item->quantity);
        }

        $tax = $netTotal * ($companyDetails->vat / 100);

        return [
            'netTotal' => $netTotal,
            'tax' => $tax,
            'total' => $netTotal + $tax
        ];
    }
}
