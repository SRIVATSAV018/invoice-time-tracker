<?php

namespace App\Repositories;

use App\Models\Offer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class OfferRepository
{
    public function filter(string|null $query, string|null $client_id, string|null $project_id, string|null $status, string $withDeleted): LengthAwarePaginator
    {
        $userId = auth()->id();

        try {
            $offers = Offer::query()
                ->with(['client', 'project'])
                ->whereHas('client', function (Builder $q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->whereHas('project.client', function (Builder $q) use ($userId) {
                    $q->where('user_id', $userId);
                });

            $offers->when($query, function (Builder $query, $value) {
                $query->where('offer_number', "%$value%");
            });

            $offers->when($client_id, function (Builder $query, $value) {
                if ($value === 'all') return;
                $query->where('client_id', $value);
            });

            $offers->when($project_id, function (Builder $query, $value) {
                if ($value === 'all') return;
                $query->where('client_id', $value);
            });

            $offers->when($status, function (Builder $query, $value) {
                if ($value === 'all') return;
                $query->where('status', $value);
            });

            $offers->when($withDeleted === 'yes', function (Builder $query) {
                $query->withTrashed();
            });

            return $offers->paginate(10)
                ->withQueryString();
        } catch (QueryException) {
            return new LengthAwarePaginator([], 0, 10);
        }

    }

    /**
     * Store a new offer in the database.
     * @param array $data
     * @return Offer|null
     */
    public function store(array $data): ?Offer
    {
        try {
            DB::beginTransaction();

            $offer = Offer::create($data);
            $this->createItemsForOffer($offer, $data['items']);

            DB::commit();

            return $offer;
        } catch (Throwable $e) {
            Log::error($e->getMessage());
            return null;
        }
    }

    /**
     * Updates the given offer with the valid data in the database.
     * @param Offer $offer
     * @param array $data
     * @param bool $replaceItems Whether if you want to remove all items and add them again (data key = items)
     * @return Offer|null
     * @throws Throwable
     */
    public function update(Offer $offer, array $data, bool $replaceItems = true): ?Offer
    {
        try {
            DB::beginTransaction();
            $offer->update($data);

            if ($replaceItems) {
                $offer->items()->delete();
                $this->createItemsForOffer($offer, $data['items']);
            }

            DB::commit();

            return $offer;
        } catch (Throwable) {
            DB::rollBack();
            return null;
        }
    }

    public function delete(Offer $offer)
    {
        $offer->delete();
    }

    protected function createItemsForOffer(Offer $offer, array $items): void
    {
        collect($items)->each(fn($item) => $offer->items()->create([
            'quantity' => $item['quantity'],
            'unit' => $item['unit'],
            'unit_price' => $item['unit_price'],
            'description' => $item['description'],
            'total' => $item['unit_price'] * $item['quantity']
        ]));
    }
}
