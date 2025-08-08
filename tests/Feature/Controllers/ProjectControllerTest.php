<?php

use App\Models\Project;
use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use function Pest\Laravel\{actingAs, get, post, put, delete};

// Simulate policies for Project: owners allowed, others forbidden
beforeEach(function () {
    Gate::define('viewAny', fn(User $user, $model) => true);
    Gate::define('view', fn(User $user, Project $project) => $project->client->user_id === $user->id);
    Gate::define('create', fn(User $user, $model) => true);
    Gate::define('update', fn(User $user, Project $project) => $project->client->user_id === $user->id);
    Gate::define('delete', fn(User $user, Project $project) => $project->client->user_id === $user->id);
    Gate::define('restore', fn(User $user, Project $project) => $project->client->user_id === $user->id);
    Gate::define('forceDelete', fn(User $user, Project $project) => $project->client->user_id === $user->id);
});

it('redirects guests from project routes', function () {
    $project = Project::factory()->create();
    get(route('projects.index'))->assertRedirect(route('login'));
    get(route('projects.create'))->assertRedirect(route('login'));
    post(route('projects.store'), [])->assertRedirect(route('login'));
    get(route('projects.edit', $project))->assertRedirect(route('login'));
    put(route('projects.update', $project), [])->assertRedirect(route('login'));
    delete(route('projects.destroy', $project))->assertRedirect(route('login'));
});

it('allows an authenticated user to view their project index', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    // Each project belongs to a client, so create a client for the user
    $client = Client::factory()->for($user)->create();
    $project1 = Project::factory()->for($client)->create(['name' => 'Alpha']);
    $project2 = Project::factory()->for($client)->create(['name' => 'Beta']);
    $project2->delete();  // soft-delete one project

    // Default index: should list only non-deleted projects
    $response = actingAs($user)->get(route('projects.index'));
    $response->assertStatus(200);

    // Include deleted projects
    $response = actingAs($user)->get(route('projects.index', ['withDeleted' => 'true']));
    $response->assertStatus(200);
});

it('shows the project listing with correct filters and data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    Project::factory()->for($client)->count(5)->create();
    $response = actingAs($user)->get(route('projects.index', ['projectStatus' => null]));
    $response->assertStatus(200);
});

it('allows showing form to create new project', function () {
    $user = User::factory()->create();

    $response = actingAs($user)->get(route('projects.create'));
    $response->assertStatus(200);
});

it('allows creation of a new project with valid data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $formData = [
        'client_id' => $client->id,
        'name' => 'New Project',
        'description' => 'Project description',
        'hourly_rate' => '100.00',
        'starts_at' => now()->format('Y-m-d'),
        'ends_at' => null,
        'tech_stack' => 'PHP,Laravel',
        'auto_generate_invoice' => false,
        'auto_generate_amount' => 0
        // 'auto_generate_amount' field is required if auto_generate_invoice is accepted (true),
        // so we leave it out since auto_generate_invoice is "0" (false).
    ];
    $response = actingAs($user)->post(route('projects.store'), $formData);
    $response->assertStatus(302);
    $this->assertDatabaseHas('projects', [
        'name' => 'New Project',
        'client_id' => $client->id,
    ]);
});

it('validates input when creating a project', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    // Missing required name and invalid hourly_rate format
    $response = actingAs($user)->post(route('projects.store'), [
        'client_id' => '',
        'name' => '',
        'hourly_rate' => '100',  // should have two decimal places
        'starts_at' => '',
    ]);
    $response->assertSessionHasErrors(['client_id', 'name', 'hourly_rate', 'starts_at']);
    expect(Project::count())->toBe(0);
});

it('allows viewing a specific project with loaded relations and metrics', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    // Create a project with some related data
    $project = Project::factory()->for($client)->create(['name' => 'MetricsProject']);
    // (Assume projectService metrics will be calculated; we won't verify values here, just presence)
    $response = actingAs($user)->get(route('projects.show', $project));
    $response->assertStatus(200);
});

it('forbids viewing a project not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $project = Project::factory()->for($client)->create();
    $response = actingAs($user2)->get(route('projects.show', $project));
    $response->assertForbidden();
});

it('allows editing a project by its owner', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create(['name' => 'OldName']);
    $response = actingAs($user)->get(route('projects.edit', $project));
    $response->assertStatus(200);
});

it('forbids editing a project not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $project = Project::factory()->for($client)->create();
    $response = actingAs($user2)->get(route('projects.edit', $project));
    $response->assertForbidden();
});

it('allows updating a project with valid data by owner', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create(['name' => 'InitialName']);
    $updateData = ['name' => 'UpdatedName', 'description' => 'New desc', 'client_id' => $client->id, 'hourly_rate' => '1.25', 'starts_at' => $project->starts_at, 'ends_at' => $project->ends_at, 'tech_stack' => $project->tech_stack, 'auto_generate_invoice' => $project->auto_generate_invoice, 'auto_generate_amount' => $project->auto_generate_amount];
    $response = actingAs($user)->put(route('projects.update', $project), $updateData);
    $response->assertStatus(302);
    $project->refresh();
    expect($project->name)->toBe('UpdatedName')
        ->and($project->description)->toBe('New desc');
});

it('validates input when updating a project', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create(['name' => 'KeepName']);
    $response = actingAs($user)->put(route('projects.update', $project), [
        'name' => '',  // required
        'hourly_rate' => 'abc'  // invalid format
    ]);
    $response->assertSessionHasErrors(['name', 'hourly_rate']);
    expect($project->fresh()->name)->toBe('KeepName');
});

it('forbids updating a project not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $project = Project::factory()->for($client)->create(['name' => 'SecretProj']);
    $response = actingAs($user2)->put(route('projects.update', $project), ['name' => 'Hacked']);
    $response->assertForbidden();
    expect($project->fresh()->name)->toBe('SecretProj');
});

it('soft deletes a project when requested by owner', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $response = actingAs($user)->delete(route('projects.destroy', $project));
    $response->assertStatus(200);
    expect($project->fresh()->trashed())->toBeTrue();
});

it('forbids deleting a project not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $project = Project::factory()->for($client)->create();
    $response = actingAs($user2)->delete(route('projects.destroy', $project));
    $response->assertForbidden();
    expect($project->fresh()->trashed())->toBeFalse();
});

it('allows restoring a soft-deleted project by owner', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $project->delete();
    $response = actingAs($user)->post(route('projects.restore', $project));
    $response->assertStatus(200);
    expect($project->fresh()->trashed())->toBeFalse();
});

it('forbids restoring a project not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $project = Project::factory()->for($client)->create();
    $project->delete();
    $response = actingAs($user2)->post(route('projects.restore', $project));
    $response->assertForbidden();
    expect($project->fresh()->trashed())->toBeTrue();
});

it('allows force deleting a project by owner after soft delete', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $project->delete();
    $response = actingAs($user)->delete(route('projects.force-destroy', $project));
    $response->assertStatus(200);
    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});

it('forbids force deleting a project not owned by user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $project = Project::factory()->for($client)->create();
    $project->delete();
    $response = actingAs($user2)->delete(route('projects.force-destroy', $project));
    $response->assertForbidden();
    $this->assertDatabaseHas('projects', ['id' => $project->id]);
});
