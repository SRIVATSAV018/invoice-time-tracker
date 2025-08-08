<?php

namespace App\Models;

use Database\Factories\CompanyDetailsFactory;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CompanyDetails extends Model
{
    /** @use HasFactory<CompanyDetailsFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'address_line1',
        'address_line2',
        'postal_code',
        'city',
        'country',
        'email',
        'phone',
        'tax_number',
        'currency',
        'vat',
        'user_id',
        'bank_name',
        'iban',
        'bic',
        'payment_term',
        'logo_path'
    ];

    protected $appends = [
        'logo_url'
    ];

    public function getLogoUrlAttribute(): string | null
    {
        if (is_null($this->logo_path)) {
            return null;
        }

        $storage = Storage::disk('public')->path($this->logo_path);

        if ($storage) {
            return '/storage/' . $this->logo_path;
        }

        return null;
    }

    #[Scope]
    protected function currentUser(Builder $builder, int|null $userId): Builder
    {
        return $builder->where('user_id', $userId ?: Auth::user()->id);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function updateData(User $user, array $data): void
    {
        if (!$user->companyDetails()->exists()) {
            $user->companyDetails()->create($data);
        } else {
            $user->companyDetails()->first()->update($data);
        }
    }
}
