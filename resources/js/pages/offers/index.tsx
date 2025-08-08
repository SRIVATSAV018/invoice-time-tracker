import Heading from '@/components/heading';
import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBody';
import TableBodyCell from '@/components/table/TableBodyCell';
import TableBodyRow from '@/components/table/TableBodyRow';
import TableHead from '@/components/table/TableHead';
import TableHeadCell from '@/components/table/TableHeadCell';
import TableHeadRow from '@/components/table/TableHeadRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Client, Offer, OfferStatusEnum, OfferStatusLabels, PaginatedResult } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Angebote',
        href: '/angebote',
    },
];

interface Form {
    query: string;
    client_id: string;
    project_id: string;
    status: OfferStatusEnum;
    withDeleted: 'yes' | 'no';
}

export default function Index({
    offers,
    filters,
    clients,
    projects,
}: {
    offers: PaginatedResult<Offer>;
    filters: {
        query: string;
        client_id: string;
        project_id: string;
        status: OfferStatusEnum;
        withDeleted: 'yes' | 'no';
    };
    clients: Array<Client>,
    projects: { [key: number]: string }
}) {
    const { data, setData } = useForm<Required<Form>>({
        query: filters?.query ?? '',
        client_id: filters?.client_id ?? 'all',
        project_id: filters?.project_id ?? 'all',
        status: filters?.status ?? 'all',
        withDeleted: filters?.withDeleted ?? 'no'
    });

    useEffect(() => {
        router.reload({
            data: {
                query: data.query,
                client_id: data.client_id,
                project_id: data.project_id,
                status: data.status,
                withDeleted: data.withDeleted
            },
        });
    }, [data.query, data.client_id, data.project_id, data.status, data.withDeleted]);

    const [isDeletingOffer, setIsDeletingOffer] = useState<Offer | null>(null);

    const deleteOffer = () => {
        if (!isDeletingOffer) {
            return;
        }
        router.delete(route('offers.destroy', isDeletingOffer?.id), {
            onSuccess: () => {
                setIsDeletingOffer(null);
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Angebote" />

            <div className="p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Angebote"
                        description="Hier finden Sie eine kompakte Gesamtübersicht aller Angebote mit ihren wichtigsten Eckdaten."
                    />

                    <Link href="/angebote/neu">
                        <Button size="sm" className="mb-8">
                            <Plus />
                            <span className="hidden lg:block">Neues Angebot erstellen</span>
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div>
                        <Label>Suche</Label>
                        <Input value={data.query} onChange={(e) => setData('query', e.target.value)} placeholder="Suche nach Angebotsnummern" />
                    </div>
                    <div>
                        <Label>Kunde</Label>
                        <Select value={data.client_id} onValueChange={(value) => setData('client_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Kunde auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Alle</SelectItem>
                                    {clients.map(client => <SelectItem key={client.id} value={client.id}>{client.company_name}</SelectItem>)}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Projekt</Label>
                        <Select value={data.project_id} onValueChange={(value) => setData('project_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Projekt auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Alle</SelectItem>
                                    {projects ? Object.keys(projects).map(key => <SelectItem key={key} value={key}>{projects[key]}</SelectItem>) : null}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Status</Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Alle</SelectItem>
                                    <SelectItem value={OfferStatusEnum.DRAFT}>Entwurf</SelectItem>
                                    <SelectItem value={OfferStatusEnum.SENT}>Versendet</SelectItem>
                                    <SelectItem value={OfferStatusEnum.ACCEPTED}>Akzeptiert</SelectItem>
                                    <SelectItem value={OfferStatusEnum.REJECTED}>Abgelehnt</SelectItem>
                                    <SelectItem value={OfferStatusEnum.EXPIRED}>Abgelaufen</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Gelöschte Einträge einbeziehen</Label>
                        <Select value={data.withDeleted} onValueChange={(value) => setData('withDeleted', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="yes">Ja</SelectItem>
                                    <SelectItem value="no">Nein</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-4">
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <TableHeadCell>Angebotsnummer</TableHeadCell>
                                <TableHeadCell>Kunde</TableHeadCell>
                                <TableHeadCell>Projekt</TableHeadCell>
                                <TableHeadCell>Status</TableHeadCell>
                                <TableHeadCell>Gültig bis</TableHeadCell>
                                <TableHeadCell>Versendet am</TableHeadCell>
                                <TableHeadCell>Angenommen am</TableHeadCell>
                                <TableHeadCell>
                                    <></>
                                </TableHeadCell>
                            </TableHeadRow>
                        </TableHead>
                        <TableBody>
                            {offers.total === 0 ? <TableBodyRow>
                                <TableBodyCell colSpan={8}>
                                    Keine Angebote vorhanden.
                                </TableBodyCell>
                            </TableBodyRow> : null}
                            {offers.data.map((offer) => (
                                <TableBodyRow key={offer.id}>
                                    <TableBodyCell>{offer.offer_number}</TableBodyCell>
                                    <TableBodyCell>{offer.client?.company_name}</TableBodyCell>
                                    <TableBodyCell>{offer.project?.name}</TableBodyCell>
                                    <TableBodyCell>
                                        {OfferStatusLabels[offer.status]}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {format(offer.valid_until, 'dd.MM.yyyy')}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {offer.sent_at ? format(offer.sent_at, 'dd.MM.yyyy HH:mm') : '-'}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        {offer.accepted_at ? format(offer.accepted_at, 'dd.MM.yyyy HH:mm') : '-'}
                                    </TableBodyCell>
                                    <TableBodyCell>
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild={true}>
                                                <Button size="sm" variant="ghost">
                                                    <MoreHorizontal />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuLabel>
                                                        Aktionen
                                                    </DropdownMenuLabel>
                                                    <Link href={route('offers.edit', offer.id)}>
                                                        <DropdownMenuItem>
                                                            Bearbeiten
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem variant="destructive" onClick={() => setIsDeletingOffer(offer)}>
                                                        Löschen
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableBodyCell>
                                </TableBodyRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-6 flex items-center justify-center gap-2">
                        {offers.links.map((link, index) => (
                            <Link key={`link_${index}`} className="!w-auto" href={link.url ? link.url : '#'}>
                                <Button variant={link.active ? 'outline' : 'ghost'}>
                                    <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                                </Button>
                            </Link>
                        ))}
                    </div>

                    <AlertDialog open={isDeletingOffer !== null}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Sind Sie sicher, dass Sie das Angebot {isDeletingOffer?.offer_number} löschen möchten?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Das Löschen des Angebotes hat zur Folge, dass Sie keine weiteren Änderungen an diesem durchführen können. Wenn Sie sicher
                                    sind, dass Sie dieses Angebot löschen möchten, klicken Sie bitte auf den Button "Jetzt Löschen". Sie haben jederzeit die
                                    Möglichkeit, das Angebot widerherzustellen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <Button onClick={() => setIsDeletingOffer(null)} size="sm" variant="outline">
                                    Abbrechen
                                </Button>
                                <Button onClick={() => deleteOffer()} variant="destructive">
                                    Jetzt Löschen
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AppLayout>
    );
}
