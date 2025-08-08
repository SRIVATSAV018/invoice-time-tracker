<?php

namespace App\Repositories;

use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class ProjectRepository
{
    public function filter(string|null $search, string|null $sortOrder, string|null $withDeleted, string|null $projectStatus, int $page = 1): LengthAwarePaginator
    {
        $query = auth()->user()
            ->projects()
            ->with('client')
            ->when($search ?? null, function (Builder $query, $search) {
                $query->where('name', 'like', "%$search%");
            });

        if (($withDeleted ?? 'false') === 'true') {
            $query->withTrashed();
        }

        switch ($projectStatus ?? 'all') {
            case 'upcoming':
                // startet in der Zukunft
                $query->whereNotNull('starts_at')
                    ->whereDate('starts_at', '>', now());
                break;

            case 'finished':
                // ist bereits vorbei
                $query->whereNotNull('ends_at')
                    ->whereDate('ends_at', '<', now());
                break;

            case 'wip':
                // läuft gerade
                $query->whereNotNull('starts_at')
                    ->whereDate('starts_at', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('ends_at')
                            ->orWhereDate('ends_at', '>', now());
                    });
                break;

            case 'all':
            default:
                // kein Filter
                break;
        }

        return $query
            ->orderBy('name', ($sortOrder ?? 'asc') === 'asc' ? 'asc' : 'desc')
            ->paginate(10, page: $page)
            ->withQueryString();
    }

    public function create(array $data): Project
    {
        return Project::create($data);
    }

    public function update(Project $project, array $data): Project
    {
        $project->update($data);

        return $project;
    }

    public function delete(Project $project): void
    {
        $project->delete();
    }

    public function forceDelete(Project $project): void
    {
        $project->forceDelete();
    }

    public function restore(Project $project): void
    {
        $project->restore();
    }
}
