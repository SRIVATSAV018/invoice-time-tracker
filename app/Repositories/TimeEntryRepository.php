<?php

namespace App\Repositories;

use App\Models\TimeEntry;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class TimeEntryRepository
{
    public function filter(string|null $search, string|null $projectId, string|null $periodStart, string|null $periodEnd, int $page = 1): LengthAwarePaginator
    {
        $builder = TimeEntry::forUser()
            ->with('project')
            ->when($search, function (Builder $query, $search) {
                $query->where('description', 'like', "%$search%");
            })->when($projectId, function (Builder $query, $projectId) {
                if ($projectId === "all") {
                    return;
                }
                $query->where('project_id', (int)$projectId);
            })->when($periodStart, function (Builder $query, $periodStart) {
                $query->where('started_at', '>=', $periodStart);
            })->when($periodEnd, function (Builder $query, $periodEnd) {
                $query->where('ended_at', '<=', $periodEnd);
        });

        return $builder->paginate(10, page: $page)
            ->withQueryString();
    }

    public function store(array $data): TimeEntry
    {
        return TimeEntry::create($data);
    }

    public function update(TimeEntry $timeEntry, array $data): TimeEntry
    {
        $timeEntry->update($data);

        return $timeEntry;
    }

    public function delete(TimeEntry $timeEntry): void
    {
        $timeEntry->delete();
    }
}
