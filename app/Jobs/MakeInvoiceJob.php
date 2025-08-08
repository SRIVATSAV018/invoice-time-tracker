<?php

namespace App\Jobs;

use App\Enums\InvoiceStatusEnum;
use App\Models\CompanyDetails;
use App\Models\Invoice;
use App\Models\Project;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MakeInvoiceJob implements ShouldQueue
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
        // Projects that should generate invoices automatically.
        $projects = Project::with('time_entries')
            ->where('auto_generate_invoice', true)

            ->whereHas('time_entries')
            ->where(function($q) {
                $q->whereNull('last_auto_generated_invoice')
                    ->orWhereRaw("DATE_ADD(last_auto_generated_invoice, INTERVAL auto_generate_amount DAY) <= ?", [now()]);
            })
            ->chunkById(100, function ($projects) {
                foreach ($projects as $project) {
                    Log::channel('invoices')->info('--------- Begin of new invoice generation for project ---------');
                    Log::channel('invoices')
                        ->info("Project {$project->name} is due another invoice.");
                    $project->updateQuietly([
                        'last_auto_generated_invoice' => now(),
                    ]);

                    Log::channel('invoices')
                        ->info("Calling function to create invoice for project {$project->name}");
                    $this->handleGenerateInvoiceForProject($project);
                }
            });
    }

    private function handleGenerateInvoiceForProject(Project $project): void
    {
        $project->loadMissing(['time_entries', 'client.user']);

        $companyDetails = CompanyDetails::currentUser($project->client->user->id)->first();

        try {
            Log::channel('invoices')->info("Beginning database transaction to create invoice for project {$project->name}");
            DB::transaction(function () use ($project, $companyDetails) {
                $invoice = new Invoice();
                $invoice->client_id = $project->client_id;
                $invoice->project_id = $project->id;
                $invoice->issued_at = now();
                $invoice->due_at = now()->addDays($companyDetails?->payment_term ?? 14);
                $invoice->status = InvoiceStatusEnum::OPEN->name;
                $invoice->client_company = $project->client->company_name;
                $invoice->client_address_line1 = $project->client->address_line1;
                $invoice->client_postal_code = $project->client->postal_code;
                $invoice->client_city = $project->client->city;
                $invoice->client_country = $project->client->country;
                $invoice->service_period_start = $project->time_entries->first()?->started_at;
                $invoice->service_period_end = $project->time_entries->last()?->ended_at;

                $invoice->save();
                Log::channel('invoices')
                    ->info("Saved new invoice ({$invoice->invoice_number}) for project {$project->name}");
                foreach ($project->time_entries as $time_entry) {
                    if ($time_entry->started_at->isBetween(now()->subDays($project->auto_generate_amount), now())) {
                        $invoice->items()->create([
                            'unit' => 'Std.',
                            'description' => $time_entry->description,
                            'quantity' => round($time_entry->duration_hours / 60),
                            'unit_price' => $project->hourly_rate,
                            'total' => $project->hourly_rate * round($time_entry->duration_hours / 60)
                        ]);
                    }

                }
            });



        } catch (QueryException|\Throwable $e) {
            Log::channel('invoices')
                ->error("An error occurred while generating an invoice for project {$project->name}. Error message: {$e->getMessage()}");
            // Set column to null to ensure the job tries to run this job for the same project again.
            $project->updateQuietly([
                'last_auto_generated_invoice' => null
            ]);
        } finally {
            Log::channel('invoices')->info('--------- End of new invoice generation for project ---------');
        }

    }
}
