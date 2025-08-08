@php
    $settings = $offer->client->user->settings;
@endphp

    <!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $offer->offer_number }}_{{ $offer->client_company }}</title>
    <link rel="stylesheet" href="{{ public_path('css/pdf-output.css') }}">

    <style>
        body {
            font-family: Arial;
            font-size: 0.85rem;
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

<div
    style="display: flex; align-items: center; justify-content: end; gap: 2rem; margin-bottom: 1.5rem; padding-right: 10px;">
    <img src="{{ storage_path('app/public/' . $settings->logo) }}" alt="{{ config('app.name') }}" style="width: 100px">
</div>

<small class="text-muted leading-normal">
    {{ $settings->name }} - {{ $settings->address_line1 }}
    - {{ $settings->postal_code }} {{ $settings->city }} - {{ $settings->country }}
</small>

<div style="display: flex; align-items: start; justify-content: space-between;">
    <div>
        <p class="leading-normal">
            {{ $offer->client_company }}
        </p>
        <p class="leading-normal">
            {{ $offer->client_street }}
        </p>
        <p class="leading-normal">
            {{ $offer->client_postal_code }} {{ $offer->client_city }}
        </p>
        <p class="leading-normal">
            {{ $offer->client_country }}
        </p>
    </div>

    <div style="padding-right: 10px">
        <p class="leading-normal" style="text-align: right;">
            Tel.: {{ $settings->phone }}
        </p>
        <p class="leading-normal" style="text-align: right;">
            {{ $settings->email }}
        </p>
        <p class="leading-normal" style="text-align: right;">
            {{ $settings->website }}
        </p>
        @if($settings->tax_number && $settings->subject_to_sales_tax)
            <p class="leading-normal" style="text-align: right;">
                USt-IdNr.: {{ $settings->tax_number }}
            </p>
        @endif
    </div>
</div>
<div style="display: flex; align-items: center; justify-content: end">
    <p style="line-height: 1.4; margin-top: 2.5rem;  font-size: 0.65rem; text-align: right; padding-right: 10px">
        Datum: {{ $offer->created_at->format('d.m.Y') }} <br>
        Gültig bis: {{ $offer->valid_until->format('d.m.Y')  }} <br>
        Leistungszeitraum: {{ $offer->service_period_start->format('d.m.Y') }}
        - {{ $offer->service_period_end->format('d.m.Y') }}

    </p>
</div>

<h3>
    Angebot {{ $offer->offer_number }}
</h3>

<h3 style="font-weight: normal; margin-bottom: 0.5rem;">
    Gesamtübersicht
</h3>

<div style="border: 1px solid oklch(0.928 0.006 264.531); border-radius: calc(0.625rem - 2px); margin-right: 8px">
    <table style="width: 100%">
        <thead>
        <tr>
            <th style="padding: 0.5rem; font-weight: 600; font-size: 0.85rem; text-align: left; border-bottom: 1px solid oklch(0.928 0.006 264.531);">
                Position
            </th>
            <th style="padding: 0.5rem; font-weight: 600; font-size: 0.85rem; text-align: left; border-bottom: 1px solid oklch(0.928 0.006 264.531);">
                Anzahl
            </th>
            <th style="padding: 0.5rem; font-weight: 600; font-size: 0.85rem; text-align: left; border-bottom: 1px solid oklch(0.928 0.006 264.531);">
                Einheit
            </th>
            <th style="padding: 0.5rem; font-weight: 600; font-size: 0.85rem; text-align: left; border-bottom: 1px solid oklch(0.928 0.006 264.531);">
                Bezeichnung
            </th>
            <th style="padding: 0.5rem; font-weight: 600; font-size: 0.85rem; text-align: right; border-bottom: 1px solid oklch(0.928 0.006 264.531);">
                Einzelpreis
            </th>
            <th style="padding: 0.5rem; font-weight: 600; font-size: 0.85rem; text-align: right; border-bottom: 1px solid oklch(0.928 0.006 264.531);">
                Gesamtpreis
            </th>
        </tr>
        </thead>
        <tbody>
        @foreach($offer->items as $key => $item)
            <tr>
                <td style="padding: 0.2rem 0.5rem; text-align: center; border-bottom:1px solid oklch(0.928 0.006 264.531);">{{ $key + 1 }}</td>
                <td style="padding: 0.2rem 0.5rem; border-bottom:1px solid oklch(0.928 0.006 264.531);">{{ $item->quantity }}</td>
                <td style="padding: 0.2rem 0.5rem; border-bottom:1px solid oklch(0.928 0.006 264.531);">
                    {{ $item->unit }}
                </td>
                <td style="padding: 0.2rem 0.5rem; border-bottom:1px solid oklch(0.928 0.006 264.531);">
                    {!! $item->description !!}
                </td>
                <td style="padding: 0.2rem 0.5rem; text-align: right; border-bottom:1px solid oklch(0.928 0.006 264.531);">
                    {{ number_format($item->unit_price, 2, ',', '.') }} €
                </td>
                <td style="padding: 0.2rem 0.5rem; text-align: right; border-bottom:1px solid oklch(0.928 0.006 264.531);">
                    {{ number_format($item->unit_price * $item->quantity, 2, ',', '.') }} €
                </td>
            </tr>
        @endforeach
        <tr>
            <td colspan="4" style="padding: 0.5rem;"></td>
            <td style="padding: 0.5rem; text-align: right; font-weight: 600;">
                Zwischensumme
            </td>
            <td style="padding: 0.5rem; text-align: right;">
                {{ number_format($offer->net_total, 2, ',', '.') }} €
            </td>
        </tr>
        @if($settings->subject_to_sales_tax)
            <tr>
                <td colspan="4" style="padding: 0.5rem"></td>
                <td style="padding: 0.5rem; text-align: right; font-weight: 600;">
                    MwSt. ({{ $offer->tax_rate }}%)
                </td>
                <td style="padding: 0.5rem; text-align: right;">
                    {{ number_format($offer->tax_total, 2, ',', '.') }} €
                </td>
            </tr>
        @endif
        <tr>
            <td colspan="4" style="padding: 0.5rem"></td>
            <td style="padding: 0.5rem; text-align: right; font-weight: 600;">
                Gesamtsumme
            </td>
            <td style="padding: 0.5rem; text-align: right;">
                {{ number_format($offer->gross_total, 2, ',', '.') }} €
            </td>
        </tr>
        </tbody>
    </table>
</div>

<div style="margin-top: 1.5rem;">
    <b style="font-size: .85rem">Projekt:</b> <br>
    {!! $offer->project_description !!}
</div>

<div style="margin-top: 1.5rem;">
    <b style="font-size: .85rem">Lieferzeitraum:</b> <br>
    Projektbeginn: {{ $offer->service_period_start->format('d.m.Y') }} <br>
    Geplante Fertigstellung: {{ $offer->service_period_end->format('d.m.Y') }}
</div>

<div style="margin-top: 1.5rem;">
    <b style="font-size: .85rem">Zahlungsbedingungen:</b> <br>
    Zahlbar innerhalb von {{ $settings?->payment_goal }} Tagen nach Abnahme des Projekts. <br>
    Bankverbindung und Zahlungsdetals folgen auf der Rechnung.
</div>

<div style="margin-top: 1.5rem;">
    <b style="font-size: .85rem">Zusätzliche Hinweise:</b> <br>
    <ul style="list-style: disc;">
        <li>
            Dieses Angebot ist gültig bis zum {{ $offer->valid_until->format('d.m.Y') }}
        </li>
        <li>
            Änderungen oder Erweiterungen des Leistungsumfangs werden separat angeboten.
        </li>
        <li>
            Die Übergabe der finalen Dateien erfolgt nach vollständiger Zahlung.
        </li>
    </ul>
</div>

<div style="margin-top: 1.5rem;">
    Dieses Angebot gilt als angenommen, sobald Sie dies schriftlich oder per E-Mail bestätigen bzw. auf den
    Annahme-Button klicken.
</div>
<div style="margin-top: 2rem; margin-bottom: 3rem;">
    Ich danke Ihnen für Ihre Anfrage und freue mich auf die Zusammenarbeit.
</div>

</body>
</html>
