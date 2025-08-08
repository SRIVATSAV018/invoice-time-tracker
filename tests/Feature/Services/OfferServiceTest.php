<?php

use App\Enums\GenderEnum;
use App\Enums\InvoiceStatusEnum;
use App\Enums\OfferStatusEnum;
use App\Exceptions\OfferPdfDoesNotExistException;
use App\Models\Client;
use App\Models\Offer;
use App\Models\Project;
use App\Models\User;
use App\Notifications\OfferAcceptedConfirmationNotification;
use App\Notifications\SendOfferToClientNotification;
use App\Repositories\OfferRepository;
use App\Services\OfferService;
use function \Pest\Laravel\{actingAs};

test('service stores offer in database', function () {
    $repository = $this->app->make(OfferRepository::class);
    $service = new OfferService($repository);

    $client = Client::factory()->create();

    $project = Project::factory()->for($client)->create();

    $service->storeOffer([
        'client_id' => $client->id,
        'project_id' => $project->id,
        'status' => InvoiceStatusEnum::DRAFT->name,
        'client_company' => $client->company_name,
        'client_contact_person' => $client->contact_person,
        'client_contact_person_gender' => GenderEnum::MALE->name,
        'client_contact_person_salutation' => 'dr',
        'client_street' => $client->address_line1,
        'client_postal_code' => $client->postal_code,
        'client_city' => $client->city,
        'client_country' => $client->country,
        'client_tax_number' => $client->tax_number,
        'project_name' => $project->name,
        'project_description' => $project->description,
        'service_period_start' => now(),
        'valid_until' => now()->addMonth(),
        'items' => [
            [
                'quantity' => 25,
                'unit' => 'Hrs',
                'unit_price' => 25.50,
                'description' => 'This is an example'
            ]
        ]
    ]);

    $this->assertDatabaseCount('offers', 1);
    $this->assertDatabaseHas('offers', [
        'net_total' => 25 * 25.50,
        'tax_total' => 0,
        'gross_total' => 25 * 25.50
    ]);
});

test('service can update existing offer', function () {
    $repository = $this->app->make(OfferRepository::class);
    $service = new OfferService($repository);

    $client = Client::factory()->create();
    $project = Project::factory()->for($client)->create();
    $offer = Offer::factory()->for($project)->for($client)->create();

    $newDueAt = now()->addYear();

    $service->updateOffer($offer, [
        'due_at' => $newDueAt,
        'items' => [
            [
                'quantity' => 25,
                'unit' => 'Hrs',
                'unit_price' => 25.50,
                'description' => 'This is an example'
            ],
            [
                'quantity' => 5,
                'unit' => 'Hrs',
                'unit_price' => 5,
                'description' => 'This is an example'
            ]
        ]
    ]);

    $offer->fresh();

    expect($offer->net_total)->toBe(((25 * 25.50) + (5 * 5)))
        ->and($offer->tax_total)->toBe(0.0)
        ->and($offer->gross_total)->toBe(((25 * 25.50) + (5 * 5)));
});

test('service can not send offer to client when pdf does not exist', function () {
    Notification::fake();
    $repository = $this->app->make(OfferRepository::class);
    $service = new OfferService($repository);

    $this->withoutExceptionHandling();

    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $offer = Offer::factory()->for($project)->for($client)->create();

    actingAs($user);

    $service->sendOfferToClient($offer);

    expect()
        ->not->toThrow(OfferPdfDoesNotExistException::class)
        ->and(session('notification'))
        ->not->toBeNull()
        ->and(session('notification'))
        ->toBe([
            'message' => "Die E-Mail konnte nicht versendet werden. Die Angebots-PDF {$offer->getFileName()} existiert nicht.",
            'type' => 'error'
        ]);

    Notification::assertNothingSent();
});

test('service can send offer to client when pdf exists', function () {
    Notification::fake();
    Storage::fake('local');
    $repository = $this->app->make(OfferRepository::class);
    $service = new OfferService($repository);

    $this->withoutExceptionHandling();

    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $offer = Offer::factory()->for($project)->for($client)->create();

    actingAs($user);

    expect($offer->sent_at)->toBeNull();

    Storage::disk('local')->put("offers/{$offer->getFileName()}", '');

    $service->sendOfferToClient($offer);

    expect()
        ->not->toThrow(OfferPdfDoesNotExistException::class);

    Notification::assertSentOnDemand(SendOfferToClientNotification::class);

    expect($offer->sent_at)
        ->not->toBeNull()
        ->and($offer->status)
        ->toBe(OfferStatusEnum::SENT->name)
        ->and(session('notification'))
        ->not->toBeNull()
        ->and(session('notification'))
        ->toBe([
            'message' => "Die E-Mail des Angebots {$offer->offer_number} wurde erfolgreich an den Kunden versendet.",
            'type' => 'success'
        ]);
});

test('service can not can accept offer if offer has not been sent to customer yet', function () {
    Notification::fake();

    $repository = $this->app->make(OfferRepository::class);
    $service = new OfferService($repository);

    $this->withoutExceptionHandling();

    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $offer = Offer::factory()->for($project)->for($client)->create();

    $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
    $this->expectExceptionMessage('Sie können dieses Angebot nicht annehmen.');

    $service->acceptOffer($offer, null);

    Notification::assertNothingSent();
});

test('service can can accept offer', function () {
    Notification::fake();

    $repository = $this->app->make(OfferRepository::class);
    $service = new OfferService($repository);

    $this->withoutExceptionHandling();

    $user = User::factory()->create();
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $offer = Offer::factory()->sent()->for($project)->for($client)->create();

    $service->acceptOffer($offer, null);

    $offer->fresh();

    expect($offer->status)
        ->toBe(OfferStatusEnum::ACCEPTED->name)
        ->and($offer->accepted_at)->not->toBeNull();

    Notification::assertSentOnDemand(OfferAcceptedConfirmationNotification::class);
});
