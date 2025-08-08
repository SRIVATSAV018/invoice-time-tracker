<?php

namespace App\Models;

use App\Casts\UserSettingsCast;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use OwenIt\Auditing\Auditable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'settings'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'logo_url'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'settings' => UserSettingsCast::class
        ];
    }

    public function getLogoUrlAttribute(): string | null
    {
        if ($this->getSettings('logo')) {
            $logo = $this->getSettings('logo');
        }

        return null;
    }

    public function time_entries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function clients(): HasMany
    {
        return $this->hasMany(Client::class);
    }

    public function projects(): HasManyThrough
    {
        return $this->hasManyThrough(
            \App\Models\Project::class,
            \App\Models\Client::class,
            'user_id',    // Foreign key in Client table
            'client_id',  // Foreign key in Project table
            'id',         // Local key in User
            'id'          // Local key in Client
        );
    }

    public function current_projects(): HasManyThrough
    {
        return $this->hasManyThrough(
            \App\Models\Project::class,
            \App\Models\Client::class,
            'user_id',    // Foreign key in Client table
            'client_id',  // Foreign key in Project table
            'id',         // Local key in User
            'id'          // Local key in Client
        )->where('starts_at', '<=', now())
            ->where(function (Builder $query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            });
    }

    public function ended_projects(): HasManyThrough
    {
        return $this->hasManyThrough(
            \App\Models\Project::class,
            \App\Models\Client::class,
            'user_id',    // Foreign key in Client table
            'client_id',  // Foreign key in Project table
            'id',         // Local key in User
            'id'          // Local key in Client
        )->where('starts_at', '<=', now())
            ->whereNotNull('ends_at')
            ->where('ends_at', '<=', now());
    }

    public function upcoming_projects(): HasManyThrough
    {
        return $this->hasManyThrough(
            \App\Models\Project::class,
            \App\Models\Client::class,
            'user_id',    // Foreign key in Client table
            'client_id',  // Foreign key in Project table
            'id',         // Local key in User
            'id'          // Local key in Client
        )->where('starts_at', '>', now());
    }

    public function invoices(): HasManyThrough
    {
        return $this->hasManyThrough(
            Invoice::class,
            Client::class,
            'user_id',
            'client_id',
            'id',
            'id'
        );
    }

    public function companyDetails(): HasOne
    {
        return $this->hasOne(CompanyDetails::class);
    }

    /**
     * Returns the value of the given settings key.
     * @param string $settingsKey
     * @return mixed
     */
    public function getSettings(string $settingsKey): mixed
    {
        if (!isset($this->settings->{$settingsKey})) {
            return null;
        }

        return $this->settings->{$settingsKey};
    }
}
