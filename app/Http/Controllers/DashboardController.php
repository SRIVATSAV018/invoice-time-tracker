<?php

namespace App\Http\Controllers;

use App\DataTransferObjects\IncomeStatisticsDTO;
use App\Enums\InvoiceStatusEnum;
use App\Models\Client;
use App\Models\CompanyDetails;
use App\Models\Invoice;
use App\Models\TimeEntry;
use App\Services\ChartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, ChartService $chartService)
    {
        $user = $request->user();

        $user->loadCount([
            'clients',
            'invoices',
            'current_projects',
            'ended_projects',
            'upcoming_projects'])
            ->loadMissing([
                'time_entries',
                'clients.projects'
            ]);

        $totalMinutes = 0;

        $user->time_entries->each(function (TimeEntry $timeEntry) use (&$totalMinutes) {
            $totalMinutes += $timeEntry->duration_hours;
        });

        $mostPopularClient = null;

        $user->clients->loadCount('projects')->filter(function (Client $client) use (&$mostPopularClient) {
            if (is_null($mostPopularClient)) {
                $mostPopularClient = $client;
            } else {
                if ($client->projects_count > $mostPopularClient->projects_count) {
                    $mostPopularClient = $client;
                }
            }
        });

        return Inertia::render('dashboard', [
            'client_count' => $user->clients_count,
            'invoice_count' => $user->invoices_count,
            'time_entry_count' => $totalMinutes,
            'current_projects' => $user->current_projects_count,
            'ended_projects' => $user->ended_projects_count,
            'upcoming_projects' => $user->upcoming_projects_count,
            'most_popular_client' => $mostPopularClient ? "$mostPopularClient?->company_name ({$mostPopularClient?->projects_count})" : null,
            'client_creation_history' => $chartService->newClientsPerPeriod(now()->subMonth(), now()),
            'invoice_creation_history' => $chartService->newInvoicesPerPeriod(now()->subMonth(), now()),
            'worked_hours_history' => $chartService->workedHoursPerPeriod(now()->subMonth(), now()),
            'income_statistics' => $chartService->incomeStatistics(),
            'overdue_invoices' => Inertia::defer(fn () => $request->user()->invoices()
                ->with(['project', 'client'])
                ->where('due_at', '<', now())
                ->orWhere('status', InvoiceStatusEnum::OVERDUE->name)
                ->get())
        ]);
    }
}
