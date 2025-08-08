import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginatedResult, Project, SharedData, TimeEntry } from '@/types';
import Heading from '@/components/heading';
import Table from '@/components/table/Table';
import TableHead from '@/components/table/TableHead';
import TableHeadRow from '@/components/table/TableHeadRow';
import TableHeadCell from '@/components/table/TableHeadCell';
import { Link, router, usePage } from '@inertiajs/react';
import TableBody from '@/components/table/TableBody';
import TableBodyRow from '@/components/table/TableBodyRow';
import TableBodyCell from '@/components/table/TableBodyCell';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { format, fromUnixTime } from 'date-fns';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Zeiterfassung',
        href: '/zeiterfassung'
    }
]

interface Props extends SharedData {
    time_entries: PaginatedResult<TimeEntry>;
    projects: Array<Project>;
    filters: {
        search: string;
        project_id: number;
        period_start: string;
        period_end: string;
    };
}

export default function Index() {
    const { time_entries, projects, filters } = usePage<Props>().props;

    const [deleteTimeEntry, setDeleteTimeEntry] = useState<TimeEntry | null>(null);

    const submitDeleteTimeEntry = () => {
        if (!deleteTimeEntry) {
            return;
        }

        router.delete(route('time_entries.destroy', deleteTimeEntry?.id), {
            onSuccess: () => {
                setDeleteTimeEntry(null);
            }
        })
    }

    const [search, setSearch] = useState<string>(filters?.search || '');
    const [projectId, setProjectId] = useState<string | null>(filters?.project_id?.toString() || 'all');
    const [periodStart, setPeriodStart] = useState<string | null>(filters?.period_start || null);
    const [periodEnd, setPeriodEnd] = useState<string | null>(filters?.period_end || null);

    useEffect(() => {
        setTimeout(() => {
            const timeout = setTimeout(() => {
                router.get(
                    route('time_entries.index'),
                    { search, projectId, periodStart, periodEnd },
                    {
                        preserveState: true,
                        replace: true,
                    },
                );
            }, 300);

            return () => clearTimeout(timeout);
        });
    }, [search, projectId, periodStart, periodEnd]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Zeiterfassung" description="Diese Seite bietet eine kompakte Übersicht aller Zeitaufzeichnungen inklusive Filter- und Suchfunktionen." />

                    <Link href={route('time_entries.create')}>
                        <Button className="mb-8">
                            <Plus />
                            <span className="lg:block hidden">Zeit erfassen</span>
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                    <div>
                        <Label>
                            Suche nach Beschreibung
                        </Label>
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nach Beschreibung suchen" />
                    </div>
                    <div>
                        <Label>
                            Projekt
                        </Label>
                        <Select value={projectId?.toString()} onValueChange={(e) => setProjectId(e)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Projekt auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Alle Projekte</SelectItem>
                                    {projects.map((project) => <SelectItem value={project.id.toString()}>{project.name}</SelectItem>)}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                            <Label>
                                Zeitraum von
                            </Label>
                            <Label className="text-left lg:block hidden">
                                Zeitraum bis
                            </Label>
                            <Input type="date" value={periodStart || ''} onChange={(e) => setPeriodStart(e.target.value)} />
                            <Label className="text-left lg:hidden block">
                                Zeitraum bis
                            </Label>
                            <Input type="date" value={periodEnd || ''} onChange={(e) => setPeriodEnd(e.target.value)} />
                        </div>
                    </div>
                </div>

                <Table>
                    <TableHead>
                        <TableHeadRow>
                            <TableHeadCell>
                                Projekt
                            </TableHeadCell>
                            <TableHeadCell>
                                Beschreibung
                            </TableHeadCell>
                            <TableHeadCell>
                                Von
                            </TableHeadCell>
                            <TableHeadCell>
                                Bis
                            </TableHeadCell>
                            <TableHeadCell>
                                Dauer
                            </TableHeadCell>
                            <TableHeadCell>
                                <></>
                            </TableHeadCell>
                        </TableHeadRow>
                    </TableHead>
                    <TableBody>
                        {time_entries.total === 0 ? <TableBodyRow>
                            <TableBodyCell colSpan={6}>
                                Keine Zeiten erfasst.
                            </TableBodyCell>
                        </TableBodyRow> : null}
                        {time_entries.data.map(time => <TableBodyRow key={time.id}>
                            <TableBodyCell>
                                {time.project!.name}
                            </TableBodyCell>
                            <TableBodyCell>
                                <div dangerouslySetInnerHTML={{ __html: time.description }}></div>
                            </TableBodyCell>
                            <TableBodyCell>
                                {time.started_at ? format(time.started_at, 'dd.MM.yyyy HH:mm') : 'Unbekannt'} Uhr
                            </TableBodyCell>
                            <TableBodyCell>
                                {time.ended_at ? format(time.ended_at, 'dd.MM.yyyy HH:mm') : 'Unbekannt'} Uhr
                            </TableBodyCell>
                            <TableBodyCell>
                                {new Intl.NumberFormat('de-DE', { style: 'decimal', maximumFractionDigits: 2 }).format(time.duration_hours / 60)} Std.
                            </TableBodyCell>
                            <TableBodyCell>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild={true}>
                                        <Button variant={'ghost'}>
                                            <MoreHorizontal />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={'end'} className="w-48">
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>
                                                Aktionen
                                            </DropdownMenuLabel>
                                            <Link href={route('time_entries.edit', time.id)}>
                                                <DropdownMenuItem>
                                                    Bearbeiten
                                                </DropdownMenuItem>
                                            </Link>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => setDeleteTimeEntry(time)} variant={'destructive'}>
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
                    {time_entries.links.map((link) => (
                        <Link className="!w-auto" href={link.url ? link.url : '#'}>
                            <Button variant={link.active ? 'outline' : 'ghost'}>
                                <span dangerouslySetInnerHTML={{ __html: link.label }}></span>
                            </Button>
                        </Link>
                    ))}
                </div>

                <AlertDialog open={deleteTimeEntry !== null}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Das Löschen dieses Eintrages hat zur Folge, dass dieser vollständig aus der Datenbank gelöscht wird. Das Widerherstellen ist dann nicht länger möglich.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteTimeEntry(null)}>
                                Abbrechen
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => submitDeleteTimeEntry()}>
                                Eintrag löschen
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
};
