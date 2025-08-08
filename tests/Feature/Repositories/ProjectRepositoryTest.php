<?php

use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use App\Repositories\ProjectRepository;
use function Pest\Laravel\actingAs;

it('filter() liefert Projekte nach Status und berücksichtigt Soft-Deletes', function () {
    $user = User::factory()->create();
    actingAs($user);
    $client = Client::factory()->for($user)->create();
    \Carbon\Carbon::setTestNow('2025-07-01 00:00:00');
    // Projekt 1: zukünftiges Startdatum (upcoming)
    $upcoming = Project::factory()->for($client)->create([
        'name' => 'Future Project',
        'starts_at' => now()->addDays(10),
        'ends_at'   => now()->addMonths(1),
    ]);
    // Projekt 2: schon beendet (finished)
    $finished = Project::factory()->for($client)->create([
        'name' => 'Old Project',
        'starts_at' => now()->subMonths(2),
        'ends_at'   => now()->subDays(1),
    ]);
    // Projekt 3: laufend (wip)
    $wip = Project::factory()->for($client)->create([
        'name' => 'Ongoing Project',
        'starts_at' => now()->subDays(5),
        'ends_at'   => now()->addDays(5),
    ]);
    // Projekt 4: gelöscht
    $deleted = Project::factory()->for($client)->create(['name' => 'Deleted Project']);
    $deleted->delete();

    $repo = app(ProjectRepository::class);

    $res = $repo->filter('Ongoing Project', null, null, null);
    expect(collect($res->items())->pluck('id'))->toContain($wip->id)
        ->and($res->total())->toBe(1);
    // upcoming filter
    $res = $repo->filter(null, null, 'false', 'upcoming');
    expect(collect($res->items())->pluck('id'))->toContain($upcoming->id)
        ->and($res->total())->toBe(1);
    // finished filter
    $res = $repo->filter(null, null, 'false', 'finished');
    expect(collect($res->items())->pluck('id'))->toContain($finished->id)
        ->and($res->total())->toBe(1);
    // wip filter
    $res = $repo->filter(null, null, 'false', 'wip');
    expect(collect($res->items())->pluck('id'))->toContain($wip->id)
        ->and($res->total())->toBe(1);
    // mit gelöscht
    $res = $repo->filter(null, null, 'true', 'all');
    expect(collect($res->items())->pluck('id'))->toContain($deleted->id);
});
