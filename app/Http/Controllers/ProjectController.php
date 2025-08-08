<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Client;
use App\Models\Project;
use App\Repositories\ProjectRepository;
use App\Services\ProjectService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends BaseController
{
    public function __construct(
        public ProjectService $projectService,
        public ProjectRepository $projectRepository
    )
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $filters = $request->only(['search', 'sortOrder', 'withDeleted', 'projectStatus', 'page']);

        $projects = $this->projectRepository->filter(
            search: $filters['search'] ?? null,
            sortOrder: $filters['sortOrder'] ?? null,
            withDeleted: $filters['withDeleted'] ?? null,
            projectStatus: $filters['projectStatus'] ?? null,
            page: $filters['page'] ?? 1
        );

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'filters' => $filters
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Project::class);
        return Inertia::render('projects/create', [
            'clients' => $request->user()->loadMissing('clients')->clients
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $project = $this->projectRepository->create($request->validated());

        return redirect()->route('projects.show', $project->id);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        return Inertia::render('projects/show', [
            'project' => $project->loadMissing(['invoices', 'client', 'time_entries']),
            'income_last_30_days' => $this->projectService->getIncomeLast30Days($project),
            'spent_time_last_30_days' => $this->projectService->getSpentTimeLast30Days($project)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Project $project): Response
    {
        $this->authorize('update', $project);

        return Inertia::render('projects/edit', [
            'project' => $project,
            'clients' => $request->user()->loadMissing('clients')->clients
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $project = $this->projectRepository->update($project, $request->validated());

        return redirect()->route('projects.show', $project->id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): void
    {
        $this->authorize('delete', $project);

        $this->projectRepository->delete($project);
    }

    public function forceDestroy(Project $project): void
    {
        $this->authorize('forceDelete', $project);

        $this->projectRepository->forceDelete($project);
    }

    public function restore(Project $project): void
    {
        $this->authorize('restore', $project);

        $this->projectRepository->restore($project);
    }
}
