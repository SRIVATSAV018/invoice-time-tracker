<?php

namespace App\Http\Controllers;

use App\Http\Requests\TimeEntry\StoreTimeEntryRequest;
use App\Http\Requests\TimeEntry\UpdateTimeEntryRequest;
use App\Models\Project;
use App\Models\TimeEntry;
use App\Repositories\TimeEntryRepository;
use App\Services\TimeEntryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimeEntryController extends BaseController
{
    public function __construct(
        public TimeEntryRepository $timeEntryRepository,
        public TimeEntryService    $timeEntryService
    )
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', TimeEntry::class);

        $filters = $request->only([
            'search',
            'projectId',
            'periodStart',
            'periodEnd',
            'page'
        ]);

        $timeEntries = $this->timeEntryRepository->filter(
            search: $filters['search'] ?? null,
            projectId: $filters['projectId'] ?? null,
            periodStart: $filters['periodStart'] ?? null,
            periodEnd: $filters['periodEnd'] ?? null,
            page: $filters['page'] ?? 1
        );


        return Inertia::render('time_entries/index', [
            'time_entries' => $timeEntries,
            'filters' => $filters,
            'projects' => $request->user()->loadMissing('projects')->projects
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', TimeEntry::class);
        return Inertia::render('time_entries/create', [
            'projects' => Project::pluck('name', 'id')->toArray()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTimeEntryRequest $request): RedirectResponse
    {
        $timeEntry = $this->timeEntryService->storeTimeEntry([
            ...$request->validated(),
            'user_id' => $request->user()->id
        ]);

        return redirect()->route('time_entries.edit', $timeEntry->id);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TimeEntry $timeEntry)
    {
        $this->authorize('update', $timeEntry);
        return Inertia::render('time_entries/edit', [
            'time_entry' => [
                ...$timeEntry->toArray(),
            ],
            'projects' => Project::pluck('name', 'id')->toArray()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTimeEntryRequest $request, TimeEntry $timeEntry)
    {
        $timeEntry = $this->timeEntryRepository->update($timeEntry, $request->validated());

        return redirect()->route('time_entries.edit', $timeEntry->id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TimeEntry $timeEntry)
    {
        $this->authorize('delete', $timeEntry);

        $this->timeEntryRepository->delete($timeEntry);
    }
}
