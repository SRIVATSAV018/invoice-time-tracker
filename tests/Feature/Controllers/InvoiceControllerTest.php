<?php

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Gate;
use App\Jobs\GenerateInvoiceJob;
use App\Notifications\SendInvoiceToClientNotification;
use Illuminate\Support\Facades\Storage;
use function Pest\Laravel\{actingAs, get, post, put, delete};

// Simulate policies for Invoice: allow if invoice's client belongs to user
//beforeEach(function () {
//    Gate::define('viewAny', fn(User $user, $model) => true);
//    Gate::define('view', fn(User $user, Invoice $invoice) => $invoice->client->user_id === $user->id);
//    Gate::define('create', fn(User $user, $model) => true);
//    Gate::define('update', fn(User $user, Invoice $invoice) => $invoice->client->user_id === $user->id);
//    Gate::define('delete', fn(User $user, Invoice $invoice) => $invoice->client->user_id === $user->id);
//    Gate::define('preview', fn(User $user, Invoice $invoice) => $invoice->client->user_id === $user->id);
//    Gate::define('sendToClient', fn(User $user, Invoice $invoice) => $invoice->client->user_id === $user->id);
//});

it('redirects guests from invoice routes', function () {
    $invoice = Invoice::factory()->create();

    get(route('invoices.index'))->assertRedirect(route('login'));
    get(route('invoices.create'))->assertRedirect(route('login'));
    post(route('invoices.store'), [])->assertRedirect(route('login'));
    get(route('invoices.edit', $invoice))->assertRedirect(route('login'));
    put(route('invoices.update', $invoice), [])->assertRedirect(route('login'));
    delete(route('invoices.destroy', $invoice))->assertRedirect(route('login'));
    get(route('invoices.preview', $invoice))->assertRedirect(route('login'));
    post(route('invoices.send-to-client', $invoice), [])->assertRedirect(route('login'));
});

it('lists invoices for the authenticated user with filters applied', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $otherClient = Client::factory()->create();  // different user
    // Create invoices for both clients
    $invoice1 = Invoice::factory()->for($client)->create(['status' => \App\Enums\InvoiceStatusEnum::DRAFT->name]);
    $invoice2 = Invoice::factory()->for($otherClient)->create(['status' => \App\Enums\InvoiceStatusEnum::SENT->name]);
    $response = actingAs($user)->get(route('invoices.index', ['status' => \App\Enums\InvoiceStatusEnum::DRAFT->name]));
    $response->assertStatus(200);
    // Should see only invoice1 (draft belonging to user) and not invoice2
    $response->assertSee($invoice1->invoice_number)
        ->assertDontSee($invoice2->invoice_number);
});

it('shows the invoice creation form with related clients and projects', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $clientA = Client::factory()->for($user)->create(['company_name' => 'ClientA']);
    $clientB = Client::factory()->for($user)->create(['company_name' => 'ClientB']);
    Project::factory()->for($clientA)->create(['name' => 'ProjectA']);
    Project::factory()->for($clientB)->create(['name' => 'ProjectB']);
    // Access create form without specifying client (should list all clients and no projects filtered)
    $response = actingAs($user)->get(route('invoices.create'));
    $response->assertStatus(200);
    // Access create form with a specific client filter (client_id param)
    $response = actingAs($user)->get(route('invoices.create', ['client_id' => $clientA->id]));
    $response->assertStatus(200);
    // Should list projects of ClientA in the projects list
    $response->assertSee('ProjectA')->assertDontSee('ProjectB');
});

it('allows storing a new invoice with valid data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $project = Project::factory()->for($client)->create();
    $invoiceData = [
        'client_id'    => $client->id,
        'project_id'   => $project->id,
        'issued_at'    => now()->format('Y-m-d'),
        'due_at'       => now()->addMonth()->format('Y-m-d'),
        'status'       => \App\Enums\InvoiceStatusEnum::DRAFT->name,
        'client_company' => 'Example Client',
        'client_address_line1' => 'Example Street 1',
        'client_postal_code' => '00000',
        'client_city' => 'Example City',
        'client_country' => 'Example Country',
        'service_period_start' => '2025-01-01',
        'items' => [
            \App\Models\InvoiceItem::factory()->create()->toArray(),
        ]
    ];
    $response = actingAs($user)->post(route('invoices.store'), $invoiceData);
    $response->assertStatus(302);
    $this->assertDatabaseHas('invoices', [
        'client_id' => $client->id,
        'issued_at'    => now()->format('Y-m-d'),
        'due_at'       => now()->addMonth()->format('Y-m-d'),
        'status'       => \App\Enums\InvoiceStatusEnum::DRAFT->name,
        'client_company' => 'Example Client',
        'client_address_line1' => 'Example Street 1',
        'client_postal_code' => '00000',
        'client_city' => 'Example City',
        'client_country' => 'Example Country',
        'service_period_start' => '2025-01-01',
    ]);
});

it('validates input when storing an invoice', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    // Missing client_id and invalid date format
    $response = actingAs($user)->post(route('invoices.store'), [
        'client_id' => null,
        'issued_at' => '01-01-2025',  // wrong format
    ]);
    $response->assertSessionHasErrors(['client_id', 'client_company', 'client_address_line1', 'client_postal_code', 'client_city', 'client_country']);
    expect(Invoice::count())->toBe(0);
});

it('allows viewing an invoice edit form by the owner', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $invoice = Invoice::factory()->for($client)->create(['invoice_number' => 'INV-2002']);
    $response = actingAs($user)->get(route('invoices.edit', $invoice));
    $response->assertStatus(200);
});

it('forbids viewing the edit form of an invoice not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $invoice = Invoice::factory()->for($client)->create();
    $response = actingAs($user2)->get(route('invoices.edit', $invoice));
    $response->assertForbidden();
});

it('allows updating an invoice and dispatches PDF generation job', function () {
    Bus::fake();
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $invoice = Invoice::factory()->for($client)->create(['status' => \App\Enums\InvoiceStatusEnum::DRAFT->name]);
    $updateData = [
        'client_id' => $client->id,
        'issued_at' => $invoice->issued_at,
        'due_at' => $invoice->due_at,
        'items' => [
            \App\Models\InvoiceItem::factory()->for($invoice)->create()->toArray(),
        ],
        'service_period_start' => $invoice->service_period_start,
        'status' => \App\Enums\InvoiceStatusEnum::SENT->name,
        'notes' => 'Updated notes'
    ];
    $response = actingAs($user)->put(route('invoices.update', $invoice), $updateData)
        ->assertSessionDoesntHaveErrors();
    $response->assertStatus(302);
    $invoice->refresh();
    expect($invoice->status)->toBe(\App\Enums\InvoiceStatusEnum::SENT->name)
        ->and($invoice->notes)->toBe('Updated notes');
    // Ensure the GenerateInvoiceJob was dispatched for this invoice
    Bus::assertDispatched(GenerateInvoiceJob::class, function ($job) use ($invoice) {
        return $job->invoice->is($invoice);
    });
});

it('validates input when updating an invoice', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $invoice = Invoice::factory()->for($client)->create(['invoice_number' => 'INV-3003']);
    // Provide an invalid due_at (before issued_at)
    $badData = [
        'issued_at' => '2025-01-10',
        'due_at'    => '2025-01-05'
    ];
    $response = actingAs($user)->put(route('invoices.update', $invoice), $badData);
    $response->assertSessionHasErrors(['due_at']);
    expect($invoice->fresh()->due_at)->not->toBe('2025-01-05');
});

it('forbids updating an invoice not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $invoice = Invoice::factory()->for($client)->create(['status' => \App\Enums\InvoiceStatusEnum::DRAFT->name]);
    $response = actingAs($user2)->put(route('invoices.update', $invoice), ['status' => 'sent']);
    $response->assertForbidden();
    expect($invoice->fresh()->status)->toBe(\App\Enums\InvoiceStatusEnum::DRAFT->name);
});

it('soft deletes an invoice at the owner request', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    $invoice = Invoice::factory()->for($client)->create();
    $response = actingAs($user)->delete(route('invoices.destroy', $invoice));
    $response->assertStatus(200);
    expect($invoice->fresh()->trashed())->toBeTrue();
});

it('forbids deleting an invoice not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $invoice = Invoice::factory()->for($client)->create();
    $response = actingAs($user2)->delete(route('invoices.destroy', $invoice));
    $response->assertForbidden();
    expect($invoice->fresh()->trashed())->toBeFalse();
});

it('allows previewing an invoice PDF for the owner', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create();
    // Create an invoice with a dummy PDF file
    $invoice = Invoice::factory()->for($client)->create(['pdf_path' => 'invoices/test-preview.pdf']);
    // Place a dummy file at the expected storage location
    \Illuminate\Support\Facades\Storage::disk('local')->put('invoices/test-preview.pdf', 'Dummy PDF content');
    $response = actingAs($user)->get(route('invoices.preview', $invoice));
    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/pdf');
});

it('forbids previewing an invoice not owned by the user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $invoice = Invoice::factory()->for($client)->create(['pdf_path' => 'invoices/test2.pdf']);
    // Create dummy file for completeness
    \Illuminate\Support\Facades\Storage::disk('local')->put('invoices/test2.pdf', 'PDF content');
    $response = actingAs($user2)->get(route('invoices.preview', $invoice));
    $response->assertForbidden();
});

it('sends an invoice to client immediately if date is not provided', function () {
    Notification::fake();
    Storage::fake('locale');

    Storage::disk('local')->put('invoice-preview.pdf', '');

    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create(['email' => 'client@example.com']);
    $invoice = Invoice::factory()->for($client)->create(['email_send_scheduled_at' => null, 'pdf_path' => 'invoice-preview.pdf']);
    $response = actingAs($user)->post(route('invoices.send-to-client', $invoice), ['date' => null]);
    $response->assertStatus(200);
    // Notification should be sent to the client's email
    Notification::assertSentOnDemand(SendInvoiceToClientNotification::class, function ($notification, $channels, $notifiable) use ($client, $invoice) {
        return isset($notifiable->routes['mail'])
            && $notifiable->routes['mail'] === $client->email
            && $notification->invoice->is($invoice);
    });
    expect($invoice->fresh()->email_send_scheduled_at)->toBeNull();
});

it('schedules an invoice email when a future date is provided', function () {
    Notification::fake();
    Storage::fake('locale');
    Storage::disk('local')->put('invoice-preview.pdf', '');

    $user = User::factory()->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user)->create(['email' => 'client2@example.com']);
    $invoice = Invoice::factory()->for($client)->create(['email_send_scheduled_at' => null, 'pdf_path' => 'invoice-preview.pdf']);
    $futureDate = now()->addDays(3)->format('Y-m-d H:i:s');
    $response = actingAs($user)->post(route('invoices.send-to-client', $invoice), ['date' => $futureDate]);
    $response->assertStatus(200);
    // No immediate notification sent if date is given
    Notification::assertNothingSent();
    // Invoice should have the scheduled date set
    expect($invoice->fresh()->email_send_scheduled_at)->not->toBeNull()
        ->and($invoice->fresh()->email_send_scheduled_at->format('Y-m-d H:i:s'))->toBe($futureDate);
});

it('forbids sending an invoice email for invoice not owned by user', function () {
    [$user1, $user2] = User::factory()->count(2)->create(['email_verified_at' => now()]);
    $client = Client::factory()->for($user1)->create();
    $invoice = Invoice::factory()->for($client)->create();
    $response = actingAs($user2)->post(route('invoices.send-to-client', $invoice), ['date' => null]);
    $response->assertForbidden();
});
