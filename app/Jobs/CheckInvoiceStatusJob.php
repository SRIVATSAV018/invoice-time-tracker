<?php

namespace App\Jobs;

use App\Enums\InvoiceStatusEnum;
use App\Models\Invoice;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckInvoiceStatusJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $invoices = Invoice::withCount('reminders')->whereNotIn('status', [
            InvoiceStatusEnum::PAID->name,
            InvoiceStatusEnum::DRAFT->name,
            InvoiceStatusEnum::UNDER_REVIEW->name,
        ])->orWhere('due_at', '<', now())->get();

        foreach ($invoices as $invoice) {
            if ($invoice->reminders_count < 3) {
                $this->sendReminderToClient($invoice);
            }
        }
    }

    /**
     * Send a reminder via email to the client.
     */
    public function sendReminderToClient(Invoice $invoice): void
    {
        if ($invoice->due_at < now()) {
            $invoice->updateQuietly([
                'status' => InvoiceStatusEnum::OVERDUE->name
            ]);
        }
    }
}
