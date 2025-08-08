<?php

namespace App\Services;

use App\Repositories\InvoiceRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class InvoiceService
{
    public function __construct(
        public InvoiceRepository $invoiceRepository
    )
    {
    }

    public function filterInvoices(string|null $search, string|null $status, int|null $client_id, string|null $withDeleted): LengthAwarePaginator
    {
        return $this->invoiceRepository->filter($search, $status, $client_id, $withDeleted);
    }
}
