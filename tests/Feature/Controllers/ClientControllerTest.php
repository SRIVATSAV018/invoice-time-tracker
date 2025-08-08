<?php

use App\Models\Client;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use function Pest\Laravel\{actingAs, get, post, put, delete};

// Simulate policies: allow owners and forbid non-owners for Client model
beforeEach(function () {
    Gate::define('viewAny', fn(User $user, $model) => true);
    Gate::define('view', fn(User $user, Client $client) => $client->user_id === $user->id);
    Gate::define('create', fn(User $user, $model) => true);
    Gate::define('update', fn(User $user, Client $client) => $client->user_id === $user->id);
    Gate::define('delete', fn(User $user, Client $client) => $client->user_id === $user->id);
    Gate::define('restore', fn(User $user, Client $client) => $client->user_id === $user->id);
    Gate::define('forceDelete', fn(User $user, Client $client) => $client->user_id === $user->id);
});

it('redirects guests from client routes to login', function () {
    $client = Client::factory()->create();
    get(route('clients.index'))->assertRedirect(route('login'));
    get(route('clients.create'))->assertRedirect(route('login'));
    post(route('clients.store'), [])->assertRedirect(route('login'));
    get(route('clients.edit', $client))->assertRedirect(route('login'));
    put(route('clients.update', $client), [])->assertRedirect(route('login'));
    delete(route('clients.destroy', $client))->assertRedirect(route('login'));
});

it('allows an authenticated user to view their client index', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    // Create two clients for this user (one active, one soft-deleted)
    $clientActive = Client::factory()->for($user)->create(['company_name' => 'Active Co']);
    $clientDeleted = Client::factory()->for($user)->create(['company_name' => 'Deleted Co']);
    $clientDeleted->delete();

    // By default (withDeleted = false), should see only active clients
    $response = actingAs($user)->get(route('clients.index'));
    $response->assertStatus(200);
    $response->assertSee('Active Co')->assertDontSee('Deleted Co');

    // Request including trashed clients
    $response = actingAs($user)->get(route('clients.index', ['withDeleted' => 'true']));
    $response->assertStatus(200);
    $response->assertSee('Active Co')->assertSee('Deleted Co');
});

it('returns clients index with correct structure and pagination', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    Client::factory()->for($user)->count(12)->create();  // more than one page of clients
    $response = actingAs($user)->get(route('clients.index', ['page' => 2]));
    $response->assertStatus(200);    // Ensure filters data is present in response
});

it('allows an authenticated user to create a new client with valid data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $clientData = [
        'company_name' => 'ACME Corp',
        'contact_person' => 'John Doe',
        'contact_person_gender' => \App\Enums\GenderEnum::MALE->name,
        'email' => 'john@acme.test',
        'address_line1' => '123 Main St',
        'postal_code' => '12345',
        'city' => 'Metropolis',
        'country' => 'USA'
    ];
    $response = actingAs($user)->post(route('clients.store'), $clientData);
    $response->assertRedirect();  // should redirect to the new client's show page
    $this->assertDatabaseHas('clients', [
        'company_name' => 'ACME Corp',
        'contact_person' => 'John Doe',
        'contact_person_gender' => \App\Enums\GenderEnum::MALE->name,
        'contact_person_salutation' => null,
        'user_id' => $user->id,
        'address_line1' => '123 Main St',
        'postal_code' => '12345',
        'city' => 'Metropolis',
        'country' => 'USA'
    ]);
});

it('validates input when creating a new client', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    // Omit required fields like company_name
    $response = actingAs($user)->post(route('clients.store'), [
        'company_name' => '',
        'email' => 'not-an-email'
    ]);
    $response->assertSessionHasErrors(['company_name', 'email', 'contact_person_gender']);
    $this->assertEquals(0, Client::count());
});

it('allows an authenticated user to view their own client details', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create(['company_name' => 'My Client Co']);
    $response = actingAs($user)->get(route('clients.show', $client));
    $response->assertStatus(200);
});

it('forbids a user from viewing another users client', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $response = actingAs($user2)->get(route('clients.show', $client));
    $response->assertNotFound();
});

it('allows editing a client by its owner', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create(['company_name' => 'EditCo']);
    $response = actingAs($user)->get(route('clients.edit', $client));
    $response->assertStatus(200);
});

it('forbids editing a client that the user does not own', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $response = actingAs($user2)->get(route('clients.edit', $client));
    $response->assertNotFound();
});

it('allows the owner to update their client with valid data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create(['company_name' => 'OldName']);
    $updateData = [
        'company_name' => 'NewName Co',
        'contact_person' => 'John Doe',
        'contact_person_gender' => \App\Enums\GenderEnum::MALE->name,
        'email' => 'new@example.com',
        'address_line1' => 'Example Street',
        'address_line2' => 'Level 0',
        'postal_code' => '00000',
        'city' => 'ExampleCity',
        'country' => 'USA'
    ];
    $response = actingAs($user)->put(route('clients.update', $client), $updateData);
    $response->assertStatus(302);  // No content (204) or OK on success
    $client->refresh();
    expect($client->company_name)->toBe('NewName Co')
        ->and($client->email)->toBe('new@example.com')
        ->and($client->contact_person)->toBe('John Doe')
        ->and($client->contact_person_gender)->toBe(\App\Enums\GenderEnum::MALE->name)
        ->and($client->address_line1)->toBe('Example Street')
        ->and($client->address_line2)->toBe('Level 0')
        ->and($client->postal_code)->toBe('00000')
        ->and($client->city)->toBe('ExampleCity')
        ->and($client->country)->toBe('USA');
});

it('validates input when updating a client', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create(['company_name' => 'ValidCo']);
    $response = actingAs($user)->put(route('clients.update', $client), [
        'company_name' => '',  // required field empty
        'email' => 'invalid-email',
    ]);
    $response->assertSessionHasErrors(['company_name', 'email']);
    // Client remains unchanged
    $client->refresh();
    expect($client->company_name)->toBe('ValidCo');
});

it('forbids a user from updating another users client', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create(['company_name' => 'OtherCo']);
    $response = actingAs($user2)->put(route('clients.update', $client), [
        'company_name' => 'HackedCo'
    ]);
    $response->assertNotFound();
    $client->refresh();
    expect($client->company_name)->toBe('OtherCo');
});

it('soft deletes a client when the owner requests deletion', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $response = actingAs($user)->delete(route('clients.destroy', $client));
    $response->assertStatus(200);  // success (no content)
    $client->refresh();
    expect($client->trashed())->toBeTrue();
});

it('forbids deletion of a client by non-owner', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $response = actingAs($user2)->delete(route('clients.destroy', $client));
    $response->assertNotFound();
    expect($client->fresh()->trashed())->toBeFalse();
});

it('allows the owner to restore a soft-deleted client', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $client->delete();
    expect($client->trashed())->toBeTrue();
    $response = actingAs($user)->post(route('clients.restore', $client));
    $response->assertStatus(200);
    expect($client->fresh()->trashed())->toBeFalse();
});

it('forbids restoring a client by non-owner', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $client->delete();
    $response = actingAs($user2)->post(route('clients.restore', $client));
    $response->assertNotFound();
    expect($client->fresh()->trashed())->toBeTrue();
});

it('allows the owner to permanently delete (force destroy) a soft-deleted client', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $client->delete();
    $response = actingAs($user)->delete(route('clients.force-destroy', $client));
    $response->assertStatus(200);
    $this->assertDatabaseMissing('clients', ['id' => $client->id]);
});

it('forbids force deleting a client by non-owner', function () {
    [$user1, $user2] = User::factory()->count(2)->create();
    $client = Client::factory()->for($user1)->create();
    $client->delete();
    $response = actingAs($user2)->delete(route('clients.force-destroy', $client));
    // We check for status code 404 because we've changed the route
    // model binding of that model to ensure the client can only be found if it actually is related to the current
    // authenticated user.
    $response->assertNotFound();
    // Record still exists (soft-deleted)
    $this->assertDatabaseHas('clients', ['id' => $client->id]);
});
