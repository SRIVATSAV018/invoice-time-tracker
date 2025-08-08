import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Table from '@/components/table/Table';
import TableBody from '@/components/table/TableBody';
import TableBodyCell from '@/components/table/TableBodyCell';
import TableBodyRow from '@/components/table/TableBodyRow';
import TableHead from '@/components/table/TableHead';
import TableHeadCell from '@/components/table/TableHeadCell';
import TableHeadRow from '@/components/table/TableHeadRow';
import TipTapEditor from '@/components/tip-tap-editor';
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
import { BreadcrumbItem, Client, Invoice, InvoiceStatusEnum, Project, SharedData } from '@/types';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, FileText, LoaderCircle, Pen, Pencil, Plus, RefreshCw, Send, Trash, XCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

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
    issued_at: string | null;
    due_at: string | null;
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
    invoice: Invoice;
}

export default function Create() {
    const { clients, projects, invoice } = usePage<Props>().props;

    const { data, setData, errors, put, processing, recentlySuccessful } = useForm<Required<Form>>({
        client_id: invoice.client_id,
        project_id: invoice.project_id,
        issued_at: invoice.issued_at,
        due_at: invoice.due_at,
        status: invoice.status,
        client_company: invoice.client_company,
        client_address_line1: invoice.client_address_line1,
        client_postal_code: invoice.client_postal_code,
        client_city: invoice.client_city,
        client_country: invoice.client_country,
        notes: invoice.notes ?? '',
        items: invoice.items,
        service_period_end: invoice.service_period_end ?? undefined,
        service_period_start: invoice.service_period_start ?? undefined,
    });

    const client_id = data.client_id;
    const isFirstRun = useRef(true);

    const [applyClientData, setApplyClientData] = useState<Client | null>(null);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

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

    const [editingInvoice, setEditingInvoice] = useState<InvoiceItem | null>(null);

    useEffect(() => {
        if (editingInvoice) {
            setUpdateData('quantity', editingInvoice.quantity);
            setUpdateData('unit', editingInvoice.unit);
            setUpdateData('unit_price', editingInvoice.unit_price);
            setUpdateData('description', editingInvoice.description)
        }
    }, [editingInvoice]);

    const { data: updateData, setData: setUpdateData } = useForm<Required<AddingArticleForm>>({
        quantity: 1,
        unit: '',
        unit_price: '',
        description: '',
    });

    const submitUpdateArticle = () => {
        const items = data.items.filter((i) => i !== editingInvoice);

        setData('items', [
            ...items,
            {
                quantity: updateData.quantity,
                unit: updateData.unit,
                unit_price: updateData.unit_price,
                description: updateData.description,
                total: updateData.unit_price * updateData.quantity,
            },
        ]);

        setEditingInvoice(null);
    };

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

        put(route('invoices.update', invoice.id), {
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    const deleteInvoice = () => {
        router.delete(route('invoices.destroy', invoice.id), {
            onSuccess: () => {
                router.get(route('invoices.inde'));
            },
        });
    };

    const forceDeleteInvoice = () => {

    }

    const [sendInvoice, setSendInvoice] = useState(false);

    const [sendInvoicePlannedDate, setSendInvoicePlannedDate] = useState<string | null>(null);

    const submitSendInvoice = () => {
        router.post(route('invoices.send-to-client', invoice.id), {
            date: sendInvoicePlannedDate
        }, {
            onSuccess: () => {
                setSendInvoice(false);
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Rechnung bearbeiten" description="Hier erfassen Sie Basisdaten für Ihre Rechnung." />

                    <div className="mb-8 flex items-center gap-2">
                        <Button disabled={invoice.is_pdf_generating} onClick={() => router.post(route('invoices.generate-pdf', invoice.id))}>
                            <RefreshCw />
                            PDF generieren
                        </Button>
                        {invoice.status === InvoiceStatusEnum.OPEN ? (
                            <Button onClick={() => setSendInvoice(!sendInvoice)}>
                                <Send />
                                Rechnung an Kunden senden
                            </Button>
                        ) : null}
                        <Button>
                            <a className="flex items-center gap-2" target="_blank" href={route('invoices.preview', invoice.id)}>
                                <FileText />
                                <span className="hidden lg:block">PDF anschauen</span>
                            </a>
                        </Button>
                        {invoice.deleted_at === null ? <Button onClick={() => deleteInvoice()} variant="destructive">
                            <Trash />
                            <span className="hidden lg:block">Löschen</span>
                        </Button> : null}
                        {invoice.deleted_at !== null ? <Button onClick={() => forceDeleteInvoice()} variant="destructive">
                            <Trash />
                            <span className="hidden lg:block">Endgültig löschen</span>
                        </Button> : null}
                        <Link href={route('invoices.index')}>
                            <Button>
                                <ChevronLeft />
                                <span className="hidden lg:block">Zurück</span>
                            </Button>
                        </Link>
                    </div>
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
                                    <Input disabled={true} value={invoice.invoice_number} />
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
                                    <Select disabled={true}
                                            value={data.client_id?.toString() ?? ''}
                                            onValueChange={(e) => setData('client_id', Number(e))}>
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
                                    <Label>
                                        Projekt <span className="text-red-600">*</span>
                                    </Label>
                                    <Select
                                        disabled={true}
                                        value={data.project_id?.toString() ?? ''}
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
                                    <Label>Leistungszeitraum bis</Label>

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
                                        Nachträgliche Änderungen an diesen Informationen sind nicht mehr möglich, um unbeabsichtigte Datenänderungen
                                        (Regressionen) zu vermeiden.
                                    </p>
                                </div>

                                <div className="hidden lg:block"></div>

                                <div>
                                    <Label>
                                        Kunde - Firmenname <span className="text-red-600">*</span>
                                    </Label>
                                    <Input disabled={true} value={data.client_company} onChange={(e) => setData('client_company', e.target.value)} />
                                    <InputError message={errors.client_company} />
                                </div>
                                <div className="hidden lg:block"></div>
                                <div>
                                    <Label>
                                        Kunde - Straße + Hausnummer <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        disabled={true}
                                        value={data.client_address_line1}
                                        onChange={(e) => setData('client_address_line1', e.target.value)}
                                    />
                                    <InputError message={errors.client_address_line1} />
                                </div>

                                <div>
                                    <Label>
                                        Kunde - Postleitzahl <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        disabled={true}
                                        value={data.client_postal_code}
                                        onChange={(e) => setData('client_postal_code', e.target.value)}
                                    />
                                    <InputError message={errors.client_postal_code} />
                                </div>

                                <div>
                                    <Label>
                                        Kunde - Stadt <span className="text-red-600">*</span>
                                    </Label>
                                    <Input disabled={true} value={data.client_city} onChange={(e) => setData('client_city', e.target.value)} />
                                    <InputError message={errors.client_city} />
                                </div>

                                <div>
                                    <Label>
                                        Kunde - Land <span className="text-red-600">*</span>
                                    </Label>
                                    <Input disabled={true} value={data.client_country} onChange={(e) => setData('client_country', e.target.value)} />
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
                                                    <TableBodyCell className="text-left">
                                                        <Button onClick={() => removeItem(item)} variant={'ghost'} className="text-left">
                                                            <XCircle className="text-red-600" />
                                                        </Button>
                                                        <Button onClick={() => setEditingInvoice(item)} variant={'ghost'} className="text-left">
                                                            <Pencil className="text-yellow-600" />
                                                        </Button>
                                                    </TableBodyCell>
                                                    <TableBodyCell>{new Intl.NumberFormat('de-DE', { style: 'decimal', minimumFractionDigits: 2 }).format(item.quantity)}</TableBodyCell>
                                                    <TableBodyCell>{item.unit}</TableBodyCell>
                                                    <TableBodyCell>
                                                        <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
                                                    </TableBodyCell>
                                                    <TableBodyCell className="text-right">
                                                        {new Intl.NumberFormat('de-DE', {
                                                            style: 'currency',
                                                            currency: 'EUR',
                                                        }).format(item.unit_price)}
                                                    </TableBodyCell>
                                                    <TableBodyCell className="!pr-8 text-right">
                                                        {new Intl.NumberFormat('de-DE', {
                                                            style: 'currency',
                                                            currency: 'EUR',
                                                        }).format(item.unit_price * item.quantity)}
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
                                                    {new Intl.NumberFormat('de-DE', {
                                                        style: 'currency',
                                                        currency: 'EUR',
                                                    }).format(prices.netTotal)}
                                                </TableBodyCell>
                                            </TableBodyRow>
                                            <TableBodyRow className="border-t">
                                                <TableBodyCell colSpan={4}>
                                                    <></>
                                                </TableBodyCell>
                                                <TableBodyCell className="text-right">MwSt. (19%)</TableBodyCell>
                                                <TableBodyCell className="!pr-8 text-right">
                                                    {new Intl.NumberFormat('de-DE', {
                                                        style: 'currency',
                                                        currency: 'EUR',
                                                    }).format(prices.tax)}
                                                </TableBodyCell>
                                            </TableBodyRow>
                                            <TableBodyRow className="border-t">
                                                <TableBodyCell colSpan={4}>
                                                    <></>
                                                </TableBodyCell>
                                                <TableBodyCell className="text-right">Gesamtsumme</TableBodyCell>
                                                <TableBodyCell className="!pr-8 text-right">
                                                    {new Intl.NumberFormat('de-DE', {
                                                        style: 'currency',
                                                        currency: 'EUR',
                                                    }).format(prices.total)}
                                                </TableBodyCell>
                                            </TableBodyRow>
                                        </TableBody>
                                    </Table>
                                    <InputError message={errors.items} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? <LoaderCircle className="animate-spin" /> : null}
                                            Rechnung aktualisieren
                                        </Button>

                                        {recentlySuccessful ? <span className="text-sm text-green-600">Gespeichert.</span> : null}
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <AlertDialog open={sendInvoice}>
                    <AlertDialogContent>
                        <AlertDialogTitle>
                            Möchten Sie die Rechnung an den Kunden versenden?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Sind Sie sicher, dass Sie die Rechnung an den Kunden versenden möchten?
                        </AlertDialogDescription>

                        <div>
                            <Label>
                                Geplanter Versand
                            </Label>
                            <Input type="datetime-local"
                                   value={sendInvoicePlannedDate}
                                   onChange={(e) => setSendInvoicePlannedDate(e.target.value)} />
                            <small>
                                Wenn Sie die E-Mail sofort versenden möchten, lassen Sie dieses Feld leer.
                            </small>
                        </div>
                        <AlertDialogFooter>
                            <Button variant="outline" onClick={() => setSendInvoice(false)}>
                                Abbrechen
                            </Button>
                            <Button onClick={() => submitSendInvoice()}>
                                E-Mail versenden
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

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

                <AlertDialog open={editingInvoice !== null}>
                    <AlertDialogContent>
                        <AlertDialogTitle>Artikel hinzufügen</AlertDialogTitle>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div>
                                <Label>
                                    Einheit <span className="text-red-600">*</span>
                                </Label>
                                <Input value={updateData.unit} onChange={(e) => setUpdateData('unit', e.target.value)} />
                            </div>
                            <div>
                                <Label>
                                    Anzahl <span className="text-red-600">*</span>
                                </Label>
                                <Input type="number" value={updateData.quantity} onChange={(e) => setUpdateData('quantity', Number(e.target.value))} />
                            </div>
                            <div className="lg:col-span-2">
                                <Label>Bezeichnung</Label>
                                <TipTapEditor value={updateData.description} onUpdate={(e) => setUpdateData('description', e)} />
                            </div>
                            <div>
                                <Label>
                                    Einzelpreis <span className="text-red-600">*</span>
                                </Label>
                                <Input type="number" value={updateData.unit_price} onChange={(e) => setUpdateData('unit_price', Number(e.target.value))} />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <Button variant="outline" onClick={() => setEditingInvoice(null)}>
                                Abbrechen
                            </Button>
                            <Button onClick={() => submitUpdateArticle()}>Artikel aktualisieren</Button>
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
