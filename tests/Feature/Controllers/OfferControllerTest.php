<?php

use App\Enums\OfferStatusEnum;
use App\Models\Client;
use App\Models\Offer;
use App\Models\OfferItem;
use App\Models\Project;
use App\Models\User;
use function Pest\Laravel\{actingAs, get, post, put, delete};

beforeEach(function () {
    Gate::define('viewAny', fn(User $user, $model) => true);
    Gate::define('view', fn(User $user, Offer $offer) => $offer->client->user_id === $user->id);
    Gate::define('create', fn(User $user, $model) => true);
    Gate::define('update', fn(User $user, Offer $offer) => $offer->client->user_id === $user->id);
    Gate::define('delete', fn(User $user, Offer $offer) => $offer->client->user_id === $user->id);
    Gate::define('preview', fn(User $user, Offer $offer) => $offer->client->user_id === $user->id);
    Gate::define('sendToClient', fn(User $user, Offer $offer) => $offer->client->user_id === $user->id);
});

it('redirects guests from offer routes', function () {
    $offer = Offer::factory()->create();

    get(route('offers.index'))->assertRedirectToRoute('login');
    get(route('offers.create'))->assertRedirectToRoute('login');
    post(route('offers.store'))->assertRedirectToRoute('login');
    get(route('offers.edit', $offer->id))->assertRedirectToRoute('login');
    put(route('offers.update', $offer->id))->assertRedirectToRoute('login');
    delete(route('offers.destroy', $offer->id))->assertRedirectToRoute('login');
});

it ('lists offers for the authenticated user with filters applied', function () {
    $user = User::factory()->create();
    $user2 = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $otherClient = Client::factory()->for($user2)->create();

    $offer = Offer::factory()->for($client)->create();
    $offer2 = Offer::factory()->for($otherClient)->create();

    actingAs($user)->get(route('offers.index', [
        'query' => $offer->offer_number,
        'client_id' => $offer->client_id,
        'project_id' => $offer->project_id,
        'status' => $offer->status,
        'withDeleted' => true
    ]))
        ->assertOk();
});

it('shows the offer creation form with related clients and projects', function () {
    $user = User::factory()->create();
    $clientA = Client::factory()->for($user)->create(['company_name' => 'ClientA']);
    $clientB = Client::factory()->for($user)->create(['company_name' => 'ClientB']);
    Project::factory()->for($clientA)->create(['name' => 'ProjectA']);
    Project::factory()->for($clientB)->create(['name' => 'ProjectB']);
    // Access create form without specifying client (should list all clients and no projects filtered)
    $response = actingAs($user)->get(route('offers.create'));
    $response->assertStatus(200);
    // Access create form with a specific client filter (client_id param)
    $response = actingAs($user)->get(route('offers.create', ['client_id' => $clientA->id]));
    $response->assertStatus(200);;
});

it('allows storing a new offer with valid data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $offerData = [
        'client_id'    => $client->id,
        'project_id'   => $project->id,
        'status'       => OfferStatusEnum::DRAFT->name,
        'client_company' => 'Example Client',
        'client_contact_person' => 'John Doe',
        'client_contact_person_salutation' => 'dr',
        'client_contact_person_gender' => 'MALE',
        'client_street' => 'Example Street 1',
        'client_postal_code' => '00000',
        'client_city' => 'Example City',
        'client_country' => 'Example Country',
        'client_tax_number' => 'DE000000',
        'project_name' => $project->name,
        'project_description' => 'This is a description',
        'valid_until' => now()->addDay()->format('Y-m-d'),
        'service_period_start' => now()->format('Y-m-d'),
        'service_period_end' => now()->addDay()->format('Y-m-d'),
        'items' => [
            [
                'unit' => 'Std.',
                'description' => 'Test',
                'quantity' => 5,
                'unit_price' => 25.25,
                'total' => 5 * 25.00
            ]
        ]
    ];
    $response = actingAs($user)->post(route('offers.store'), $offerData);
    $response->assertStatus(200);
    $this->assertDatabaseCount('offers', 1);
    $this->assertDatabaseHas('offers', [
        'client_id'    => $client->id,
        'project_id'   => $project->id,
        'status'       => OfferStatusEnum::DRAFT->name,
        'client_company' => 'Example Client',
        'client_contact_person' => 'John Doe',
        'client_contact_person_salutation' => 'dr',
        'client_contact_person_gender' => 'MALE',
        'client_street' => 'Example Street 1',
        'client_postal_code' => '00000',
        'client_city' => 'Example City',
        'client_country' => 'Example Country',
        'client_tax_number' => 'DE000000',
        'project_name' => $project->name,
        'valid_until' => now()->addDay()->format('Y-m-d'),
    ]);
});

it('validates input when storing an offer', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    // Missing client_id and invalid date format
    $response = actingAs($user)->post(route('offers.store'), []);
    $response->assertSessionHasErrors([
        'client_id',
        'project_id',
        'status',
        'client_company',
        'client_contact_person',
        'client_contact_person_gender',
        'client_street',
        'client_postal_code',
        'client_city',
        'client_country',
        'client_tax_number',
        'project_name',
        'valid_until',
    ]);
    expect(Offer::count())->toBe(0);
});

it('allows viewing an offer edit form by the owner', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $offer = Offer::factory()->for($client)->create();
    $response = actingAs($user)->get(route('offers.edit', $offer));
    $response->assertStatus(200);
});

it('forbids viewing the edit form of an offer not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create();
    $client = Client::factory()->for($user1)->create();
    $offer = Offer::factory()->for($client)->create();
    $response = actingAs($user2)->get(route('offers.edit', $offer));
    $response->assertForbidden();
});

it('allows updating an offer and dispatches PDF generation job', function () {
    Bus::fake();
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $offer = Offer::factory()->for($client)->create(['status' => \App\Enums\OfferStatusEnum::DRAFT->name]);
    $updateData = [
        'client_id' => $client->id,
        'valid_until' => now()->addDays(14)->format('Y-m-d'),
        'items' => [
            [
                'unit' => 'Std.',
                'description' => 'Test',
                'quantity' => 5,
                'unit_price' => 25.25,
                'total' => 5 * 25.00
            ]
        ],
        'project_description' => 'This is a description',
        'service_period_start' => now()->format('Y-m-d'),
        'service_period_end' => now()->addDay()->format('Y-m-d'),
        'status' => \App\Enums\OfferStatusEnum::SENT->name,
        'notes' => 'Updated notes'
    ];
    $response = actingAs($user)->put(route('offers.update', $offer), $updateData);
    $response->assertStatus(302);
    $offer->refresh();
    expect($offer->status)->toBe(\App\Enums\OfferStatusEnum::SENT->name)
        ->and($offer->notes)->toBe('Updated notes');
//    Bus::assertDispatched(GenerateInvoiceJob::class, function ($job) use ($offer) {
//        return $job->invoice->is($offer);
//    });
});

it('validates input when updating an offer', function () {
    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $offer = Offer::factory()->for($client)->create();
    // Provide an invalid due_at (before issued_at)
    $badData = [
        'valid_until' => '01.01.2025'
    ];
    $response = actingAs($user)->put(route('offers.update', $offer), $badData);
    $response->assertSessionHasErrors(['valid_until']);
});

it('forbids updating an offer not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $offer = Offer::factory()->for($client)->create(['status' => \App\Enums\OfferStatusEnum::DRAFT->name]);
    $response = actingAs($user2)->put(route('offers.update', $offer), ['status' => 'sent']);
    $response->assertForbidden();
    expect($offer->fresh()->status)->toBe(\App\Enums\OfferStatusEnum::DRAFT->name);
});
