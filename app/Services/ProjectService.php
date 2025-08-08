<?php

namespace App\Services;

use App\Models\Project;
use App\Models\TimeEntry;
use App\Repositories\ProjectRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class ProjectService
{
    public function __construct(
        public ProjectRepository $projectRepository
    )
    {
    }

    /**
     * Filter's projects by given filter columns.
     * @param string|null $search
     * @param string|null $sortOrder
     * @param string|null $withDeleted
     * @param string|null $projectStatus
     * @return LengthAwarePaginator
     */
    public function filterProjects(string|null $search, string|null $sortOrder, string|null $withDeleted, string|null $projectStatus, int $page = 1): LengthAwarePaginator
    {
        return $this->projectRepository->filter($search, $sortOrder, $withDeleted, $projectStatus);
    }

    public function getIncomeLast30Days(Project $project): float
    {
        $total = 0;

        $hourlyRate = $project->hourly_rate;

        $timeEntries = $project->time_entries()
            ->where('started_at', '>=', now()->subDays(30))
            ->where('ended_at',   '<=', now())
            ->get();

        foreach ($timeEntries as $timeEntry) {
            $hours = ceil($timeEntry->duration_hours / 60);

            $total += $hours * $hourlyRate;
        }

        return $total;
    }

    public function getSpentTimeLast30Days(Project $project): float
    {
        $total = 0;

        $timeEntries = $project->time_entries()
            ->where('started_at', '>=', now()->subDays(30))
            ->where('ended_at',   '<=', now())
            ->get();

        foreach ($timeEntries as $timeEntry) {
            $total += $timeEntry->duration_hours;
        }

        return $total;
    }
}
