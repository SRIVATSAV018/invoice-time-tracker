<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Offer;
use App\Models\OfferItem;
use App\Models\Project;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(5)
            ->has(
            // je Client 2 Projekte, 4 Rechnungen und 2 Angebote
                Client::factory()
                    ->count(rand(2, 15))
                    ->has(
                        Project::factory()
                            ->count(rand(2, 10))
                            // jedem Projekt 5 TimeEntries
                            ->has(TimeEntry::factory()->count(rand(0, 50)), 'time_entries'),
                        'projects'
                    )
                    ->has(
                    // Angebote
                        Offer::factory()->count(rand(3, 20))
                            ->has(OfferItem::factory()->count(rand(2, 15)), 'items'),
                        'offers'
                    )
                    ->has(
                    // Rechnungen
                        Invoice::factory()->count(rand(3, 20))
                            ->has(InvoiceItem::factory()->count(rand(2, 15)), 'items'),
                        'invoices'
                    ),
                'clients'
            )
            ->create();
    }
}
