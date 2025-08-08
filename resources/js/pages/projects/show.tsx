import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import { BreadcrumbItem, Project, SharedData } from '@/types';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format, fromUnixTime } from 'date-fns';


interface Props extends SharedData {
    project: Project;
    income_last_30_days: number;
    spent_time_last_30_days: number;
}

export default function Show() {
    const { project, income_last_30_days, spent_time_last_30_days } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Projekte',
            href: '/projekte'
        },
        {
            title: project.name,
            href: '/projekte/' + project.id
        }
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Heading title={project.name} description="Auf dieser Seite finden Sie alle wesentlichen Details und Konfigurations-Optionen Ihres Projekts." />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-4 gap-4">
                    <Card>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Einnahmen - letzte 30 Tage
                            </p>
                            <h3 className="text-2xl font-bold">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(income_last_30_days)}
                            </h3>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Verbrachte Stunden - letzte 30 Tage
                            </p>
                            <h3 className="text-2xl font-bold">
                                {spent_time_last_30_days / 60} Std.
                            </h3>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>
                                Projektinformationen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 auto-rows-min">
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Projektname
                                    </p>
                                    <p>
                                        {project.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Beschreibung
                                    </p>
                                    <p dangerouslySetInnerHTML={{ __html: project.description ?? '' }}></p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Stundensatz
                                    </p>
                                    <p>
                                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(project.hourly_rate)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Startdatum
                                    </p>
                                    <p>
                                        {project.starts_at}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Enddatum
                                    </p>
                                    <p>
                                        {project.ends_at ?? '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Tech-Stack
                                    </p>
                                    <p>
                                        {project.tech_stack ?? '-'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground text-sm">
                                        Hinzugefügt am
                                    </p>
                                    <p>
                                        {project.created_at} Uhr
                                    </p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-8">
                        <Card className="lg:col-span-8">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        Zeiterfassung
                                    </CardTitle>
                                    {project.deleted_at ? null : <div>
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
                                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-50/5 rounded-t-md">
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Beschreibung
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Von
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Bis
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">
                                                Dauer
                                            </th>
                                            <th className="font-semibold text-sm text-left px-2 h-10 border-b whitespace-nowrap">

                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {project.time_entries!.length === 0 ? <tr className="hover:bg-muted/50">
                                            <td colSpan={8} className="p-2 text-sm whitespace-nowrap align-middle h-[48px] italic">
                                                Keine Zeiten gefunden.
                                            </td>
                                        </tr> : null}
                                        {project.time_entries!.map(time => <tr key={time.id} className="hover:bg-muted/50">
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]" dangerouslySetInnerHTML={{ __html: time.description }}></td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {format(time.started_at, 'dd.MM.yyyy HH:mm')}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {format(time.ended_at, 'dd.MM.yyyy HH:mm')}
                                            </td>
                                            <td className="p-2 text-sm whitespace-nowrap align-middle h-[48px]">
                                                {time.duration_hours / 60} Std.
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
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            Löschen
                                                        </DropdownMenuItem>
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
