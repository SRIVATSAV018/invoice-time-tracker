<?php

namespace App\Jobs;

use App\Models\Offer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Spatie\Browsershot\Browsershot;

class GenerateOfferJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Offer $offer
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $fileName = sprintf(
            '%s_AN-%s_%s.pdf',
            $this->offer->created_at->format('Y-m-d'),
            $this->offer->offer_number,
            $this->offer->client_company
        );

        try {
            $browsershot = Browsershot::html(
                view('pdfs.offer', [
                    'offer' => $this->offer
                ])->render()
            )->format('A4')
                ->showBackground()
                ->margins(5, 15, 5, 15);

            if (config('app.env') !== 'local') {
                $browsershot->noSandbox();
            }

            $browsershot->save(storage_path("app/private/offers/$fileName"));

            $this->offer->updateQuietly([
                'pdf_url' => route('offers.preview', $this->offer->id)
            ]);
        } catch (\Exception|\Throwable $e) {
            Log::channel('offers')->error('An error occurred while generating an offer: ' . $e->getMessage());
        }
    }
}
