<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Offer;
use App\Models\OfferItem;
use App\Models\Project;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SetUuidForAllModelsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'models:set-uuid-for-all-models';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sets all uuids for all models.';

    /**
     * @var array<class-string>
     */
    protected array $models = [
        Client::class,
        InvoiceItem::class,
        Invoice::class,
        OfferItem::class,
        Offer::class,
        Project::class,
        TimeEntry::class,
        User::class
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        try {
            DB::beginTransaction();

            foreach ($this->models as $model) {
                $this->info("Updating all models from class $model");
                $model::each(function ($model) {
                    $model->updateQuietly([
                        'uuid' => Str::uuid()
                    ]);
                });
            }

            DB::commit();

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->fail("An error occurred {$e->getMessage()}");
        }
    }
}
