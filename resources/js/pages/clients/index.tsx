import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Client, PaginatedResult, SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { MoreHorizontal, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Table from '@/components/table/Table';
import TableHead from '@/components/table/TableHead';
import TableHeadRow from '@/components/table/TableHeadRow';
import TableHeadCell from '@/components/table/TableHeadCell';
import TableBody from '@/components/table/TableBody';
import TableBodyRow from '@/components/table/TableBodyRow';
import TableBodyCell from '@/components/table/TableBodyCell';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kunden',
        href: '/kunden'
    }
];

interface Props extends SharedData {
    clients: PaginatedResult<Client>;
    filters: {
        search: string | null;
        sort_order: string | null;
        withDeleted: string | null;
        page: number | null;
    };
}

export default function Index() {
    const { clients, filters } = usePage<Props>().props;

    const [search, setSearch] = useState(filters?.search || '');
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || 'asc');
    const [withDeleted, setWithDeleted] = useState(filters?.withDeleted || 'false');

    useEffect(() => {
        setTimeout(() => {
            const timeout = setTimeout(() => {
                router.get(route('clients.index'), { search, sortOrder, withDeleted, page: filters?.page ?? 1 }, {
                    preserveState: true,
                    replace: true
                });
            }, 300); // 300 ms Debounce

            return () => clearTimeout(timeout);
        });
    }, [search, sortOrder, withDeleted]);

    const [isDeleteActionModalOpen, setIsDeleteActionModalOpen] = useState(false);
    const [isForceDeleteActionModalOpen, setIsForceDeleteActionModalOpen] = useState(false);
    const [isRestoreActionModalOpen, setIsRestoreActionModalOpen] = useState(false);

    const submitDeleteClient = (client: Client) => {
        router.delete(route('clients.destroy', client.id), {
            onSuccess: () => setIsDeleteActionModalOpen(false)
        });
    };

    const submitForceDeleteClient = (client: Client) => {
        router.delete(route('clients.force-destroy', client.id), {
            onSuccess: () => setIsForceDeleteActionModalOpen(false)
        });
    };
    const submitRestoreClient = (client: Client) => {
        router.post(route('clients.restore', client.id), {}, {
            onSuccess: () => {
                setIsRestoreActionModalOpen(false);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">

                <div className="mb-4 flex items-center justify-between">
                    <Heading title="Kunden" description="Hier finden Sie alle Kunden aufgelistet mit den wichtigsten Eckdaten auf einen Blick." />
                    <Link href={route('clients.create')}>
                        <Button size="sm" className="mb-8">
                            <PlusIcon />
                            <span className="lg:block hidden">Neuen Kunden hinzufügen</span>
                        </Button>
                    </Link>
                </div>

                <div className="mb-4 lg:flex lg:space-y-0 space-y-4 items-center gap-4">
                    <div className="md:w-2/4 xl:w-1/4">
                        <Label>
                            Nach Kunden suchen
                        </Label>
                        <Input placeholder="Suche nach Kunden..." value={search}
                               onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="md:w-2/4 xl:w-1/4">
                        <Label>
                            Sortierung
                        </Label>
                        <Select value={sortOrder} onValueChange={(e) => setSortOrder(e)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sortierung wählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Aufsteigend</SelectItem>
                                <SelectItem value="desc">Absteigend</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:w-2/4 xl:w-1/4">
                        <Label>
                            Gelöschte Einträge anzeigen?
                        </Label>
                        <Select value={withDeleted} onValueChange={(e) => setWithDeleted(e)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Gelöschte Einträge anzeigen?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Ja</SelectItem>
                                <SelectItem value="false">Nein</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Table>
                    <TableHead>
                        <TableHeadRow>
                            <TableHeadCell>
                                Firmenname
                            </TableHeadCell>
                            <TableHeadCell>
                                Kontaktperson
                            </TableHeadCell>
                            <TableHeadCell>
                                E-Mail Adresse
                            </TableHeadCell>
                            <TableHeadCell>
                                Straße
                            </TableHeadCell>
                            <TableHeadCell>
                                Postleitzahl
                            </TableHeadCell>
                            <TableHeadCell>
                                Stadt
                            </TableHeadCell>
                            <TableHeadCell>
                                Land
                            </TableHeadCell>
                            <TableHeadCell>
                                <></>
                            </TableHeadCell>
                        </TableHeadRow>
                    </TableHead>
                    <TableBody>
                        {clients.total === 0 ? <TableBodyRow>
                            <TableBodyCell colSpan={9}>
                                Keine Kunden vorhanden.
                            </TableBodyCell>
                        </TableBodyRow> : null}
                        {clients.data.map((client) => (<TableBodyRow key={client.id}>
                                <TableBodyCell>
                                    {client.company_name}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {client.contact_person}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {client.email}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {client.address_line1}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {client.postal_code}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {client.city}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {client.country}
                                </TableBodyCell>
                                <TableBodyCell>
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={'ghost'} size={'sm'}>
                                                <MoreHorizontal width={18} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align={'end'} className="w-48">
                                            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                            <Link href={route('clients.show', client.id)}>
                                                <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                                            </Link>
                                            <Link href={route('clients.edit', client.id)}>
                                                <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuSeparator />
                                            {client.deleted_at === null ? (
                                                <DropdownMenuItem onClick={() => setIsDeleteActionModalOpen(true)}
                                                                  className="text-red-600">
                                                    Löschen
                                                </DropdownMenuItem>
                                            ) : null}
                                            {client.deleted_at !== null ? (
                                                <DropdownMenuItem
                                                    onClick={() => setIsForceDeleteActionModalOpen(true)}
                                                    className="text-red-600"
                                                >
                                                    Endgültig Löschen
                                                </DropdownMenuItem>
                                            ) : null}
                                            {client.deleted_at !== null ? (
                                                <DropdownMenuItem onClick={() => setIsRestoreActionModalOpen(true)}>
                                                    Widerherstellen
                                                </DropdownMenuItem>
                                            ) : null}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <AlertDialog open={isDeleteActionModalOpen}
                                                 onOpenChange={(val) => setIsDeleteActionModalOpen(val)}>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Möchten Sie den Kunden {client.company_name} zur Löschung
                                                    vormerken?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Sind Sie sicher, dass Sie den
                                                    Kunden <b>{client.company_name}</b> zur Löschung vormerken
                                                    möchten?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <Button variant={'outline'}
                                                        onClick={() => setIsDeleteActionModalOpen(false)}>
                                                    Abbrechen
                                                </Button>
                                                <Button variant={'destructive'}
                                                        onClick={() => submitDeleteClient(client)}>
                                                    Zur Löschung vormerken
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog
                                        open={isForceDeleteActionModalOpen}
                                        onOpenChange={(val) => setIsForceDeleteActionModalOpen(val)}
                                    >
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Möchten Sie den Kunden {client.company_name} endgültig löschen?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Sind Sie sicher, dass Sie den
                                                    Kunden <b>{client.company_name}</b> endgültig löschen
                                                    möchten? Durch die Löschung werden sämtliche Rechnungen,
                                                    Projekte und Zeiten gelöscht.
                                                    Dieser Vorgang kann nicht rückgängig gemacht werden.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <Button variant={'outline'}
                                                        onClick={() => setIsForceDeleteActionModalOpen(false)}>
                                                    Abbrechen
                                                </Button>
                                                <Button variant={'destructive'}
                                                        onClick={() => submitForceDeleteClient(client)}>
                                                    Endgültig löschen
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog open={isRestoreActionModalOpen}
                                                 onOpenChange={(val) => setIsRestoreActionModalOpen(val)}>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Möchten Sie den Kunden {client.company_name} widerherstellen?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Durch das Widerherstellen des
                                                    Kunden {client.company_name} können Sie Projekte, Rechnungen
                                                    und Zeiten erneut eintragen.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <Button variant={'outline'}
                                                        onClick={() => setIsRestoreActionModalOpen(false)}>
                                                    Abbrechen
                                                </Button>
                                                <Button onClick={() => submitRestoreClient(client)}>
                                                    Widerherstellen
                                                </Button>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableBodyCell>
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="mt-6 flex items-center justify-center gap-2">
                    {clients.links.map((link) => (
                        <Link className="!w-auto" href={link.url ? link.url : '#'}>
                            <Button variant={link.active ? 'outline' : 'ghost'}>
                                <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
