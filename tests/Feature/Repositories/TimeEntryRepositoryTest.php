<?php

use App\Models\Client;
use App\Models\Project;
use App\Models\TimeEntry;
use App\Models\User;
use App\Repositories\TimeEntryRepository;
use Illuminate\Support\Carbon;
use function Pest\Laravel\actingAs;

it('filter() durchsucht Beschreibung und Zeitraum nur für aktuellen User', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $client1 = Client::factory()->for($user1)->create();
    $client2 = Client::factory()->for($user2)->create();
    $project1 = Project::factory()->for($client1)->create();
    $project2 = Project::factory()->for($client2)->create();
    // Zwei Einträge für user1 und einer für user2
    Carbon::setTestNow('2025-07-15 12:00:00');
    $entry1 = TimeEntry::factory()->for($user1)->for($project1)->create([
        'description' => 'Worked on feature X',
        'started_at'  => '2025-07-10 10:00:00',
        'ended_at'    => '2025-07-12 12:00:00',
    ]);
    // Dieser liegt z.T. außerhalb des Filters (endet nach dem 13.)
    $entry2 = TimeEntry::factory()->for($user1)->for($project1)->create([
        'description' => 'Other task Y',
        'started_at'  => '2025-07-11 09:00:00',
        'ended_at'    => '2025-07-15 18:00:00',
    ]);
    // Eintrag von user2 (sollte nie erscheinen bei actingAs(user1))
    TimeEntry::factory()->for($user2)->for($project2)->create([
        'description' => 'Not my entry',
        'started_at'  => '2025-07-05 00:00:00',
        'ended_at'    => '2025-07-06 00:00:00',
    ]);

    actingAs($user1);
    $repo = app(TimeEntryRepository::class);
    // Filter: Zeitraum 2025-07-10 bis 2025-07-13, Suche "feature"
    $res = $repo->filter('feature', null, '2025-07-10', '2025-07-13');
    $items = collect($res->items());
    // Erwartet: entry1 passt (enthält "feature", liegt 10.-12.7.), entry2 fällt raus (endet am 15.7.), user2-Eintrag ausgeschlossen durch Scope
    expect($items->pluck('id'))->toContain($entry1->id)
        ->and($items->pluck('description'))->not->toContain('Not my entry')
        ->and($res->total())->toBe(1);
});

