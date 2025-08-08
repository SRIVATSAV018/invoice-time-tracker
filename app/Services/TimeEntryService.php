<?php

namespace App\Services;

use App\Models\TimeEntry;
use App\Repositories\TimeEntryRepository;
use Carbon\Carbon;

class TimeEntryService
{
    public function __construct(
        public TimeEntryRepository $timeEntryRepository
    )
    {
    }

    public function storeTimeEntry(array $data): TimeEntry
    {
        $start = Carbon::parse($data['started_at']);
        $end = Carbon::parse($data['ended_at']);

        $diffInMinutes = $start->diffInMinutes($end);

        $data['duration_hours'] = $diffInMinutes;

        return $this->timeEntryRepository->store($data);
    }
}
