import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Invoice, InvoiceStatusEnum, InvoiceStatusLabels, PaginatedResult, SharedData } from '@/types';
import Heading from '@/components/heading';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChartArea, LoaderCircle, MoreHorizontal, Plus } from 'lucide-react';
import Table from '@/components/table/Table';
import TableHead from '@/components/table/TableHead';
import TableHeadRow from '@/components/table/TableHeadRow';
import TableHeadCell from '@/components/table/TableHeadCell';
import TableBody from '@/components/table/TableBody';
import TableBodyRow from '@/components/table/TableBodyRow';
import TableBodyCell from '@/components/table/TableBodyCell';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/use-currency';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rechnungen',
        href: '/rechnungen'
    }
]

interface Props extends SharedData {
    invoices: PaginatedResult<Invoice>;
    filters: {
        search: string;
        client_id: number|null;
        status: 'all' | InvoiceStatusEnum;
        withDeleted: "true" | "false";
        page: number;
    };
    statistics?: {
        total: number;
        tax_total: number;
    }
}

export default function Index() {
    const currency = useCurrency();
    const { invoices, filters, statistics } = usePage<Props>().props;

    const [search, setSearch] = useState(filters?.search || '');
    const [clientId, setClientId] = useState(filters?.client_id || null);
    const [status, setStatus] = useState(filters?.status || null);
    const [processing, setProcessing] = useState(false);
    const [withDeleted, setWithDeleted] = useState(filters?.withDeleted || 'false');

    useEffect(() => {
        setTimeout(() => {
            const timeout = setTimeout(() => {
                router.get(route('invoices.index'), { search, clientId, status, withDeleted, page: filters?.page ?? 1 }, {
                    preserveState: true,
                    replace: true,
                    onStart: () => {
                        setProcessing(true)
                    },
                    onFinish: () => {
                        setProcessing(false)
                    }
                });
            }, 300); // 300 ms Debounce

            return () => clearTimeout(timeout);
        });
    }, [search, clientId, status, withDeleted]);

    const [isViewingStatistics, setIsViewingStatistics] = useState(false);

    const [statisticsFrom, setStatisticsFrom] = useState('');
    const [statisticsTo, setStatisticsTo] = useState('');

    useEffect(() => {
        if (statisticsFrom.length === 0 || statisticsTo.length === 0) {
            return;
        }

        router.reload({
            only: ['statistics'],
            data: {
                statisticsFrom,
                statisticsTo
            }
        })
    }, [statisticsTo, statisticsFrom]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <Heading title="Rechnungen" description="Hier finden Sie eine kompakte Gesamtübersicht aller Rechnungen mit ihren wichtigsten Eckdaten." />

                    <div className="flex items-center gap-2 mb-8">
                        <Button size="sm" onClick={() => setIsViewingStatistics(true)}>
                            <ChartArea />
                            <span className="lg:block hidden">
                                Statistiken einsehen
                            </span>
                        </Button>
                        <Link href={route('invoices.create')}>
                            <Button size="sm">
                                <Plus />
                                <span className="lg:block hidden">Rechnung hinzufügen</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <Label>
                            Suche nach Rechnungen
                        </Label>
                        <Input value={search}
                               onChange={e => setSearch(e.target.value)}
                               placeholder="Nach Rechnungen suchen..." />
                    </div>
                    <div>
                        <Label>
                            Nach Status filtern
                        </Label>
                        <Select value={!status ? 'all' : status}
                                disabled={processing}
                                onValueChange={(e) => setStatus(e)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Alle</SelectItem>
                                    <SelectItem value={InvoiceStatusEnum.DRAFT}>{InvoiceStatusLabels[InvoiceStatusEnum.DRAFT]}</SelectItem>
                                    <SelectItem value={InvoiceStatusEnum.OPEN}>{InvoiceStatusLabels[InvoiceStatusEnum.OPEN]}</SelectItem>
                                    <SelectItem value={InvoiceStatusEnum.UNDER_REVIEW}>{InvoiceStatusLabels[InvoiceStatusEnum.UNDER_REVIEW]}</SelectItem>
                                    <SelectItem value={InvoiceStatusEnum.APPROVED}>{InvoiceStatusLabels[InvoiceStatusEnum.APPROVED]}</SelectItem>
                                    <SelectItem value={InvoiceStatusEnum.SENT}>{InvoiceStatusLabels[InvoiceStatusEnum.SENT]}</SelectItem>
                                    <SelectItem value={InvoiceStatusEnum.PAID}>{InvoiceStatusLabels[InvoiceStatusEnum.PAID]}</SelectItem>
                                    <SelectItem value={InvoiceStatusEnum.OVERDUE}>{InvoiceStatusLabels[InvoiceStatusEnum.OVERDUE]}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>
                            Nach Kunde filtern
                        </Label>
                        <Select value={clientId ? clientId.toString() : 'all'}
                                disabled={processing}
                                onValueChange={(value) => setClientId(Number(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Kunde auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Alle</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>
                            Gelöschte Rechnungen einbeziehen?
                        </Label>
                        <Select value={withDeleted ? withDeleted : 'false'}
                                disabled={processing}
                                onValueChange={(value) => setWithDeleted(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Gelöschte Rechnungen auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="true">Ja</SelectItem>
                                    <SelectItem value="false">Nein</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

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
                        {invoices.total === 0 ? <TableBodyRow>
                            <TableBodyCell colSpan={7}>
                                Keine Rechnungen vorhanden.
                            </TableBodyCell>
                        </TableBodyRow> : null}
                        {invoices.data.map(invoice => <TableBodyRow key={invoice.id}>
                            <TableBodyCell className={invoice.deleted_at ? 'bg-yellow-500/5' : ''}>
                                {invoice.invoice_number}
                            </TableBodyCell>
                            <TableBodyCell className={invoice.deleted_at ? 'bg-yellow-500/5' : ''}>
                                <Link href={route('clients.show', invoice.client?.id)}>
                                    {invoice.client?.company_name}
                                </Link>
                            </TableBodyCell>
                            <TableBodyCell className={invoice.deleted_at ? 'bg-yellow-500/5' : ''}>
                                {invoice.project_id ? <Link href={route('projects.show', invoice.project_id)}>
                                    {invoice.project?.name ?? '-'}
                                </Link>: 'Bitte wählen Sie ein Projekt'}
                            </TableBodyCell>
                            <TableBodyCell className={invoice.deleted_at ? 'bg-yellow-500/5' : ''}>
                                {format(invoice.issued_at, 'dd.MM.yyyy')}
                            </TableBodyCell>
                            <TableBodyCell className={invoice.deleted_at ? 'bg-yellow-500/5' : ''}>
                                {invoice.due_at ? format(invoice.due_at, 'dd.MM.yyyy') : '-'}
                            </TableBodyCell>
                            <TableBodyCell className={invoice.deleted_at ? 'bg-yellow-500/5' : ''}>
                                <Badge>
                                    {invoice.is_pdf_generating ? <LoaderCircle className="animate-spin" /> : ''}
                                    {invoice.is_pdf_generating ? 'PDF wird generiert...' : InvoiceStatusLabels[invoice.status]}
                                </Badge>
                            </TableBodyCell>
                            <TableBodyCell className={invoice.deleted_at ? 'bg-yellow-500/5' : ''}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild={true}>
                                        <Button variant="ghost">
                                            <MoreHorizontal />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>
                                                Aktionen
                                            </DropdownMenuLabel>
                                            {invoice.does_pdf_exist ? <a href={invoice.pdf_url} target="_blank">
                                                <DropdownMenuItem>
                                                    PDF anschauen
                                                </DropdownMenuItem>
                                            </a> : null}
                                            <Link href={route('invoices.edit', invoice.id)}>
                                                <DropdownMenuItem>
                                                    Bearbeiten
                                                </DropdownMenuItem>
                                            </Link>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem variant="destructive">
                                                Löschen
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableBodyCell>
                        </TableBodyRow>)}
                    </TableBody>
                </Table>

                <div className="mt-6 flex items-center justify-center gap-2">
                    {invoices.links.map((link, index) => (
                        <Link key={`link_${index}`} className="!w-auto" href={link.url ? link.url : '#'}>
                            <Button variant={link.active ? 'outline' : 'ghost'}>
                                <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                            </Button>
                        </Link>
                    ))}
                </div>

                <AlertDialog open={isViewingStatistics}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Statistiken über Einnahmen und Steuern einsehen
                            </AlertDialogTitle>
                        </AlertDialogHeader>

                        <div>
                            <Label>
                                Bitte wählen Sie den Zeitraum aus.
                            </Label>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                <Input type="date" value={statisticsFrom} onChange={(e) => setStatisticsFrom(e.target.value)} />
                                <Input type="date" value={statisticsTo} onChange={(e) => setStatisticsTo(e.target.value)} />
                            </div>

                            {!statistics ? <div className="mt-4 space-y-4">
                                <Skeleton className="w-full h-20" />
                                <Skeleton className="w-full h-20" />
                                <Skeleton className="w-full h-20" />
                            </div> : <div className="mt-4 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Gesamtverdienst
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <h2 className="text-3xl font-bold">
                                            {currency(statistics.total)}
                                        </h2>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Voraussichtliche zu zahlende Steuern
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <h2 className="text-3xl font-bold">
                                            {currency(statistics.tax_total)}
                                        </h2>
                                    </CardContent>
                                </Card>
                            </div>}

                            <AlertDialogFooter className="mt-4">
                                <Button variant="outline" onClick={() => setIsViewingStatistics(false)}>
                                    Schließen
                                </Button>
                            </AlertDialogFooter>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
