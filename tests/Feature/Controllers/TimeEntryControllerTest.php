<?php

use App\Models\Client;
use App\Models\Project;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\{actingAs, get, post, delete, put};
use Illuminate\Support\Carbon;

it('redirects guests from time entry routes', function () {
    $timeEntry = TimeEntry::factory()->create();
    get(route('time_entries.index'))->assertRedirect(route('login'));
    get(route('time_entries.create'))->assertRedirect(route('login'));
    post(route('time_entries.store', []))->assertRedirect(route('login'));
    get(route('time_entries.edit', $timeEntry))->assertRedirect(route('login'));
    put(route('time_entries.update', $timeEntry), [])->assertRedirect(route('login'));
    delete(route('time_entries.destroy', $timeEntry))->assertRedirect(route('login'));
});

it('lists time entries for the authenticated user', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $otherClient = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    // Create time entries for this user and another user
    $myEntry = TimeEntry::factory()->for($user)->for($project)->create(['description' => 'Mine']);
    $otherUser = User::factory()->create(['email_verified_at' => now()]);
    TimeEntry::factory()->for($otherUser)->for(Project::factory()->for($otherClient))->create(['description' => 'NotMine']);
    $response = actingAs($user)->get(route('time_entries.index'));
    $response->assertStatus(200);
});

it('shows the time entry creation form with projects list', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create(['name' => 'Sample Project']);
    $response = actingAs($user)->get(route('time_entries.create'));
    $response->assertStatus(200);  // Ensure project list is provided
});

it('allows storing a new time entry with valid data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $start = Carbon::now()->setSeconds(0);
    $end = (clone $start)->addHour();
    $formData = [
        'project_id' => $project->id,
        'description' => 'Worked on feature X',
        'started_at'  => $start->format('Y-m-d\\TH:i'),
        'ended_at'    => $end->format('Y-m-d\\TH:i'),
    ];
    $response = actingAs($user)->post(route('time_entries.store'), $formData);
    $response->assertStatus(302);
    // Check that the time entry was created in the database with correct data
    $this->assertDatabaseHas('time_entries', [
        'project_id' => $project->id,
        'user_id'    => $user->id,
        'description' => 'Worked on feature X',
        // Duration should be 60 minutes for 1 hour difference
        'duration_hours' => 60
    ]);
});

it('validates input when storing a time entry', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    // Missing required fields or invalid times (ended_at before started_at)
    $formData = [
        'project_id' => $project->id,
        'started_at' => '2025-01-01T10:00',
        'ended_at'   => '2025-01-01T09:00',  // ends before start
    ];
    $response = actingAs($user)->post(route('time_entries.store'), $formData);
    $response->assertSessionHasErrors(['ended_at']);  // should flag ended_at (after:started_at rule)
    expect(TimeEntry::count())->toBe(0);
});

it('shows the time entry edit form for the owner', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $timeEntry = TimeEntry::factory()->for($user)->for($project)->create(['description' => 'UpdateMe', 'project_id' => $project->id, 'started_at' => '2025-01-01T12:00', 'ended_at' => '2025-12-01T12:00']);
    $response = actingAs($user)->get(route('time_entries.edit', $timeEntry));
    $response->assertStatus(200);
});

it('forbids viewing the edit form for a time entry not owned by user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $project = Project::factory()->for($client)->create();
    $timeEntry = TimeEntry::factory()->for($user1)->for($project)->create();
    $response = actingAs($user2)->get(route('time_entries.edit', $timeEntry));
    $response->assertForbidden();
});

it('allows updating a time entry by the owner with valid data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $timeEntry = TimeEntry::factory()->for($user)->for($project)->create(['description' => 'Old desc']);
    $newData = ['description' => 'New desc', 'project_id' => $project->id, 'started_at' => '2025-01-01T12:00', 'ended_at' => '2025-12-01T12:00'];
    $response = actingAs($user)->put(route('time_entries.update', $timeEntry), $newData);
    $response->assertStatus(302);
    expect($timeEntry->fresh()->description)->toBe('New desc');
});

it('validates input when updating a time entry', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $timeEntry = TimeEntry::factory()->for($user)->for($project)->create(['description' => 'Keep desc']);
    // Provide an ended_at earlier than started_at (should fail validation)
    $badData = [
        'started_at' => '2025-01-01T10:00',
        'ended_at'   => '2025-01-01T09:00'
    ];
    $response = actingAs($user)->put(route('time_entries.update', $timeEntry), $badData);
    $response->assertSessionHasErrors(['ended_at']);
    expect($timeEntry->fresh()->description)->toBe('Keep desc');
});

it('forbids updating a time entry not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $project = Project::factory()->for($client)->create();
    $timeEntry = TimeEntry::factory()->for($user1)->for($project)->create(['description' => 'Secret']);
    $response = actingAs($user2)->put(route('time_entries.update', $timeEntry), [
        'description' => 'Hacked'
    ]);
    $response->assertForbidden();
    expect($timeEntry->fresh()->description)->toBe('Secret');
});

it('allows an owner to delete a time entry', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $timeEntry = TimeEntry::factory()->for($user)->for($project)->create();
    $response = actingAs($user)->delete(route('time_entries.destroy', $timeEntry));
    $response->assertStatus(200);
    $this->assertDatabaseMissing('time_entries', ['id' => $timeEntry->id]);
});

it('forbids deletion of a time entry not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $project = Project::factory()->for($client)->create();
    $timeEntry = TimeEntry::factory()->for($user1)->for($project)->create();
    $response = actingAs($user2)->delete(route('time_entries.destroy', $timeEntry));
    $response->assertForbidden();
    $this->assertDatabaseHas('time_entries', ['id' => $timeEntry->id]);
});

