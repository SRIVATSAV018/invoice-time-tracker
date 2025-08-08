<?php

namespace App\Services;

use App\DataTransferObjects\IncomeStatisticsDTO;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\TimeEntry;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Carbon\Exceptions\InvalidFormatException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class ChartService
{
    public function newClientsPerPeriod(string $start, string $end)
    {
        try {
            Carbon::parse($start);
            Carbon::parse($end);

            $data = Cache::remember("chart.new_clients.{$start}_{$end}", 3600, function () use ($start, $end) {
                return auth()->user()->clients()
                    ->selectRaw("DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS client_count")
                    ->whereBetween('created_at', [$start, $end])
                    ->groupBy('day')
                    ->orderBy('day')
                    ->get();
            });

            $period = CarbonPeriod::create($start, '1 day', $end);

            return collect($period)
                ->mapWithKeys(fn($dt) => [$dt->format('Y-m-d') => 0])
                ->merge($data->pluck('client_count', 'day'))
                ->map(fn($count, $day) => [
                    'name' => Carbon::parse($day)->format('d.m.Y'),
                    'uv' => (int)$count,
                    'amt' => 2100
                ])
                ->values();
        } catch (InvalidFormatException) {
            return [];
        }
    }

    public function newInvoicesPerPeriod(string $start, string $end)
    {
        try {
            Carbon::parse($start);
            Carbon::parse($end);

            $data = Cache::remember("chart.new_invoices.{$start}_{$end}", 3600, function () use ($start, $end) {
                $query = auth()->user()->invoices()->getQuery();

                return $query
                    // Komplett neuen SELECT definieren – nur DAY und COUNT
                    ->selectRaw("
                    DATE_FORMAT(invoices.created_at, '%Y-%m-%d') AS day,
                    COUNT(invoices.id) AS invoice_count
                ")
                    ->whereBetween('invoices.created_at', [$start, $end])
                    ->groupBy('day')
                    ->orderBy('day')
                    ->get();
            });

            $period = CarbonPeriod::create($start, '1 day', $end);

            return collect($period)
                ->mapWithKeys(fn($dt) => [$dt->format('Y-m-d') => 0])
                ->merge($data->pluck('invoice_count', 'day'))
                ->map(fn($count, $day) => [
                    'name' => Carbon::parse($day)->format('d.m.Y'),
                    'uv' => (int)$count,
                    'amt' => 2100
                ])
                ->values();
        } catch (InvalidFormatException) {
            return [];
        }
    }

    public function workedHoursPerPeriod(string $start, string $end)
    {
        try {
            Carbon::parse($start);
            Carbon::parse($end);

            $data = Cache::remember("chart.time_worked.{$start}_{$end}", 3600, function () use ($start, $end) {
                $query = auth()->user()->time_entries()->getQuery();

                return $query
                    ->selectRaw("
                        DATE_FORMAT(time_entries.started_at, '%Y-%m-%d') AS day,
                        COUNT(time_entries.id) AS time_worked_count,
                        SUM(time_entries.duration_hours) AS total_duration_hours
                    ")
                    ->whereDate('time_entries.started_at', '>=', $start)
                    ->whereDate('time_entries.ended_at', '<=', $end)
                    ->groupBy('day')
                    ->orderBy('day')
                    ->get();
            });

            $period = CarbonPeriod::create($start, '1 day', $end);

            return collect($period)
                ->mapWithKeys(fn($dt) => [$dt->format('Y-m-d') => 0])
                ->merge($data->pluck('total_duration_hours', 'day'))
                ->map(fn($total_duration_hours, $day) => [
                    'name' => Carbon::parse($day)->format('d.m.Y'),
                    'uv' => (int)$total_duration_hours / 60,
                    'amt' => 2100
                ])
                ->values();
        } catch (InvalidFormatException) {
            return [];
        }
    }

    public function incomeStatistics()
    {
        $user = Auth::user();
        $start = Carbon::now()->subMonth();
        $end = Carbon::now();

        $data = Cache::remember("chart.income_statistics.$user->id", 3600, function () use ($start, $end, $user) {
            $query = $user->time_entries()->with('project')->getQuery();

            $raw = $query
                ->leftJoin('projects','time_entries.project_id','=','projects.id')
                ->selectRaw("
                    DATE_FORMAT(time_entries.started_at, '%Y-%m-%d') AS day,
                    COUNT(time_entries.id)                              AS time_worked_count,
                    SUM(time_entries.duration_hours)                    AS total_duration_hours,
                    SUM(time_entries.duration_hours / 60 * projects.hourly_rate) AS total_amount,
                    SUM(time_entries.duration_hours / 60 * projects.hourly_rate) * 0.19 AS taxes
                ")
                ->whereDate('time_entries.started_at', '>=', $start)
                ->whereDate('time_entries.started_at', '<=', $end)
                ->groupBy('day')
                ->orderBy('day')
                ->get();

                return $raw->keyBy('day');
        });

        $period = CarbonPeriod::create($start, '1 day', $end);

        return collect($period)
            ->map(fn($dt) => [
                'name' => $dt->format('d.m.Y'),
                'uv'   => isset($data[$dt->format('Y-m-d')])
                    ? (float) $data[$dt->format('Y-m-d')]->total_amount
                    : 0,
                'pv'   => isset($data[$dt->format('Y-m-d')])
                    ? (float) $data[$dt->format('Y-m-d')]->taxes
                    : 0,
                'amt'  => 2100,
            ])
            ->values();
    }
}
