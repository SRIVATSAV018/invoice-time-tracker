<?php

namespace App\Http\Controllers;

use App\Helpers\Notify;
use App\Http\Requests\Offer\AcceptOfferRequest;
use App\Http\Requests\Offer\StoreOfferRequest;
use App\Http\Requests\Offer\UpdateOfferRequest;
use App\Http\Requests\Offer\ValidateItemRequest;
use App\Models\Client;
use App\Models\Offer;
use App\Repositories\OfferRepository;
use App\Services\OfferService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class OfferController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, OfferRepository $offerRepository): Response
    {
        $filters = $request->only(['query', 'client_id', 'project_id', 'status', 'withDeleted']);

        $offers = $offerRepository->filter(
            query: $filters['query'] ?? null,
            client_id: $filters['client_id'] ?? null,
            project_id: $filters['project_id'] ?? null,
            status: $filters['status'] ?? null,
            withDeleted: $filters['withDeleted'] ?? 'no'
        );

        $client = Client::find($filters['client_id'] ?? null)?->first();

        return Inertia::render('offers/index', [
            'offers' => $offers,
            'filters' => $filters,
            'clients' => $request->user()->clients()->get(),
            'projects' => $client?->projects->pluck('name', 'id')->toArray()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $clientId = $request->only(['client_id']);

        $client = Client::find($clientId)
            ->first();

        return Inertia::render('offers/create', [
            'clients' => $request->user()->clients()->get(),
            'projects' => $client?->projects->pluck('name', 'id')->toArray()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOfferRequest $request, OfferService $offerService)
    {
        $offer = $offerService->storeOffer($request->validated());

        Notify::success("Das Angebot $offer->offer_number wurde erfolgreich erstellt.");
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Offer $offer)
    {
        $this->authorize('update', $offer);

        return Inertia::render('offers/edit', [
            'offer' => $offer->loadMissing(['project', 'client', 'items'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOfferRequest $request, Offer $offer, OfferService $offerService)
    {
        $result = $offerService->updateOffer($offer, $request->validated());

        if ($result instanceof Offer) {
            Notify::success("Das Angebot $offer->offer_number wurde aktualisiert.");
        } else {
            Notify::error("Beim Aktualisieren des Angebots $offer->offer_number ist ein Fehler aufgetreten.");
        }

        return redirect()->route('offers.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Offer $offer, OfferRepository $offerRepository)
    {
        $offerRepository->delete($offer);

        return redirect()->route('offers.index');
    }

    public function validateItem(ValidateItemRequest $request) {}

    public function preview(Offer $offer)
    {
        $this->authorize('preview', $offer);
        $storage = Storage::disk('local');

        if (!$storage->exists("offers/{$offer->getFileName()}")) {
            abort(404);
        }

        return response()->file(storage_path("app/private/offers/{$offer->getFileName()}"), [
            'Content-Type' => 'application/pdf'
        ]);
    }

    public function sendEmail(Offer $offer, OfferService $offerService)
    {
        $offerService->sendOfferToClient($offer);
    }

    public function details(Request $request, Offer $offer)
    {
        $offer->loadMissing(['project', 'client', 'items']);

        return Inertia::render('offers/accept', [
            'settings' => $offer->client->user->settings,
            'offer' => $offer,
            'expires' => $request->get('expires'),
            'signature' => $request->get('signature')
        ]);
    }

    public function accept(AcceptOfferRequest $request, Offer $offer, OfferService $offerService)
    {
        $offerService->acceptOffer($offer, $request->ip());

        return redirect()->route('offers.accepted', $offer);
    }

    public function accepted(Offer $offer)
    {
        return Inertia::render('offers/accepted', [
            'offer' => $offer->loadMissing(['project', 'client.user', 'items'])
        ]);
    }
}
