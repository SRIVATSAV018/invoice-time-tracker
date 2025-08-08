import Heading from '@/components/heading';
import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBody';
import TableBodyCell from '@/components/table/TableBodyCell';
import TableBodyRow from '@/components/table/TableBodyRow';
import TableHead from '@/components/table/TableHead';
import TableHeadCell from '@/components/table/TableHeadCell';
import TableHeadRow from '@/components/table/TableHeadRow';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginatedResult, Project, SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props extends SharedData {
    projects: PaginatedResult<Project>;
    filters: {
        search: string | null;
        sort_order: string | null;
        withDeleted: string | null;
        projectStatus: string | null;
        page: number | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projekte',
        href: '/projekte',
    },
];

export default function Index() {
    const { projects, filters } = usePage<Props>().props;

    const [search, setSearch] = useState(filters?.search || '');
    const [sortOrder, setSortOrder] = useState(filters?.sort_order || 'asc');
    const [withDeleted, setWithDeleted] = useState(filters?.withDeleted || 'false');
    const [projectStatus, setProjectStatus] = useState(filters?.projectStatus || 'all');

    useEffect(() => {
        setTimeout(() => {
            const timeout = setTimeout(() => {
                router.get(
                    route('projects.index'),
                    { search, sortOrder, withDeleted, projectStatus, page: filters?.page ?? 1 },
                    {
                        preserveState: true,
                        replace: true,
                    },
                );
            }, 300);

            return () => clearTimeout(timeout);
        });
    }, [search, sortOrder, withDeleted, projectStatus]);

    const [deleteProject, setDeleteProject] = useState<Project | null>(null);
    const [forceDeleteProject, setForceDeleteProject] = useState<Project | null>(null);
    const [restoreProject, setRestoreProject] = useState<Project | null>(null);

    const submitDeleteProject = () => {
        if (deleteProject === null) {
            return;
        }

        router.delete(route('projects.destroy', deleteProject.id), {
            onSuccess: () => {
                setDeleteProject(null);
            },
        });
    };

    const submitForceDeleteProject = () => {
        if (forceDeleteProject === null) {
            return;
        }

        router.delete(route('projects.force-destroy', forceDeleteProject.id), {
            onSuccess: () => {
                setForceDeleteProject(null);
            },
        });
    };

    const submitRestoreProject = () => {
        if (restoreProject === null) {
            return;
        }

        router.post(
            route('projects.restore', restoreProject.id),
            {},
            {
                onSuccess: () => {
                    setRestoreProject(null);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <Heading
                        title="Projekte"
                        description="Hier finden Sie eine kompakte Gesamtübersicht aller Projekte mit ihren wichtigsten Eckdaten."
                    />

                    <Link href={route('projects.create')} className="mb-8">
                        <Button size={'sm'}>
                            <Plus />
                            <span className="hidden lg:block">Neues Projekt erstellen</span>
                        </Button>
                    </Link>
                </div>

                <div className="mb-4 lg:flex lg:space-y-0 space-y-4 items-center gap-4">
                    <div className="md:w-2/4 xl:w-1/4">
                        <Label>Nach Projekten suchen</Label>
                        <Input placeholder="Suche nach Projekten..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="md:w-2/4 xl:w-1/4">
                        <Label>Sortierung</Label>
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
                        <Label>Gelöschte Einträge anzeigen?</Label>
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
                    <div className="md:w-2/4 xl:w-1/4">
                        <Label>Projekt-Status</Label>
                        <Select value={projectStatus} onValueChange={(e) => setProjectStatus(e)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Gelöschte Einträge anzeigen?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Alle</SelectItem>
                                <SelectItem value="upcoming">Kommende Projekte</SelectItem>
                                <SelectItem value="finished">Beendete Projekte</SelectItem>
                                <SelectItem value="wip">Laufende Projekte</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Table>
                    <TableHead>
                        <TableHeadRow>
                            <TableHeadCell>Kunde</TableHeadCell>
                            <TableHeadCell>Projektname</TableHeadCell>
                            <TableHeadCell>Stundensatz</TableHeadCell>
                            <TableHeadCell>Startdatum</TableHeadCell>
                            <TableHeadCell>Enddatum</TableHeadCell>
                            <TableHeadCell>Tech Stack</TableHeadCell>
                            <TableHeadCell>
                                <></>
                            </TableHeadCell>
                        </TableHeadRow>
                    </TableHead>
                    <TableBody>
                        {projects.total === 0 ? (
                            <TableBodyRow>
                                <TableBodyCell colSpan={7}>Keine Projekte vorhanden</TableBodyCell>
                            </TableBodyRow>
                        ) : null}
                        {projects.data.map((project) => (
                            <TableBodyRow
                                key={project.id}
                                className={`${project.deleted_at !== null ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : ''}`}
                            >
                                <TableBodyCell>
                                    <Link href={route('clients.show', project.client!.id)}>{project.client!.company_name}</Link>
                                </TableBodyCell>
                                <TableBodyCell>{project.name}</TableBodyCell>
                                <TableBodyCell>
                                    {new Intl.NumberFormat('de-DE', {
                                        style: 'currency',
                                        currency: 'EUR',
                                    }).format(project.hourly_rate)}
                                </TableBodyCell>
                                <TableBodyCell>{project.starts_at}</TableBodyCell>
                                <TableBodyCell>{project.ends_at ?? '-'}</TableBodyCell>
                                <TableBodyCell>{project.tech_stack ?? '-'}</TableBodyCell>
                                <TableBodyCell>
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={'ghost'}>
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuGroup>
                                                <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                                                <Link href={route('projects.show', project.id)}>
                                                    <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                                                </Link>
                                                <Link href={route('projects.edit', project.id)}>
                                                    <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                                                </Link>
                                            </DropdownMenuGroup>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuGroup>
                                                {project.deleted_at === null ? (
                                                    <DropdownMenuItem onClick={() => setDeleteProject(project)} className="text-red-600">
                                                        Löschen
                                                    </DropdownMenuItem>
                                                ) : null}
                                                {project.deleted_at !== null ? (
                                                    <DropdownMenuItem onClick={() => setForceDeleteProject(project)} className="text-red-600">
                                                        Endgültig Löschen
                                                    </DropdownMenuItem>
                                                ) : null}
                                                {project.deleted_at !== null ? (
                                                    <DropdownMenuItem onClick={() => setRestoreProject(project)}>Widerherstellen</DropdownMenuItem>
                                                ) : null}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableBodyCell>
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="mt-6 flex items-center justify-center gap-2">
                    {projects.links.map((project) => (
                        <Link className="!w-auto" href={project.url ? project.url : '#'}>
                            <Button variant={project.active ? 'outline' : 'ghost'}>
                                <span dangerouslySetInnerHTML={{ __html: project.label }}></span>
                            </Button>
                        </Link>
                    ))}
                </div>

                <AlertDialog open={deleteProject !== null}>
                    <AlertDialogTrigger asChild></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Sind Sie sicher, dass Sie das Projekt {deleteProject?.name} zur Löschung vormerken lassen möchten?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Wird das Projekt {deleteProject?.name} zur Löschung vorgemerkt, ist das Bearbeiten des Projektes, sowie das Hinzufügen
                                von Zeiten nicht länger möglich. Sie können das Projekt jederzeit wieder widerherstellen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteProject(null)}>Abbrechen</AlertDialogCancel>
                            <Button variant="destructive" onClick={() => submitDeleteProject()}>
                                Zur Löschung vormerken
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={forceDeleteProject !== null}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Sind Sie sicher, dass Sie das Projekt {forceDeleteProject?.name} endgültig löschen möchten?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Wird das Projekt {forceDeleteProject?.name} zur Löschung vorgemerkt, ist das Bearbeiten des Projektes, sowie das
                                Hinzufügen von Zeiten nicht länger möglich. Sie können das Projekt jederzeit wieder widerherstellen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button variant="outline" onClick={() => setForceDeleteProject(null)}>
                                Abbrechen
                            </Button>
                            <Button variant="destructive" onClick={() => submitForceDeleteProject()}>
                                Endgültig löschen
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <AlertDialog open={restoreProject !== null}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Sind Sie sicher, dass Sie das Projekt {restoreProject?.name} widerherstellen möchten?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Durch das Widerherstellen des Projektes {restoreProject?.name} sind Sie wieder in der Lage, dieses zu bearbeiten oder
                                Zeiten für das Projekte hinzuzufügen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button variant="outline" onClick={() => setRestoreProject(null)}>
                                Abbrechen
                            </Button>
                            <Button onClick={() => submitRestoreProject()}>Projekt widerherstellen</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
