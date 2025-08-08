<?php

namespace App\Observers;

use App\Jobs\GenerateInvoiceJob;
use App\Models\Invoice;
use App\Repositories\InvoiceRepository;
use Carbon\Carbon;

class InvoiceObserver
{
    public function __construct(
        public InvoiceRepository $invoiceRepository
    )
    {
    }

    /**
     * Handle the Invoice "created" event.
     */
    public function created(Invoice $invoice): void
    {
        $monthYear = Carbon::now()->format('m-Y');            // z. B. "07-2025"
        $sequence   = str_pad($invoice->id, 2, '0', STR_PAD_LEFT); // z. B. "01"
        $number    = "{$monthYear}-{$sequence}";

        $this->invoiceRepository->updateQuietly($invoice, [
            'invoice_number' => $number,
            'is_pdf_generating' => true
        ]);

        GenerateInvoiceJob::dispatch($invoice);
    }

    /**
     * Handle the Invoice "updated" event.
     */
    public function updated(Invoice $invoice): void
    {
        $this->invoiceRepository->updateQuietly($invoice, [
            'is_pdf_generating' => true
        ]);
    }

    /**
     * Handle the Invoice "restored" event.
     */
    public function restored(Invoice $invoice): void
    {
        //
    }

    /**
     * Handle the Invoice "force deleted" event.
     */
    public function forceDeleted(Invoice $invoice): void
    {
        //
    }
}
