<?php

namespace App\Http\Controllers;

use App\Helpers\Notify;
use App\Http\Requests\Invoice\StoreInvoiceRequest;
use App\Http\Requests\Invoice\UpdateInvoiceRequest;
use App\Jobs\GenerateInvoiceJob;
use App\Models\Invoice;
use App\Models\Project;
use App\Notifications\SendInvoiceToClientNotification;
use App\Repositories\InvoiceRepository;
use App\Services\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends BaseController
{
    public function __construct(
        public InvoiceService $invoiceService,
        public InvoiceRepository $invoiceRepository
    )
    {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $filters = $request->only(['search', 'status', 'clientId', 'withDeleted', 'page']);

        $invoices = $this->invoiceRepository->filter(
            search: $filters['search'] ?? null,
            status: $filters['status'] ?? null,
            client_id: $filters['clientId'] ?? null,
            withDeleted: $filters['withDeleted'] ?? 'false',
            page: $filters['page'] ?? 1
        );

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'filters' => $filters,
            'statistics' => Inertia::optional(fn () => $this->invoiceRepository->getStatistics($request->get('statisticsFrom'), $request->get('statisticsTo')))
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Invoice::class);

        return Inertia::render('invoices/create', [
            'clients' => $request->user()->loadMissing('clients')->clients,
            'projects' => $this->getProjects($request->get('client_id'))
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $invoice = $this->invoiceRepository->store($validated);

        return redirect()->route('invoices.edit', $invoice->id);
    }

    /**
     * Display the specified resource.
     */
    public function show(Invoice $invoice)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Invoice $invoice): Response
    {
        $this->authorize("update", $invoice);

        return Inertia::render('invoices/edit', [
            'invoice' => $invoice->loadMissing('items'),
            'clients' => $request->user()->loadMissing('clients')->clients,
            'projects' => $this->getProjects($request->get('client_id'))
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInvoiceRequest $request, Invoice $invoice): RedirectResponse
    {
        $invoice = $this->invoiceRepository->update($invoice, $request->validated());

        GenerateInvoiceJob::dispatch($invoice);

        return redirect()->route('invoices.edit', $invoice->id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invoice $invoice): void
    {
        $this->authorize('delete', $invoice);

        $this->invoiceRepository->delete($invoice);
    }

    public function preview(Invoice $invoice): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $this->authorize("preview", $invoice);

        $file = storage_path("app/private/$invoice->pdf_path");

        return response()->file($file, [
            'Content-Type' => 'application/pdf'
        ]);
    }

    public function sendToClient(Request $request, Invoice $invoice)
    {
        $this->authorize("sendToClient", $invoice);

        $data = $request->only([
            'date'
        ]);

        $invoice->loadMissing('client');

        if (is_null($data['date'])) {
            Notification::route('mail', $invoice->client->email)
                ->notify(new SendInvoiceToClientNotification($invoice));
        } else {
            $invoice->update([
                'email_send_scheduled_at' => $data['date']
            ]);
        }
    }

    public function generatePdf(Invoice $invoice)
    {
        $this->invoiceRepository->updateQuietly($invoice, [
            'is_pdf_generating' => true,
            'items' => $invoice->items->toArray()
        ]);

        GenerateInvoiceJob::dispatch($invoice);

        Notify::success('Die Rechnung wird erneut erstellt. Bitte warten...');
    }

    private function getProjects($clientId): Collection
    {
        $projects = new Collection;

        if ($clientId) {
            $projects = Project::whereClientId($clientId)->get();
        }

        return $projects;
    }
}
