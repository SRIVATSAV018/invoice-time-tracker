<?php

use App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login');

Route::get('angebote/{offer}/details', [Controllers\OfferController::class, 'details'])
    ->name('offers.details')
    ->middleware('signed');

Route::post('angebote/{offer}/annehmen', [Controllers\OfferController::class, 'accept'])
    ->name('offers.accept');

Route::get('angebote/{offer}/angenommen', [Controllers\OfferController::class, 'accepted'])
    ->name('offers.accepted');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', Controllers\DashboardController::class)->name('dashboard');

    Route::get('konfiguration', [Controllers\ConfigurationController::class, 'index'])
        ->name('configuration.index');

    Route::post('konfiguration/unternehmensinformationen', [Controllers\ConfigurationController::class, 'storeCompanyInformation'])
        ->name('configuration.submit.company-information');
    Route::post('konfiguration/waehrung-steuern', [Controllers\ConfigurationController::class, 'storeCurrencyAndTaxes'])
        ->name('configuration.submit.currency-taxes');
    Route::post('konfiguration/bankinformationen', [Controllers\ConfigurationController::class, 'storeBankInformation'])
        ->name('configuration.submit.bank-information');
    Route::post('konfiguration/zahlungen', [Controllers\ConfigurationController::class, 'storePayments'])
        ->name('configuration.submit.payments');

    Route::resource('kunden', Controllers\ClientController::class)
        ->names('clients')
        ->parameter('kunden', 'client');
    Route::delete('kunden/{client}/endgueltig-loeschen', [Controllers\ClientController::class, 'forceDestroy'])
        ->name('clients.force-destroy');
    Route::post('kunden/{client}/widerherstellen', [Controllers\ClientController::class, 'restore'])
        ->name('clients.restore');

    // Project routes
    Route::resource('projekte', Controllers\ProjectController::class)
        ->names('projects')
        ->parameter('projekte', 'project');

    Route::delete('projekte/{project}/endgueltig-loeschen', [Controllers\ProjectController::class, 'forceDestroy'])
        ->name('projects.force-destroy');
    Route::post('projekte({project}/widerherstellen', [Controllers\ProjectController::class, 'restore'])
        ->name('projects.restore');

    // Time entry routes
    Route::resource('zeiterfassung', Controllers\TimeEntryController::class)
        ->names('time_entries')
        ->except(['show'])
        ->parameter('zeiterfassung', 'time_entry');

    Route::resource('angebote', Controllers\OfferController::class)
        ->names('offers')
        ->parameter('angebote', 'offer');

    Route::post('angebote/artikel-validieren', [Controllers\OfferController::class, 'validateItem'])
        ->name('offers.validate-item');

    Route::get('angebote/{offer}/vorschau', [Controllers\OfferController::class, 'preview'])
        ->name('offers.preview');

    Route::post('angebote/{offer}/send-email', [Controllers\OfferController::class, 'sendEmail'])
        ->name('offers.send-email');

    Route::resource('rechnungen', Controllers\InvoiceController::class)
        ->names('invoices')
        ->parameter('rechnungen', 'invoice');

    Route::get('rechnungen/{invoice}/vorschau', [Controllers\InvoiceController::class, 'preview'])
        ->name('invoices.preview');

    Route::post('rechnungen/{invoice}/an-kunden-senden', [Controllers\InvoiceController::class, 'sendToClient'])
        ->name('invoices.send-to-client');

    Route::post('rechnungen/{invoice}/pdf-generieren', [Controllers\InvoiceController::class, 'generatePdf'])
        ->name('invoices.generate-pdf');
});

if (config('app.env') === 'local') {
    Route::get('pdf', function (Request $request) {
        $invoice = \App\Models\Invoice::latest()->first();
        $path = storage_path('app/invoice-preview.pdf');

        \Spatie\Browsershot\Browsershot::html(
            view('pdfs.invoice', ['invoice' => $invoice])->render()
        )->format('A4')
            ->showBackground()
            ->margins(5, 15, 5, 15)
            ->save($path);

        return response()->file($path, [
            'Content-Type' => 'application/pdf'
        ]);
    });

    Route::get('reminder', function (Request $request) {
        $invoice = \App\Models\Invoice::latest()->first();
        $path = storage_path('app/reminder-preview.pdf');

        \Spatie\Browsershot\Browsershot::html(
            view('pdfs.reminder', ['invoice' => $invoice])->render()
        )->format('A4')
            ->showBackground()
            ->margins(5, 15, 5, 15)
            ->save($path);

        return response()->file($path, [
            'Content-Type' => 'application/pdf'
        ]);
    });

    Route::get('invoice-pdf', function () {
        return (new \App\Notifications\SendInvoiceToClientNotification(\App\Models\Invoice::first()))
            ->toMail(\App\Models\User::first());
    });

    Route::get('offer-pdf', function (Request $request) {
        $offer = \App\Models\Offer::latest()->first();
        $path = storage_path('app/offer-preview.pdf');

        \Spatie\Browsershot\Browsershot::html(
            view('pdfs.offer', ['offer' => $offer])->render()
        )->format('A4')
            ->showBackground()
            ->margins(5, 15, 5, 15)
            ->save($path);

        return response()->file($path, [
            'Content-Type' => 'application/pdf'
        ]);
    });

    Route::get('offer', function () {
        return (new \App\Notifications\SendOfferToClientNotification(\App\Models\Offer::first()))
            ->toMail(\App\Models\User::first());
    });

    Route::get('offer-confirmation', function () {
        return (new \App\Notifications\OfferAcceptedConfirmationNotification(\App\Models\Offer::latest()->first()))
            ->toMail(\App\Models\User::first());
    });
}

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
