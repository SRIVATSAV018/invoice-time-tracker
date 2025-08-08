import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Client, GenderEnum, SalutationLabels, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Plus } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface Props extends SharedData {
    client: Client;
}

export default function Show() {
    const { client } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Kunden',
            href: '/kunden',
        },
        {
            title: client.company_name,
            href: '/kunden/' + client.id,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Heading title={`Details über ${client.company_name} ansehen`} description="Diese Seite zeigt Ihnen alle relevanten Informationen und Historie zum ausgewählten Kunden." />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>
                                    Steckbrief
                                </CardTitle>

                                {client.deleted_at ? null : <Link href={route('clients.edit', client.id)}>
                                    <Button variant="ghost">
                                        <Pencil />
                                    </Button>
                                </Link>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-semibold text-sm">Firmenname</p>
                                    <p>
                                        {client.company_name}
                                    </p>
                                </div>
                                <div className="lg:col-span-2">
                                    <hr/>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Adresszeile 1</p>
                                    <p>
                                        {client.address_line1}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Adresszeile 2</p>
                                    <p>
                                        {client.address_line2 ?? '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Postleitzahl</p>
                                    <p>
                                        {client.postal_code}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Stadt / Ort</p>
                                    <p>
                                        {client.city}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Land</p>
                                    <p>
                                        {client.country}
                                    </p>
                                </div>

                                <div className="lg:col-span-2">
                                    <hr/>
                                </div>

                                <div>
                                    <p className="font-semibold text-sm">Ansprechpartner</p>
                                    <p>
                                        {client.contact_person_gender === GenderEnum.MALE ? 'Herr' : 'Frau'} {SalutationLabels[client.contact_person_salutation]} {client.contact_person ?? '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold text-sm">E-Mail Adresse</p>
                                    <p>
                                        {client.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold text-sm">Telefon</p>
                                    <p>
                                        {client.phone}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-semibold text-sm">Steuernummer</p>
                                    <p>
                                        {client.tax_number}
                                    </p>
                                </div>

                                <div className="lg:col-span-2">
                                    <hr/>
                                </div>

                                <div>
                                    <p className="font-semibold text-sm">Notizen</p>
                                    <p>
                                        {client.notes ?? '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="lg:col-span-8 space-y-4">
                        <Card className="lg:col-span-8">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        Projekte
                                    </CardTitle>

                                    {client.deleted_at ? null : <div>
                                        <Button size="sm">
                                            <Plus />
                                            Projekt hinzufügen
                                        </Button>
                                    </div>}
                                </div>
                            </CardHeader>

                            <div className="border">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr className="hover:bg-gray-50 rounded-t-md">
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Name
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Beschreibung
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Stundensatz
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Startdatum
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Enddatum
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Tech-Stack
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">

                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {client.projects!.length === 0 ? <tr className="hover:bg-muted/50">
                                            <td colSpan={8} className="p-2 text-sm whitespace-nowrap align-middle h-[48px] italic">
                                                Keine Projekte gefunden.
                                            </td>
                                        </tr> : null}
                                        {client.projects!.map(project => <tr key={project.id} className="hover:bg-muted/50">
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {project.name}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {project.description}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {project.hourly_rate}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {project.starts_at}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {project.ends_at}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {project.tech_stack}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant={'ghost'} size={'sm'}>
                                                            <MoreHorizontal width={18} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align={'end'} className="w-48">
                                                        <DropdownMenuLabel>
                                                            Aktionen
                                                        </DropdownMenuLabel>
                                                        <Link href={route('projects.show', project.id)}>
                                                            <DropdownMenuItem>
                                                                Details anzeigen
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        <Link href={route('projects.edit', project.id)}>
                                                            <DropdownMenuItem>
                                                                Bearbeiten
                                                            </DropdownMenuItem>
                                                        </Link>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Card>
                        <Card className="lg:col-span-8">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        Rechnungen
                                    </CardTitle>
                                    {client.deleted_at ? null : <div>
                                        <Button size="sm">
                                            <Plus />
                                            Rechnung hinzufügen
                                        </Button>
                                    </div>}
                                </div>
                            </CardHeader>

                            <div className="border">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr className="hover:bg-gray-50 rounded-t-md">
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Rechnungsnummer
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Projektname
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Augestellt am
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Fällig bis
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Status
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Kunde - Firmanamen
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Kunde - Adresse
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Kunde - Postleitzahl
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Kunde - Stadt
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Kunde - Land
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">

                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {client.invoices!.length === 0 ? <tr className="hover:bg-muted/50">
                                            <td colSpan={8} className="p-2 text-sm whitespace-nowrap align-middle h-[48px] italic">
                                                Keine Rechnungen gefunden.
                                            </td>
                                        </tr> : null}
                                        {client.invoices!.map(invoice => <tr key={invoice.id} className="hover:bg-muted/50">
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {invoice.invoice_number}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {invoice.project?.name}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {invoice.issued_at}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {invoice.due_at}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {invoice.status}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {invoice.client_company}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {invoice.client_address_line1}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {invoice.client_postal_code}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {invoice.client_city}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {invoice.client_country}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant={'ghost'} size={'sm'}>
                                                            <MoreHorizontal width={18} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align={'end'} className="w-48">
                                                        <DropdownMenuLabel>
                                                            Aktionen
                                                        </DropdownMenuLabel>
                                                        <Link href={route('invoices.edit', invoice.id)}>
                                                            <DropdownMenuItem>
                                                                Bearbeiten
                                                            </DropdownMenuItem>
                                                        </Link>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Card>
                        <Card className="lg:col-span-8">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        Zeiterfassung
                                    </CardTitle>
                                    {client.deleted_at ? null : <div>
                                        <Button size="sm">
                                            <Plus />
                                            Zeit hinzufügen
                                        </Button>
                                    </div>}
                                </div>
                            </CardHeader>

                            <div className="border">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr className="hover:bg-gray-50 rounded-t-md">
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Projekt
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Beschreibung
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Beginn der Aufzeichnung
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Ende der Aufzeichnung
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Dauer
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">

                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {client.time_entries!.length === 0 ? <tr className="hover:bg-muted/50">
                                            <td colSpan={8} className="p-2 text-sm whitespace-nowrap align-middle h-[48px] italic">
                                                Keine Zeiten gefunden.
                                            </td>
                                        </tr> : null}
                                        {client.time_entries!.map(time => <tr key={time.id} className="hover:bg-muted/50">
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {time.project?.name}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                <p dangerouslySetInnerHTML={{ __html: time.description ?? '' }}></p>
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {format(time.started_at, 'dd.MM.yyyy HH:ii')}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {format(time.started_at, 'dd.MM.yyyy HH:ii')}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {time.duration_hours / 60}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant={'ghost'} size={'sm'}>
                                                            <MoreHorizontal width={18} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align={'end'} className="w-48">
                                                        <DropdownMenuLabel>
                                                            Aktionen
                                                        </DropdownMenuLabel>
                                                        <Link href={route('time_entries.edit', time.id)}>
                                                            <DropdownMenuItem>
                                                                Bearbeiten
                                                            </DropdownMenuItem>
                                                        </Link>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
