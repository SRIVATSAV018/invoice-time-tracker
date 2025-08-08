<?php

namespace App\Console\Commands;

use App\Enums\OfferStatusEnum;
use App\Models\Offer;
use Illuminate\Console\Command;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class HandleExpiredOffersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'offers:expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically set\'s all offers to status expired if they have expired.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        try {
            DB::beginTransaction();

            Offer::where('valid_until', '<', now())
                ->each(function (Offer $offer) {
                    $offer->updateQuietly([
                        'status' => OfferStatusEnum::EXPIRED->name
                    ]);
                });

            DB::commit();
        } catch (QueryException|\Throwable $exception) {
            report($exception);
            DB::rollBack();
        }
    }
}
