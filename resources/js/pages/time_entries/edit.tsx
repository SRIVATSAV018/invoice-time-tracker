import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { BreadcrumbItem, SharedData, TimeEntry } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import TipTapEditor from '@/components/tip-tap-editor';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, LoaderCircle } from 'lucide-react';
import { format, fromUnixTime } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { FormEventHandler, useEffect, useState } from 'react';


interface Props extends SharedData {
    projects: { [key: number]: string };
    time_entry: TimeEntry;
}

interface Form {
    project_id: number;
    description: string;
    started_at: string;
    ended_at: string;
}

export default function Create() {
    const { projects, time_entry } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Zeiterfassung', href: '/zeiterfassung' },
        { title: 'Bearbeiten', href: '/zeiterfassung/' + time_entry.id },
    ];

    // Inertia Form
    const { data, setData, processing, recentlySuccessful, put, errors } = useForm<Required<Form>>({
        project_id: time_entry.project_id,
        description: time_entry.description,
        started_at: time_entry.started_at,
        ended_at: time_entry.ended_at
    });

    // Lokale State für Datum & Zeit
    const [startDate, setStartDate] = useState<string>(format(time_entry.started_at, 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState<string>(format(time_entry.started_at, 'HH:mm'));
    const [endDate, setEndDate] = useState<string>(format(time_entry.ended_at, 'yyyy-MM-dd'));
    const [endTime, setEndTime] = useState<string>(format(time_entry.ended_at, 'HH:mm'));

    // Kombiniere Datum & Zeit für started_at
    useEffect(() => {
        if (startDate && startTime) {
            setData('started_at', `${startDate}T${startTime}`);
        }
    }, [startDate, startTime]);

    // Kombiniere Datum & Zeit für ended_at
    useEffect(() => {
        if (endDate && endTime) {
            setData('ended_at', `${endDate}T${endTime}`);
        }
    }, [endDate, endTime]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('time_entries.update', time_entry.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Heading title="Zeiterfassung bearbeiten" description="Hier bearbeiten Sie vorhandene Zeiterfassungen, ändern Details und speichern Ihre Anpassungen." />

                <Card>
                    <form onSubmit={submit}>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Projekt-Auswahl */}
                                <div>
                                    <Label>
                                        Projekt <span className="text-red-600">*</span>
                                    </Label>
                                    <Select value={data.project_id?.toString()} onValueChange={e => setData('project_id', Number(e))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Projekt auswählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {Object.keys(projects).map(id => (
                                                    <SelectItem key={id} value={id}>
                                                        {projects[Number(id)]}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.project_id} />
                                </div>

                                {/* Platzhalter für Grid */}
                                <div />

                                {/* Von */}
                                <div>
                                    <Label>Von</Label>
                                    <Input type="datetime-local" value={data.started_at} onChange={(e) => setData('started_at', e.target.value)} />
                                    <InputError message={errors.started_at} />
                                </div>

                                {/* Bis */}
                                <div>
                                    <Label>Bis</Label>
                                    <Input type="datetime-local" value={data.ended_at} onChange={(e) => setData('ended_at', e.target.value)} />
                                    <InputError message={errors.ended_at} />
                                </div>

                                {/* Beschreibung */}
                                <div className="lg:col-span-2">
                                    <Label>Beschreibung</Label>
                                    <TipTapEditor value={data.description} onUpdate={e => setData('description', e)} />
                                    <InputError message={errors.description} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="mt-6">
                            <div className="flex items-center gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : null}
                                    Eintrag aktualisieren
                                </Button>

                                {recentlySuccessful ? <span className="text-green-600">
                                    Aktualisiert.
                                </span> : null}
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
