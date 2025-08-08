<?php

namespace App\Services;

use App\Enums\OfferStatusEnum;
use App\Exceptions\OfferPdfDoesNotExistException;
use App\Helpers\Notify;
use App\Models\Offer;
use App\Notifications\OfferAcceptedConfirmationNotification;
use App\Notifications\SendOfferToClientNotification;
use App\Repositories\OfferRepository;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class OfferService
{
    public function __construct(
        public OfferRepository $offerRepository
    )
    {
    }

    public function storeOffer(array $data): ?Offer
    {
        $totals = $this->calculateTotalsForOffer($data['items']);
        $data = array_merge($data, $totals);

        return $this->offerRepository->store($data);
    }

    public function updateOffer(Offer $offer, array $data): ?Offer
    {
        $totals = $this->calculateTotalsForOffer($data['items']);
        $data = array_merge($data, $totals);

        return $this->offerRepository->update($offer, $data);
    }

    public function sendOfferToClient(Offer $offer)
    {
        $offer->loadMissing('client');

        try {
            if (!Storage::disk('local')->exists("offers/{$offer->getFileName()}")) {
                throw new OfferPdfDoesNotExistException("Die Angebots-PDF {$offer->getFileName()} existiert nicht.");
            }

            Notification::route('mail', $offer->client->email)
                ->notify(new SendOfferToClientNotification($offer));

            $offer->updateQuietly([
                'status' => OfferStatusEnum::SENT->name,
                'sent_at' => now()
            ]);
            Notify::success("Die E-Mail des Angebots {$offer->offer_number} wurde erfolgreich an den Kunden versendet.");
        } catch (OfferPdfDoesNotExistException $e) {
            Notify::error("Die E-Mail konnte nicht versendet werden. {$e->getMessage()}");
        }
    }

    public function acceptOffer(Offer $offer, string|null $ipAddress): void
    {
        // If the status of the offer is not equal sent this action is not authorized.
        if ($offer->status !== OfferStatusEnum::SENT->name) {
            abort(403, 'Sie können dieses Angebot nicht annehmen.');
        }

        $this->offerRepository->update($offer, [
            'status' => OfferStatusEnum::ACCEPTED->name,
            'accepted_at' => now(),
            'accepted_by_ip' => $ipAddress
        ], false);

        Notification::route('mail', $offer->client->email)
            ->notify(new OfferAcceptedConfirmationNotification($offer));
    }

    protected function calculateTotalsForOffer(array $items): array
    {
        $taxRate = auth()->user()->settings?->sales_tax ?? 0;

        $netTotal = collect($items)->sum(fn($item) => $item['quantity'] * $item['unit_price']);
        $taxTotal = $netTotal * ($taxRate / 100);
        $grossTotal = $netTotal + $taxTotal;

        return [
            'net_total'   => $netTotal,
            'tax_total'   => $taxTotal,
            'tax_rate'    => $taxRate,
            'gross_total' => $grossTotal,
        ];
    }
}
