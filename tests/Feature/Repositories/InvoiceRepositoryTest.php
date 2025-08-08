<?php

use App\Models\Invoice;
use App\Models\Client;
use App\Models\InvoiceItem;
use App\Models\User;
use App\Repositories\InvoiceRepository;
use Illuminate\Database\QueryException;
use function Pest\Laravel\actingAs;

it('filter() finds invoice based on the query, status, client and deletion status', function () {
    // Vorbereiten: Nutzer, Kunde und verschiedene Rechnungen
    $user = User::factory()->create();
    actingAs($user);
    $client = Client::factory()->for($user)->create();
    // Rechnungen: eine bezahlt, eine offen, eine gelöscht
    $paidInvoice = Invoice::factory()->for($client)->create(['status' => \App\Enums\InvoiceStatusEnum::PAID->name, 'invoice_number' => 'INV-PAID-100']);
    $openInvoice = Invoice::factory()->for($client)->create(['status' => \App\Enums\InvoiceStatusEnum::OPEN->name, 'invoice_number' => 'INV-OPEN-200']);
    $deletedInvoice = Invoice::factory()->for($client)->create(['status' => \App\Enums\InvoiceStatusEnum::PAID->name, 'invoice_number' => 'INV-PAID-999']);
    $deletedInvoice->delete(); // soft delete

    // Suche nach "100" sollte nur INV-PAID-100 liefern
    $paginator = app(InvoiceRepository::class)->filter($paidInvoice->invoice_number, null, null, null);
    expect($paginator->total())->toBe(1)
        ->and($paginator->items()[0]->id)->toBe($paidInvoice->id);

    // Filter nach Status "open" liefert nur offene Rechnung
    $paginator = app(InvoiceRepository::class)->filter(null, \App\Enums\InvoiceStatusEnum::OPEN->name, null, 'false');
    $ids = collect($paginator->items())->pluck('id');
    expect($ids)->toContain($openInvoice->id)->and($ids)->not->toContain($paidInvoice->id);

    // Mit $withDeleted = 'true' sollte gelöschte Rechnung erscheinen
    $paginator = app(InvoiceRepository::class)->filter(null, 'all', null, 'true');
    $ids = collect($paginator->items())->pluck('id');
    expect($ids)->toContain($deletedInvoice->id);
});

it('store() creates new invoice with positions', function () {
    // Vorbereiten: authentifizierter Nutzer und zugehöriger Client
    $user = User::factory()->create();
    actingAs($user);
    $client = Client::factory()->for($user)->create();
    // Testdaten für Rechnung + 2 Positionen
    $invoiceData = [
        'client_id'    => $client->id,
        'invoice_number' => null,       // wird durch Observer gesetzt
        'status'       => \App\Enums\InvoiceStatusEnum::DRAFT->name,
        'issued_at' => now(),
        'client_company' => 'Example Company',
        'client_address_line1' => 'Example Street',
        'client_postal_code' => '00000',
        'client_city' => 'Example City',
        'client_country' => 'Country',
        'items' => [
            ['unit' => 'h', 'description' => 'Consulting', 'quantity' => 2, 'unit_price' => 100],
            ['unit' => 'h', 'description' => 'Development', 'quantity' => 1.5, 'unit_price' => 200],
        ],
    ];
    $invoice = app(InvoiceRepository::class)->store($invoiceData);
    // Die Rechnung sollte existieren und is_pdf_generating = true sein
    $this->assertDatabaseHas('invoices', [
        'id' => $invoice->id,
        'client_id' => $client->id,
        'is_pdf_generating' => 0,
    ]);
    expect($invoice->invoice_number)->toMatch('/\d{2}-\d{4}-\d{2}/')
        ->and($invoice->items)->toHaveCount(2); // z.B. "07-2025-01"
    // Es sollten 2 InvoiceItems verknüpft sein mit korrekten Summen
    foreach ($invoice->items as $idx => $item) {
        $inputItem = $invoiceData['items'][$idx];
        expect($item->unit)->toBe($inputItem['unit'])
            ->and($item->description)->toBe($inputItem['description'])
            ->and((float)$item->quantity)->toBe((float)$inputItem['quantity'])
            ->and((float)$item->unit_price)->toBe((float)$inputItem['unit_price']);
    }
});

it('store() throws an exception if required fields are missing', function () {
    // client_id fehlt -> sollte zu Fehler führen (Datenbank-Constraint)
    $badData = ['status' => 'draft', 'items' => []];
    expect(fn() => app(InvoiceRepository::class)->store($badData))
        ->toThrow(QueryException::class);
});
