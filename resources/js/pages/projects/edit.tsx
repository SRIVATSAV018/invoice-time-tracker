import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Client, Project, SharedData } from '@/types';
import Heading from '@/components/heading';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import { useForm, usePage } from '@inertiajs/react';
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Button } from '@/components/ui/button';
import { CalendarIcon, LoaderCircle } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormEventHandler } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateProjectForm {
    client_id: number;
    name: string;
    description: string;
    hourly_rate: number;
    starts_at: string | null;
    ends_at: string | null;
    tech_stack: string;
    auto_generate_invoice: boolean;
    auto_generate_amount: number;
}

interface Props extends SharedData {
    clients: Array<Client>;
    project: Project;
}

export default function Create() {
    const { clients, project } = usePage<Props>().props;

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

    const { data, setData, processing, recentlySuccessful, errors, put } = useForm<Required<CreateProjectForm>>({
        client_id: project.client_id,
        name: project.name,
        description: project.description ?? '',
        hourly_rate: project.hourly_rate,
        starts_at: project.starts_at,
        ends_at: project.ends_at,
        tech_stack: project.tech_stack,
        auto_generate_invoice: project.auto_generate_invoice,
        auto_generate_amount: project.auto_generate_amount
    })

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('projects.update', project.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Heading title="Projekt bearbeiten" description="Hier bearbeiten Sie Projektdetails, ändern Verantwortliche und speichern Ihre Anpassungen." />

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Projektinformationen
                        </CardTitle>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <Label>
                                        Kunde <span className="text-red-600">*</span>
                                    </Label>
                                    <Select value={data.client_id.toString()} onValueChange={e => setData('client_id', Number(e))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Kunden auswählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {clients.map(client => <SelectItem key={client.company_name} value={client.id.toString()}>
                                                    {client.company_name}
                                                </SelectItem>)}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.client_id} />
                                </div>
                                <div className="lg:block hidden"></div>
                                <div>
                                    <Label>
                                        Projektname <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="lg:block hidden"></div>
                                <div>
                                    <Label>
                                        Beschreibung
                                    </Label>
                                    <Textarea value={data.description} onChange={e => setData('description', e.target.value)}>

                                    </Textarea>
                                    <InputError message={errors.description} />
                                </div>
                                <div className="lg:block hidden"></div>
                                <div>
                                    <Label>
                                        Stundensatz <span className="text-red-600">*</span>
                                    </Label>
                                    <Input type="number"
                                           value={data.hourly_rate}
                                           onChange={(e) => setData('hourly_rate', Number(e.target.value.replace(',', '.')))}
                                    />
                                    <InputError message={errors.hourly_rate} />
                                </div>

                                <div className="lg:block hidden"></div>

                                <div>
                                    <Label>
                                        Startdatum <span className="text-red-600">*</span>
                                    </Label>

                                    <Input value={data.starts_at} type="date" onChange={(e) => setData('starts_at', e.target.value)} />

                                    <InputError message={errors.starts_at} />
                                </div>

                                <div className="lg:block hidden"></div>

                                <div>
                                    <Label>
                                        Enddatum
                                    </Label>

                                    <Input value={data.ends_at} type="date" onChange={(e) => setData('ends_at', e.target.value)} />

                                    <InputError message={errors.ends_at} />
                                </div>

                                <div className="lg:block hidden"></div>

                                <div>
                                    <Label>
                                        Tech-Stack
                                    </Label>
                                    <Input value={data.tech_stack}
                                           onChange={e => setData('tech_stack', e.target.value)}
                                           placeholder="z.B. VILT / RILT" />
                                    <InputError message={errors.tech_stack} />
                                </div>

                                <div className="my-4 lg:col-span-2">
                                    <hr />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={data.auto_generate_invoice}
                                        onClick={() => setData('auto_generate_invoice', !data.auto_generate_invoice)}
                                        id="auto_generate_invoice"
                                    />
                                    <Label htmlFor="auto_generate_invoice">Sollen automatisch Rechnungen für dieses Projekt generiert werden?</Label>
                                </div>

                                {data.auto_generate_invoice ? (
                                    <>
                                        <div className="hidden lg:block"></div>
                                        <div>
                                            <Label>Anzahl der Tage</Label>
                                            <Input
                                                value={data.auto_generate_amount}
                                                type="number"
                                                onChange={(e) => setData('auto_generate_amount', Number(e.target.value))}
                                            />
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </CardContent>

                        <CardFooter>
                            <div className="flex items-center gap-2 mt-6">
                                <Button type="submit" disabled={processing || recentlySuccessful}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : null}
                                    Projekt aktualisieren
                                </Button>

                                {recentlySuccessful ? <div className="text-green-600 text-sm">
                                    Projekt aktualisiert.
                                </div>: null}
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
