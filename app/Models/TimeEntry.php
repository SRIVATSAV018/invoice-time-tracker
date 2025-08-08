<?php

namespace App\Models;

use Database\Factories\TimeEntryFactory;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEntry extends Model
{
    /** @use HasFactory<TimeEntryFactory> */
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'description',
        'started_at',
        'ended_at',
        'duration_hours',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }

    #[Scope]
    protected function forUser(Builder $query): void
    {
        $query->whereUserId(auth()->user()->id);
    }

    public
    function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public
    function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
