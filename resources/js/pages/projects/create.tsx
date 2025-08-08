import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Client, SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Info, LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projekte',
        href: '/projekte',
    },
    {
        title: 'Neu',
        href: '/projekte/neu',
    },
];

interface CreateProjectForm {
    client_id: number | null;
    name: string;
    description: string;
    hourly_rate: number;
    starts_at: Date | null;
    ends_at: Date | null;
    tech_stack: string;
    auto_generate_invoice: boolean;
    auto_generate_amount: number;
}

interface Props extends SharedData {
    clients: Array<Client>;
}

export default function Create() {
    const { clients } = usePage<Props>().props;

    const { data, setData, processing, recentlySuccessful, errors, post } = useForm<Required<CreateProjectForm>>({
        client_id: null,
        name: '',
        description: '',
        hourly_rate: '',
        starts_at: null,
        ends_at: null,
        tech_stack: '',
        auto_generate_invoice: false,
        auto_generate_amount: 1,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('projects.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Heading title="Projekt erstellen" description="Hier erfassen Sie Basisdaten für Ihr neues Projekt." />

                <Card>
                    <CardHeader>
                        <CardTitle>Projektinformationen</CardTitle>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div>
                                    <Label>
                                        Kunde <span className="text-red-600">*</span>
                                    </Label>
                                    <Select onValueChange={(e) => setData('client_id', Number(e))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Kunden auswählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {clients.map((client) => (
                                                    <SelectItem key={client.company_name} value={client.id.toString()}>
                                                        {client.company_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.client_id} />
                                </div>
                                <div className="hidden lg:block"></div>
                                <div>
                                    <Label>
                                        Projektname <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="hidden lg:block"></div>
                                <div>
                                    <Label>Beschreibung</Label>
                                    <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)}></Textarea>
                                    <InputError message={errors.description} />
                                </div>
                                <div className="hidden lg:block"></div>
                                <div>
                                    <Label>
                                        Stundensatz <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        value={data.hourly_rate}
                                        onChange={(e) => setData('hourly_rate', Number(e.target.value.replace(',', '.')))}
                                    />
                                    <InputError message={errors.hourly_rate} />
                                </div>

                                <div className="hidden lg:block"></div>

                                <div>
                                    <Label>
                                        Startdatum <span className="text-red-600">*</span>
                                    </Label>

                                    <Input value={data.starts_at} type="date" onChange={(e) => setData('starts_at', e.target.value)} />

                                    <InputError message={errors.starts_at} />
                                </div>

                                <div className="hidden lg:block"></div>

                                <div>
                                    <Label>Enddatum</Label>

                                    <Input value={data.ends_at} type="date" onChange={(e) => setData('ends_at', e.target.value)} />

                                    <InputError message={errors.ends_at} />
                                </div>

                                <div className="hidden lg:block"></div>

                                <div>
                                    <Label>Tech-Stack</Label>
                                    <Input
                                        value={data.tech_stack}
                                        onChange={(e) => setData('tech_stack', e.target.value)}
                                        placeholder="z.B. VILT / RILT"
                                    />
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
                                            <Label>Anzahl an Tagen</Label>
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
                            <div className="mt-6 flex items-center gap-2">
                                <Button type="submit" disabled={processing || recentlySuccessful}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : null}
                                    Projekt speichern
                                </Button>

                                {recentlySuccessful ? <div className="text-sm text-green-600">Projekt gespeichert.</div> : null}
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
