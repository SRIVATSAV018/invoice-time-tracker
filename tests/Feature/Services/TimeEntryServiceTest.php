<?php

use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use App\Services\TimeEntryService;
use Illuminate\Support\Carbon;

it('calculates duration_hours correctly and saves a new time entry', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    Carbon::setTestNow('2025-01-01 00:00:00');
    $data = [
        'project_id' => $project->id,
        'user_id'    => $user->id,
        'description' => 'Test Entry',
        'started_at'  => '2025-01-01T10:00:00',
        'ended_at'    => '2025-01-01T11:30:00',  // 90 Minuten später
    ];
    $entry = app(TimeEntryService::class)->storeTimeEntry($data);
    // Prüfen, ob duration_hours = 90 gesetzt wurde
    $this->assertDatabaseHas('time_entries', [
        'id' => $entry->id,
        'project_id' => $project->id,
        'user_id'    => $user->id,
        'duration_hours' => 90,
    ]);
    expect($entry->duration_hours)->toBe(90.0);
});

