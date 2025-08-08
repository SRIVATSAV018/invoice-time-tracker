<?php

use App\Models\Client;
use App\Models\Project;
use App\Models\TimeEntry;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Support\Carbon;

it('berechnet Einkommen der letzten 30 Tage korrekt mit Rundung', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create(['hourly_rate' => 100]);
    // Zeit fixieren
    Carbon::setTestNow('2025-08-01 12:00:00');
    // Einträge innerhalb der letzten 30 Tage
    TimeEntry::factory()->for($user)->for($project)->create(['duration_hours' => 30, 'started_at' => now()->subDays(10), 'ended_at' => now()->subDays(10)]);  // 0.5h -> 1h -> 100€
    TimeEntry::factory()->for($user)->for($project)->create(['duration_hours' => 60, 'started_at' => now()->subDays(9),  'ended_at' => now()->subDays(9)]);   // 1h -> 1h -> 100€
    TimeEntry::factory()->for($user)->for($project)->create(['duration_hours' => 90, 'started_at' => now()->subDays(8),  'ended_at' => now()->subDays(8)]);   // 1.5h -> 2h -> 200€
    // Eintrag außerhalb 30 Tage (z.B. 40 Tage alt) sollte ignoriert werden
    TimeEntry::factory()->for($user)->for($project)->create(['duration_hours' => 120, 'started_at' => now()->subDays(40), 'ended_at' => now()->subDays(40)]);

    $service = app(ProjectService::class);
    $income = $service->getIncomeLast30Days($project);
    expect($income)->tobe(400.0);  // 100+100+200
    // Kein Eintrag falls Projekt keine Einträge hat
    $emptyProject = Project::factory()->for($client)->create(['hourly_rate' => 50]);
    expect($service->getIncomeLast30Days($emptyProject))->toBe(0.0);
});

it('summiert Duration der letzten 30 Tage korrekt', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for(Client::factory()->for($user)->create())->create();
    Carbon::setTestNow('2025-08-01 00:00:00');
    TimeEntry::factory()->for($user)->for($project)->create(['duration_hours' => 30, 'started_at' => now()->subDays(1),  'ended_at' => now()->subDays(1)]);
    TimeEntry::factory()->for($user)->for($project)->create(['duration_hours' => 60, 'started_at' => now()->subDays(2),  'ended_at' => now()->subDays(2)]);
    TimeEntry::factory()->for($user)->for($project)->create(['duration_hours' => 90, 'started_at' => now()->subDays(15), 'ended_at' => now()->subDays(15)]);
    $spent = app(ProjectService::class)->getSpentTimeLast30Days($project);
    expect($spent)->toBe(180.0);  // 30+60+90
});

