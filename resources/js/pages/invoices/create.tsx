import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Client, InvoiceStatusEnum, Project, SharedData } from '@/types';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, LoaderCircle, Plus, XCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import DatePicker from '@/components/date-picker';
import Table from '@/components/table/Table';
import TableHead from '@/components/table/TableHead';
import TableHeadRow from '@/components/table/TableHeadRow';
import TableHeadCell from '@/components/table/TableHeadCell';
import TableBody from '@/components/table/TableBody';
import TableBodyRow from '@/components/table/TableBodyRow';
import TableBodyCell from '@/components/table/TableBodyCell';
import TipTapEditor from '@/components/tip-tap-editor';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rechnungen',
        href: '/rechnungen',
    },
    {
        title: 'Neu',
        href: '/rechnungen/neu',
    },
];

interface Form {
    client_id: number | null;
    project_id: number | null;
    issued_at: Date | null;
    due_at: Date | null;
    status: InvoiceStatusEnum;
    client_company: string;
    client_address_line1: string;
    client_postal_code: string;
    client_city: string;
    client_country: string;
    notes: string;
    items: Array<InvoiceItem>;
    service_period_start: string;
    service_period_end: string;
}

interface InvoiceItem {
    unit: string;
    description: string;
    quantity: number;
    unit_price: number;
}

interface AddingArticleForm {
    unit: string;
    description: string;
    quantity: number;
    unit_price: number;
}

interface Props extends SharedData {
    clients: Array<Client>;
    projects: Array<Project>;
}

export default function Create() {
    const { clients, projects } = usePage<Props>().props;

    const { data, setData, errors, post, processing, recentlySuccessful } = useForm<Required<Form>>({
        client_id: null,
        project_id: null,
        issued_at: null,
        due_at: null,
        status: InvoiceStatusEnum.DRAFT,
        client_company: '',
        client_address_line1: '',
        client_postal_code: '',
        client_city: '',
        client_country: '',
        notes: '',
        items: [],
        service_period_start: '',
        service_period_end: ''
    });

    const client_id = data.client_id;

    const [applyClientData, setApplyClientData] = useState<Client | null>(null);

    useEffect(() => {
        const client = getClientById(client_id);

        if (!client) {
            return;
        }

        router.reload({
            data: { client_id },
            only: ['projects'],
        });

        setApplyClientData(client);
    }, [client_id]);

    const getClientById = (client_id: number | null) => {
        if (!client_id) {
            return null;
        }

        for (let i = 0; i < clients.length; i++) {
            if (clients[i].id === client_id) {
                return clients[i];
            }
        }

        return null;
    };

    const cancelSelection = () => {
        setApplyClientData(null);
        setData('client_id', null);
        setData('project_id', null);
    };

    const applySelection = () => {
        if (!applyClientData) {
            return;
        }

        setData('client_company', applyClientData?.company_name);
        setData('client_address_line1', applyClientData?.address_line1);
        setData('client_postal_code', applyClientData?.postal_code);
        setData('client_city', applyClientData?.city);
        setData('client_country', applyClientData?.country);
        setData('project_id', null);

        setApplyClientData(null);
    };

    const [isAddingArticleModal, setIsAddingArticleModal] = useState(false);

    const { data: addData, setData: setAddData } = useForm<Required<AddingArticleForm>>({
        quantity: 1,
        unit: '',
        unit_price: '',
        description: '',
    });

    const submitAddArticle = () => {
        setData('items', [
            ...data.items,
            {
                quantity: addData.quantity,
                unit: addData.unit,
                unit_price: addData.unit_price,
                description: addData.description,
                total: addData.total,
            },
        ]);

        setIsAddingArticleModal(false);
    };

    const [prices, setPrices] = useState({
        netTotal: 0,
        tax: 0,
        total: 0,
    });

    useEffect(() => {
        const items = data.items;
        let netTotal: number = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item) {
                netTotal += Number(item.unit_price) * item.quantity;
            }
        }

        setPrices({
            netTotal,
            tax: netTotal * 0.19,
            total: netTotal + netTotal * 0.19,
        });
    }, [data.items]);

    const removeItem = (item: InvoiceItem) => {
        const index = data.items.indexOf(item);

        if (index <= -1) {
            return;
        }

        setData(
            'items',
            data.items.filter((i) => i !== item),
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('invoices.store'), {
            preserveScroll: true,
            onSuccess: () => {

            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Rechnung erstellen" description="Hier erfassen Sie Basisdaten für Ihre Rechnung." />

                    <Link className="mb-8" href="/rechnungen">
                        <Button>
                            <ChevronLeft />
                            <span className="hidden lg:block">Zurück</span>
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basisinformationen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => submit(e)} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div>
                                    <Label>Rechnungsnummer</Label>
                                    <Input disabled={true} placeholder="Die Rechnungsnummer wird während des Erstellvorgangs generiert." />
                                </div>
                                <div>
                                    <Label>
                                        Status <span className="text-red-600">*</span>
                                    </Label>
                                    <Select value={data.status} onValueChange={(e) => setData('status', e)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status auswählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value={InvoiceStatusEnum.DRAFT}>Entwurf</SelectItem>
                                                <SelectItem value={InvoiceStatusEnum.OPEN}>Offen</SelectItem>
                                                <SelectItem value={InvoiceStatusEnum.APPROVED}>Genehmigt</SelectItem>
                                                <SelectItem value={InvoiceStatusEnum.SENT}>Versendet</SelectItem>
                                                <SelectItem value={InvoiceStatusEnum.PAID}>Bezahlt</SelectItem>
                                                <SelectItem value={InvoiceStatusEnum.OVERDUE}>Überfällig</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                                <div>
                                    <Label>
                                        Kunde <span className="text-red-600">*</span>
                                    </Label>
                                    <Select value={data.client_id?.toString() ?? ''} onValueChange={(e) => setData('client_id', Number(e))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Kunden auswählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {clients.map((client) => (
                                                    <SelectItem key={client.id} value={client.id.toString()}>
                                                        {client.company_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.client_id} />
                                </div>
                                <div>
                                    <Label>Projekt <span className="text-red-600">*</span></Label>
                                    <Select
                                        value={data.project_id ? data.project_id.toString() : ''}
                                        onValueChange={(e) => setData('project_id', Number(e))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Projekt auswählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {projects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id.toString()}>
                                                        {project.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>

                                    <InputError message={errors.project_id} />
                                </div>
                                <div>
                                    <Label>
                                        Ausgestellt am <span className="text-red-600">*</span>
                                    </Label>

                                    <Input type="date" value={data.issued_at} onChange={(e) => setData('issued_at', e.target.value)} />
                                    <InputError message={errors.issued_at} />
                                </div>
                                <div>
                                    <Label>
                                        Fällig am <span className="text-red-600">*</span>
                                    </Label>

                                    <Input type="date" value={data.due_at} onChange={(e) => setData('due_at', e.target.value)} />
                                    <InputError message={errors.due_at} />
                                </div>

                                <div>
                                    <Label>
                                        Leitungszeitraum von <span className="text-red-600">*</span>
                                    </Label>

                                    <Input
                                        type="date"
                                        value={data.service_period_start}
                                        onChange={(e) => setData('service_period_start', e.target.value)}
                                    />
                                    <InputError message={errors.service_period_start} />
                                </div>
                                <div>
                                    <Label>
                                        Leistungszeitraum bis
                                    </Label>

                                    <Input
                                        type="date"
                                        value={data.service_period_end}
                                        onChange={(e) => setData('service_period_end', e.target.value)}
                                    />
                                    <InputError message={errors.service_period_end} />
                                </div>

                                <div className="my-6 lg:col-span-2">
                                    <hr />
                                </div>

                                <div className="rounded-lg bg-blue-500/10 p-4">
                                    <h4 className="font-semibold">Information</h4>
                                    <p className="text-sm">
                                        Kundendaten werden beim Erstellen der Rechnung übernommen, um die Nachvollziehbarkeit und Revisionssicherheit
                                        zu gewährleisten. Nachträgliche Änderungen an diesen Informationen sind nicht mehr möglich, um unbeabsichtigte
                                        Datenänderungen (Regressionen) zu vermeiden.
                                    </p>
                                </div>

                                <div className="hidden lg:block"></div>

                                <div>
                                    <Label>
                                        Kunde - Firmenname <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.client_company} onChange={(e) => setData('client_company', e.target.value)} />
                                    <InputError message={errors.client_company} />
                                </div>
                                <div className="hidden lg:block"></div>
                                <div>
                                    <Label>
                                        Kunde - Straße + Hausnummer <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.client_address_line1} onChange={(e) => setData('client_address_line1', e.target.value)} />
                                    <InputError message={errors.client_address_line1} />
                                </div>

                                <div>
                                    <Label>
                                        Kunde - Postleitzahl <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.client_postal_code} onChange={(e) => setData('client_postal_code', e.target.value)} />
                                    <InputError message={errors.client_postal_code} />
                                </div>

                                <div>
                                    <Label>
                                        Kunde - Stadt <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.client_city} onChange={(e) => setData('client_city', e.target.value)} />
                                    <InputError message={errors.client_city} />
                                </div>

                                <div>
                                    <Label>
                                        Kunde - Land <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.client_country} onChange={(e) => setData('client_country', e.target.value)} />
                                    <InputError message={errors.client_country} />
                                </div>

                                <div className="my-6 lg:col-span-2">
                                    <hr />
                                </div>

                                <div className="lg:col-span-2">
                                    <Label>
                                        Rechnungspositionen <span className="text-red-600">*</span>
                                    </Label>
                                    <Table>
                                        <TableHead>
                                            <TableHeadRow>
                                                <TableHeadCell className="w-12 !pl-8">
                                                    <></>
                                                </TableHeadCell>
                                                <TableHeadCell>Menge</TableHeadCell>
                                                <TableHeadCell>Einheit</TableHeadCell>
                                                <TableHeadCell>Beschreibung</TableHeadCell>
                                                <TableHeadCell className="text-right">Einzelpreis</TableHeadCell>
                                                <TableHeadCell className="w-48 !pr-8 text-right">Gesamtpreis</TableHeadCell>
                                            </TableHeadRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.items.map((item) => (
                                                <TableBodyRow key={item}>
                                                    <TableBodyCell className="!pl-8">
                                                        <Button onClick={() => removeItem(item)} variant={'ghost'} className="text-left">
                                                            <XCircle className="text-red-600" />
                                                        </Button>
                                                    </TableBodyCell>
                                                    <TableBodyCell>{item.quantity}</TableBodyCell>
                                                    <TableBodyCell>{item.unit}</TableBodyCell>
                                                    <TableBodyCell>
                                                        <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
                                                    </TableBodyCell>
                                                    <TableBodyCell className="text-right">
                                                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
                                                            item.unit_price,
                                                        )}
                                                    </TableBodyCell>
                                                    <TableBodyCell className="!pr-8 text-right">
                                                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
                                                            item.unit_price * item.quantity,
                                                        )}
                                                    </TableBodyCell>
                                                </TableBodyRow>
                                            ))}
                                            <TableBodyRow className="border-t">
                                                <TableBodyCell colSpan={6} className="cursor-pointer" onClick={() => setIsAddingArticleModal(true)}>
                                                    <p className="flex items-center justify-center gap-2 text-center">
                                                        <Plus width={20} />
                                                        Rechnungsposition hinzufügen
                                                    </p>
                                                </TableBodyCell>
                                            </TableBodyRow>
                                            <TableBodyRow className="border-t">
                                                <TableBodyCell colSpan={4}>
                                                    <></>
                                                </TableBodyCell>
                                                <TableBodyCell className="text-right">Zwischensumme</TableBodyCell>
                                                <TableBodyCell className="!pr-8 text-right">
                                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(prices.netTotal)}
                                                </TableBodyCell>
                                            </TableBodyRow>
                                            <TableBodyRow className="border-t">
                                                <TableBodyCell colSpan={4}>
                                                    <></>
                                                </TableBodyCell>
                                                <TableBodyCell className="text-right">MwSt. (19%)</TableBodyCell>
                                                <TableBodyCell className="!pr-8 text-right">
                                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(prices.tax)}
                                                </TableBodyCell>
                                            </TableBodyRow>
                                            <TableBodyRow className="border-t">
                                                <TableBodyCell colSpan={4}>
                                                    <></>
                                                </TableBodyCell>
                                                <TableBodyCell className="text-right">Gesamtsumme</TableBodyCell>
                                                <TableBodyCell className="!pr-8 text-right">
                                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(prices.total)}
                                                </TableBodyCell>
                                            </TableBodyRow>
                                        </TableBody>
                                    </Table>
                                    <InputError message={errors.items} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Button disabled={processing}>
                                            {processing ? <LoaderCircle className="animate-spin" /> : null}
                                            Rechnung speichern
                                        </Button>

                                        {recentlySuccessful ? <span className="text-sm text-green-600">Gespeichert.</span> : null}
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <AlertDialog open={isAddingArticleModal}>
                    <AlertDialogContent>
                        <AlertDialogTitle>Artikel hinzufügen</AlertDialogTitle>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div>
                                <Label>
                                    Einheit <span className="text-red-600">*</span>
                                </Label>
                                <Input value={addData.unit} onChange={(e) => setAddData('unit', e.target.value)} />
                            </div>
                            <div>
                                <Label>
                                    Anzahl <span className="text-red-600">*</span>
                                </Label>
                                <Input type="number" value={addData.quantity} onChange={(e) => setAddData('quantity', Number(e.target.value))} />
                            </div>
                            <div className="lg:col-span-2">
                                <Label>Bezeichnung</Label>
                                <TipTapEditor value={addData.description} onUpdate={(e) => setAddData('description', e)} />
                            </div>
                            <div>
                                <Label>
                                    Einzelpreis <span className="text-red-600">*</span>
                                </Label>
                                <Input type="number" value={addData.unit_price} onChange={(e) => setAddData('unit_price', Number(e.target.value))} />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <Button variant="outline" onClick={() => setIsAddingArticleModal(false)}>
                                Abbrechen
                            </Button>
                            <Button onClick={() => submitAddArticle()}>Artikel hinzufügen</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={applyClientData !== null}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Möchten Sie die Daten von {applyClientData?.company_name} übernehmen?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Beim Akzeptieren der Daten von {applyClientData?.company_name} werden die Daten in das Formular übernommen. Unabhängig
                                davon haben Sie jederzeit die Möglichkeit, die Daten des Kunde abzuändern, falls nötig.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button variant={'outline'} onClick={() => cancelSelection()}>
                                Abbrechen
                            </Button>
                            <Button onClick={() => applySelection()}>Daten übernehmen</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
