<?php

namespace App\Observers;

use App\Jobs\GenerateOfferJob;
use App\Models\Offer;
use Carbon\Carbon;

class OfferObserver
{
    /**
     * Handle the Offer "created" event.
     */
    public function created(Offer $offer): void
    {
        $this->setOfferNumber($offer);

        GenerateOfferJob::dispatch($offer);
    }

    /**
     * Handle the Offer "updated" event.
     */
    public function updated(Offer $offer): void
    {
        if (is_null($offer->offer_number)) {
            $this->setOfferNumber($offer);
        }

        GenerateOfferJob::dispatch($offer);
    }

    /**
     * Handle the Offer "deleted" event.
     */
    public function deleted(Offer $offer): void
    {
        //
    }

    /**
     * Handle the Offer "restored" event.
     */
    public function restored(Offer $offer): void
    {
        //
    }

    /**
     * Handle the Offer "force deleted" event.
     */
    public function forceDeleted(Offer $offer): void
    {
        //
    }

    public function setOfferNumber(Offer $offer)
    {
        $monthYear = Carbon::now()->format('m-Y');            // z. B. "07-2025"
        $sequence   = str_pad($offer->id, 2, '0', STR_PAD_LEFT); // z. B. "01"
        $number    = "AN-{$monthYear}-{$sequence}";

        $offer->updateQuietly([
            'offer_number' => $number
        ]);
    }
}
