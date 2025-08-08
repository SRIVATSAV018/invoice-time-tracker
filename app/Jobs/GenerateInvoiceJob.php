<?php

namespace App\Jobs;

use App\Models\Invoice;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Spatie\Browsershot\Browsershot;

class GenerateInvoiceJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Invoice $invoice
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->invoice->loadMissing([
            'client.user',
            'items',
            'project'
        ]);

        $fileName = sprintf(
            '%s_RE-%s_%s.pdf',
            $this->invoice->issued_at->format('Y-m-d'),
            $this->invoice->invoice_number,
            $this->invoice->client_company
        );

        try {
            $browsershot = Browsershot::html(
                view('pdfs.invoice', [
                    'invoice' => $this->invoice
                ])->render()
            )->format('A4')
                ->showBackground()
                ->margins(5, 15, 5, 15);

            if (config('app.env') !== 'local') {
                $browsershot->noSandbox();
            }

            $browsershot->save(storage_path("app/private/invoices/$fileName"));

            $this->invoice->updateQuietly([
                'pdf_path' => "invoices/$fileName"
            ]);
        } catch (\Exception|\Throwable $e) {
            Log::channel('invoices')->error('An error occured while generating an invoice: ' . $e->getMessage());
        } finally {
            $this->invoice->updateQuietly([
                'is_pdf_generating' => false,
            ]);
        }
    }
}
