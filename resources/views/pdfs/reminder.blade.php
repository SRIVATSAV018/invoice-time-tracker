@php
    $companyDetails = \App\Models\CompanyDetails::currentUser($invoice->client->user_id)->first();
    $prices = \App\Models\Invoice::calculate($invoice);
@endphp

    <!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $invoice->issued_at->format('Y-m-d') }}_RE-{{ $invoice->invoice_number }}_{{ $invoice->client_company }}</title>
    <link rel="stylesheet" href="{{ public_path('css/pdf-output.css') }}">

    <style>
        body {
            font-family: Arial;
            font-size: 12px;
            width: 100%;
            line-height: 1.4;
        }

        .font-bold {
            font-weight: 800;
        }

        .leading-normal {
            line-height: 0.5;
        }

        .text-sm {
            font-size: 0.85rem;
        }

        .text-muted {
            color: rgb(131, 131, 131);
        }

        .invoice-footer {
            width: 100%;
            border-top: 1px solid #eaeaea;
            border-bottom: 1px solid #eaeaea;
            font-size: 0.7rem;
        }
    </style>
</head>
<body>

<div style="display: flex; align-items: center; justify-content: end; gap: 2rem; margin-bottom: 1.5rem; padding-right: 10px;">
    <img src="{{ storage_path('app/public/' . $companyDetails->logo_path) }}" alt="{{ config('app.name') }}" style="width: 100px">
</div>

<div style="display: flex; align-items: start; justify-content: space-between;">
    <div>
        <small class="text-muted leading-normal" style="text-decoration: underline;">
            {{ $companyDetails->name }} - {{ $companyDetails->address_line1 }}
            - {{ $companyDetails->postal_code }} {{ $companyDetails->city }} - {{ $companyDetails->country }}
        </small>
        <div>
            <p class="leading-normal">
                {{ $invoice->client_company }}
            </p>
            <p class="leading-normal">
                {{ $invoice->client->contact_person }}
            </p>
            <p class="leading-normal">
                {{ $invoice->client_address_line1 }}
            </p>
            <p class="leading-normal">
                {{ $invoice->client_postal_code }} {{ $invoice->client_city }}
            </p>
        </div>
    </div>

    <div style="padding-right: 10px;">
        <p class="leading-normal" style="font-weight: 600">
            {{ $companyDetails->name }}
        </p>
        <p class="leading-normal">
            {{ $companyDetails->address_line1 }}
        </p>
        <p class="leading-normal">
            {{ $companyDetails->postal_code }} {{ $companyDetails->city }}
        </p>
        <p class="leading-normal">
            {{ $companyDetails->country }}
        </p>
        <br>
        <p class="leading-normal">
            E-Mail: {{ $companyDetails->email }}
        </p>
        @if($companyDetails->phone)
            <p class="leading-normal">
                Telefonnummer: {{ $companyDetails->phone }}
            </p>
        @endif

        <br>
        <p class="leading-normal" style="padding-right: 10px;">
            Datum: {{ now()->format('d.m.Y') }}
        </p>
        <p class="leading-normal" style="padding-right: 10px;">
            Rechnungsnr.: {{ $invoice->invoice_number }}
        </p>
    </div>
</div>

<h3>
    1. Mahnung zur Rechnung {{ $invoice->invoice_number }} vom {{ $invoice->issued_at->format('d.m.Y') }}
</h3>

<p>
    Sehr geehrte(r) {{ $invoice->client->contact_person }},
</p>

<p>
    trotz unserer Rechnung vom {{ $invoice->issued_at->format('d.m.Y') }} über {{ number_format($prices['total'], 2, ',', '.') }} €, zahlbar bis spätestens {{ $invoice->due_at->format('d.m.Y') }}, konnten wir bis heute keinen Zahlungseingang feststellen.
</p>

<p>
    Wir bitten Sie hiermit, den offenen Betrag in Höhe von {{ number_format($prices['total'], 2, ',', '.') }} € bis spätestens {{ $invoice->due_at->addDays(7)->format('d.m.Y') }} auf das folgende Konto zu überweisen:
</p>

<p>
    Kontoinhaber: {{ $companyDetails->name }} <br>
    Bankname: {{ $companyDetails->bank_name ?? 'Unbekannt' }} <br>
    IBAN: {{ $companyDetails->iban }} <br>
    BIC: {{ $companyDetails->bic }} <br>
    Verwendungszweck: Ihre Rechnungsnummer ({{ $invoice->invoice_number }})
</p>

<p>
    Sollte der Betrag nicht fristgerecht eingehen, behalten wir uns vor, Verzugszinsen gemäß § 288 BGB sowie weitere Mahn- oder Inkassokosten geltend zu machen.
</p>

<p>
    Bitte betrachten Sie dieses Schreiben als letzte Gelegenheit, die Angelegenheiten außergerichtlich zu klären.
</p>

<p>
    Für Rückfragen stehen wir ihnen gerne zur Verfügung.
</p>

<p>
    Mit freundlichen Grüßen, <br>
    {{ $companyDetails->name }}
</p>
</body>
</html>
