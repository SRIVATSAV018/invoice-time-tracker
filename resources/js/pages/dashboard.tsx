
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Invoice, SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis
} from 'recharts';
import TableHead from '@/components/table/TableHead';
import TableHeadRow from '@/components/table/TableHeadRow';
import TableHeadCell from '@/components/table/TableHeadCell';
import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBody';
import TableBodyRow from '@/components/table/TableBodyRow';
import TableBodyCell from '@/components/table/TableBodyCell';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type ChartData = Array<{
    name: string;
    uv: number;
}>;

interface Props extends SharedData {
    client_count: number;
    invoice_count: number;
    time_entry_count: number;
    current_projects: number;
    ended_projects: number;
    upcoming_projects: number;
    most_popular_client: string | null;
    income_statistics: ChartData;
    client_creation_history: ChartData;
    invoice_creation_history: ChartData;
    worked_hours_history: ChartData;
    overdue_invoices: Array<Invoice> | undefined;
}

export default function Dashboard() {
    const {
        client_count,
        invoice_count,
        time_entry_count,
        current_projects,
        ended_projects,
        upcoming_projects,
        most_popular_client,
        income_statistics,
        client_creation_history,
        invoice_creation_history,
        worked_hours_history,
        overdue_invoices
    } = usePage<Props>().props;

    const currencyFormatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:col-span-2">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>
                                Einnahmenstatistiken
                            </CardTitle>
                            <CardDescription>
                                Aktuelle Statistiken zu den Einnahmen und Steuern der letzten 30 Tage.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={income_statistics}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <YAxis label={{
                                        value: 'Umsatz (€)',
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: 10
                                    }} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={50}
                                        label={{ value: 'Datum', position: 'insideBottom', offset: -40 }}
                                    />
                                    <RechartsTooltip formatter={(value, name, props) => [
                                        currencyFormatter.format(value),
                                        name
                                    ]} />
                                    <Line strokeWidth={2} type="monotone" dataKey="uv" stroke="#16ca1e" label="name" name="Verdienst" />
                                    <Line strokeWidth={2} type="monotone" dataKey="pv" stroke="#ca0014" label="name" name="Steuern" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4">
                    <Card className="relative">
                        <div className="absolute top-4 left-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm dark:text-white/70">
                                    Erstellte Kunden innerhalb der letzten 30 Tage
                                </p>
                            </div>
                            <h2 className="text-3xl font-bold">
                                {client_count}
                            </h2>
                        </div>

                        <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={client_creation_history}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={0}
                                    label={{ value: 'Datum', position: 'insideBottom', offset: -40 }}
                                />
                                <RechartsTooltip />
                                <Line strokeWidth={2} type="monotone" dataKey="uv" stroke="#351dca" label="name" name="Kunden erstellt" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card className="relative">
                        <div className="absolute top-4 left-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm dark:text-white/70">
                                    Erstellte Rechnungen innerhalb der letzten 30 Tage
                                </p>
                            </div>
                            <h2 className="text-3xl font-bold">
                                {invoice_count}
                            </h2>
                        </div>

                        <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={invoice_creation_history}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={0}
                                    label={{ value: 'Datum', position: 'insideBottom', offset: -40 }}
                                />
                                <RechartsTooltip />
                                <Line strokeWidth={2} type="monotone" dataKey="uv" stroke="#cac70a" label="name" name="Rechnungen erstellt" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card className="relative">
                        <div className="absolute top-4 left-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm dark:text-white/70">
                                    Gearbeitete Stunden innerhalb der letzten 30 Tage
                                </p>
                            </div>
                            <h2 className="text-3xl font-bold">
                                {time_entry_count / 60} Std.
                            </h2>
                        </div>

                        <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={worked_hours_history}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={0}
                                    label={{ value: 'Datum', position: 'insideBottom', offset: -40 }}
                                />
                                <RechartsTooltip />
                                <Line strokeWidth={2} type="monotone" dataKey="uv" stroke="#16ca1e" label="name" name="Gearbeitete Stunden" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </div>
            <div className="p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Überfällige Rechnungen
                        </CardTitle>
                        <CardDescription>
                            Eine Liste aller Rechnungen, die das Fälligkeitsdatum überschritten haben.
                        </CardDescription>
                    </CardHeader>
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <TableHeadCell>
                                    Rechnungsnummer
                                </TableHeadCell>
                                <TableHeadCell>
                                    Kunde
                                </TableHeadCell>
                                <TableHeadCell>
                                    Projekt
                                </TableHeadCell>
                                <TableHeadCell>
                                    Ausgestellt am
                                </TableHeadCell>
                                <TableHeadCell>
                                    Fällig am
                                </TableHeadCell>
                                <TableHeadCell>
                                    Status
                                </TableHeadCell>
                                <TableHeadCell>
                                    <></>
                                </TableHeadCell>
                            </TableHeadRow>
                        </TableHead>
                        <TableBody>
                            <TableBodyRow>
                                {overdue_invoices && overdue_invoices.length === 0 ? <TableBodyCell colSpan={7}>
                                    Keine überfällige Rechnungen vorhanden.
                                </TableBodyCell> : null}
                            </TableBodyRow>
                            {overdue_invoices?.map(invoice => <TableBodyRow key={invoice.id}>
                                <TableBodyCell>
                                    {invoice.invoice_number}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {invoice.client?.company_name}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {invoice.project?.name}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {invoice.issued_at}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {invoice.due_at}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {invoice.status}
                                </TableBodyCell>
                            </TableBodyRow>)}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}
