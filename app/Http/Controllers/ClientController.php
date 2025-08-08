<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Models\Client;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Client::class);

        // Todo: Move logic into service / repository class.
        $filters = $request->only(['search', 'sortOrder', 'withDeleted', 'page']);

        $query = Client::whereUserId($request->user()->id)
            ->when($filters['search'] ?? null, function (Builder $query, $search) {
                $query->where('company_name', 'like', "%$search%")
                    ->orWhere('contact_person', 'like', "%$search%");
        });

        if (($filters['withDeleted'] ?? 'false') === 'true') {
            $query->withTrashed();
        }

        $clients = $query->orderBy('company_name', ($filters['sortOrder'] ?? 'asc') === 'asc' ? 'asc' : 'desc')
            ->paginate(10, page: $filters['page'] ?? 1)
            ->withQueryString();

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'filters' => $filters
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Client::class);

        return Inertia::render('clients/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $client = $request->user()->clients()
            ->create($validated);

        return redirect()->route('clients.show', $client);
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client): Response
    {
        $this->authorize('view', $client);

        $client->loadMissing([
            'invoices.project',
            'projects',
            'time_entries.project'
        ]);

        return Inertia::render('clients/show', [
            'client' => $client
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client): Response
    {
        $this->authorize('update', $client);

        return Inertia::render('clients/edit', [
            'client' => $client
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $validated = $request->validated();

        $client->update($validated);

        return redirect()->route('clients.show', $client->id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client): void
    {
        $this->authorize('delete', $client);

        $client->delete();
    }

    /**
     * Completely delete client and remove all relations.
     * @param Client $client
     * @return void
     */
    public function forceDestroy(Client $client): void
    {
        $this->authorize('forceDelete', $client);

        $client->forceDelete();
    }

    /**
     * Restore a deleted client.
     * @param Client $client
     * @return void
     */
    public function restore(Client $client): void
    {
        $this->authorize('restore', $client);

        $client->restore();
    }
}
