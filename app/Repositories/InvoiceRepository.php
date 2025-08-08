<?php

namespace App\Repositories;

use App\Enums\InvoiceStatusEnum;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InvoiceRepository
{
    public function filter(string|null $search, string|null $status, int|null $client_id, string|null $withDeleted, int $page = 1): LengthAwarePaginator
    {
        $query = Auth::user()
            ->invoices()                       // <<-- hier
            ->with(['client', 'project']);

        // 2. Such-Filter
        $query->when($search, fn(Builder $q) => $q->where('invoice_number', 'like', "%{$search}%")
        );

        // 3. Status-Filter, "all" gleichbedeutend mit keinem Filter
        $query->when($status && $status !== 'all', fn(Builder $q) => $q->where('status', $status)
        );

        // 4. Client-Filter nur, wenn client_id nicht null ist
        $query->when(!is_null($client_id), fn(Builder $q) => $q->where('client_id', $client_id)
        );

        // 5. Gelöschte mitladen
        if ($withDeleted === 'true') {
            $query->withTrashed();
        }

        // 6. Sortieren & Paginieren (page als named arg oder explizit)
        return $query
            ->orderByDesc('created_at')
            ->paginate(
                perPage: 10,
                page: $page
            )
            ->withQueryString();
    }

    public function getStatistics(string $from, string $to): array
    {
        $from = Carbon::parse($from)->startOfDay();
        $to = Carbon::parse($to)->endOfDay();

        $totals = DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->where('invoices.status', InvoiceStatusEnum::PAID->name)
            ->whereBetween('invoices.issued_at', [$from, $to])
            ->selectRaw('SUM(invoice_items.total) as total_net')
            ->selectRaw('SUM(invoice_items.total * 0.19) as total_tax')
            ->first();

        return [
            'total' => (float)($totals->total_net ?? 0),
            'tax_total' => (float)($totals->total_tax ?? 0),
        ];
    }

    public function store(array $data): Invoice
    {
        $invoice = Invoice::create([
            ...$data,
            'is_pdf_generating' => true
        ]);

        foreach ($data['items'] ?? [] as $item) {
            $this->processInvoicePositions($invoice, $item);
        }

        return $invoice;
    }

    public function update(Invoice $invoice, array $data): Invoice
    {
        $invoice->update($data);

        $invoice->items()->delete();

        foreach ($data['items'] ?? [] as $item) {
            $this->processInvoicePositions($invoice, $item);
        }

        return $invoice;
    }

    public function updateQuietly(Invoice $invoice, array $data): Invoice
    {
        $invoice->updateQuietly($data);

        $invoice->items()->delete();

        foreach ($data['items'] ?? [] as $item) {
            $this->processInvoicePositions($invoice, $item);
        }

        return $invoice;
    }

    public function delete(Invoice $invoice): void
    {
        $invoice->delete();
    }

    public function processInvoicePositions(Invoice $invoice, array $item): void
    {
        $invoice->items()->create([
            'unit' => data_get($item, 'unit'),
            'description' => data_get($item, 'description'),
            'quantity' => data_get($item, 'quantity'),
            'unit_price' => data_get($item, 'unit_price'),
            'total' => data_get($item, 'unit_price') * data_get($item, 'quantity')
        ]);
    }
}
