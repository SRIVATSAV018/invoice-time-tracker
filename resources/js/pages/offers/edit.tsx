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
import { useCurrency } from '@/hooks/use-currency';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, GenderEnum, Offer, OfferItem, OfferStatusEnum, SalutationEnum } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeftRight, ChevronLeft, FileText, LoaderCircle, Pencil, Plus, Send, Trash } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface Form {
    client_id: string;
    project_id: string;
    status: OfferStatusEnum;
    client_company: string;
    client_contact_person: string;
    client_contact_person_gender: GenderEnum;
    client_contact_person_salutation: SalutationEnum | null;
    client_street: string;
    client_postal_code: string;
    client_city: string;
    client_country: string;
    client_tax_number: string;
    project_name: string;
    project_description: string;
    notes: string;
    valid_until: string;
    items:
        | Array<{
              unit: string;
              description: string;
              quantity: number;
              unit_price: number;
              total: number;
          }>
        | Array<OfferItem>;
    service_period_start: string;
    service_period_end: string;
}

interface AddUpdateItemForm {
    unit: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export default function Create({ offer }: { offer: Offer }) {
    const currency = useCurrency();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Angebote',
            href: '/angebote',
        },
        {
            title: 'Bearbeiten',
            href: '/angebote/' + offer.id + '/bearbeiten',
        },
    ];

    const { data, setData, errors, processing, put, recentlySuccessful } = useForm<Required<Form>>({
        client_id: offer.client_id,
        project_id: offer.project_id,
        status: offer.status,
        client_company: offer.client_company,
        client_contact_person: offer.client_contact_person,
        client_contact_person_gender: offer.client_contact_person_gender,
        client_contact_person_salutation: offer.client_contact_person_salutation,
        client_street: offer.client_street,
        client_postal_code: offer.client_postal_code,
        client_city: offer.client_city,
        client_country: offer.client_country,
        client_tax_number: offer.client_tax_number,
        project_name: offer.project_name,
        project_description: offer.project_description,
        notes: offer.notes,
        valid_until: offer.valid_until,
        items: offer.items,
        service_period_start: offer.service_period_start,
        service_period_end: offer.service_period_end,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('offers.update', offer.id), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const [isAddingItem, setIsAddingItem] = useState<boolean>(false);

    const {
        data: addData,
        setData: setAddData,
        errors: addErrors,
        reset: resetAdd,
        post: postAdd,
    } = useForm<Required<AddUpdateItemForm>>({
        unit: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
    });

    useEffect(() => {
        setAddData('unit_price', addData.unit_price.toString().replace(',', '.'));
        setAddData('total', addData.quantity * addData.unit_price);
    }, [addData.unit_price, addData.quantity]);

    const submitAddItem = () => {
        if (!isAddingItem) {
            return;
        }

        postAdd(route('offers.validate-item'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('items', [
                    ...data.items,
                    {
                        quantity: addData.quantity,
                        unit: addData.unit,
                        description: addData.description,
                        unit_price: addData.unit_price,
                        total: addData.total,
                    },
                ]);

                setIsAddingItem(false);
                resetAdd();
            },
        });
    };

    const cancelAddItem = () => {
        if (!isAddingItem) {
            return;
        }

        setIsAddingItem(false);
        resetAdd();
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

    const [isDeletingOffer, setIsDeletingOffer] = useState(false);

    const deleteOffer = () => {
        router.delete(route('offers.destroy', offer.id));
    };

    const [isSendingOfferToClient, setIsSendingOfferToClient] = useState(false);

    const submitSendEmailToClient = () => {
        router.post(
            route('offers.send-email', offer.id),
            {},
            {
                onSuccess: () => {
                    setIsSendingOfferToClient(false);
                },
            },
        );
    };

    const removeItem = (index: number) => {
        setData(
            'items',
            data.items.filter((item, itemIndex) => itemIndex !== index),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Angebot erstellen" />

            <div className="p-4">
                <div className="flex items-center justify-between gap-6">
                    <Heading title="Angebot erstellen" description="Hier erfassen Sie Basisdaten für Ihr Angebot." />

                    <div className="mb-8 inline-flex gap-2">
                        <Button size="sm">
                            <ArrowLeftRight />
                            <span className="hidden lg:block">In Rechnung umwandeln</span>
                        </Button>
                        {offer.status !== OfferStatusEnum.SENT &&
                        offer.status !== OfferStatusEnum.ACCEPTED &&
                        offer.status !== OfferStatusEnum.REJECTED &&
                        offer.status !== OfferStatusEnum.EXPIRED ? (
                            <Button size="sm" onClick={() => setIsSendingOfferToClient(true)}>
                                <Send />
                                <span className="hidden lg:block">Angebot an Kunden versenden</span>
                            </Button>
                        ) : null}
                        {offer.pdf_url ? (
                            <a target="_blank" href={route('offers.preview', offer.id)}>
                                <Button size="sm">
                                    <FileText />
                                    <span className="hidden lg:block">PDF anschauen</span>
                                </Button>
                            </a>
                        ) : null}
                        <Button variant="destructive" size="sm" onClick={() => setIsDeletingOffer(true)}>
                            <Trash />
                            <span className="hidden lg:block">Löschen</span>
                        </Button>
                        <Link href={route('offers.index')}>
                            <Button size="sm">
                                <ChevronLeft />
                                <span className="hidden lg:block">Zurück</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Angebotsinformationen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                <div>
                                    <Label>
                                        Kunde <span className="text-red-600">*</span>
                                    </Label>
                                    <Input disabled={true} value={offer.client?.company_name} />
                                    <InputError message={errors.client_id} />
                                </div>
                                <div>
                                    <Label>
                                        Projekt <span className="text-red-600">*</span>
                                    </Label>
                                    <Input disabled={true} value={offer.project?.name} />
                                    <InputError message={errors.project_id} />
                                </div>
                                <div>
                                    <Label>
                                        Status <span className="text-red-600">*</span>
                                    </Label>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Projekt auswählen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value={OfferStatusEnum.DRAFT}>Entwurf</SelectItem>
                                                <SelectItem value={OfferStatusEnum.SENT}>Versendet</SelectItem>
                                                <SelectItem value={OfferStatusEnum.ACCEPTED}>Akzeptiert</SelectItem>
                                                <SelectItem value={OfferStatusEnum.REJECTED}>Abgelehnt</SelectItem>
                                                <SelectItem value={OfferStatusEnum.EXPIRED}>Abgelaufen</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                                <div>
                                    <Label>
                                        Gültig bis <span className="text-red-600">*</span>
                                    </Label>
                                    <Input type="date" value={data.valid_until} onChange={(e) => setData('valid_until', e.target.value)} />
                                    <InputError message={errors.valid_until} />
                                </div>
                                <div className="xl:col-span-2">
                                    <Label>
                                        Leistungszeitraum <span className="text-red-600">*</span>
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="date"
                                            value={data.service_period_start}
                                            onChange={(e) => setData('service_period_start', e.target.value)}
                                        />
                                        <Input
                                            type="date"
                                            value={data.service_period_end}
                                            onChange={(e) => setData('service_period_end', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <InputError message={errors.service_period_start} className="w-1/2" />
                                        <InputError message={errors.service_period_end} className="w-1/2" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Kundeninformationen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                <div>
                                    <Label>
                                        Name <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        disabled={true}
                                        placeholder="Musterunternehmen"
                                        type="text"
                                        value={data.client_company}
                                        onChange={(e) => setData('client_company', e.target.value)}
                                    />
                                    <InputError message={errors.client_company} />
                                </div>
                                <div>
                                    <Label>
                                        USt-IdNr. <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        disabled={true}
                                        placeholder="DE00"
                                        type="text"
                                        value={data.client_tax_number}
                                        onChange={(e) => setData('client_tax_number', e.target.value)}
                                    />
                                    <InputError message={errors.client_tax_number} />
                                </div>
                                <div className="xl:col-span-2">
                                    <Label>
                                        Kontaktperson <span className="text-red-600">*</span>
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-1/4">
                                            <Select
                                                disabled={true}
                                                value={data.client_contact_person_salutation}
                                                onValueChange={(value) => setData('client_contact_person_salutation', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Akademischen Titel auswählen" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value={null}>Akademischen Titel auswählen</SelectItem>
                                                        <SelectItem value={SalutationEnum.DR}>Dr.</SelectItem>
                                                        <SelectItem value={SalutationEnum.PROF}>Prof.</SelectItem>
                                                        <SelectItem value={SalutationEnum.PROF_DR}>Prof. Dr.</SelectItem>
                                                        <SelectItem value={SalutationEnum.DIPL_INg}>Dipl.-Ing.</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>

                                            <InputError message={errors.client_contact_person_salutation} />
                                        </div>
                                        <div className="w-1/4">
                                            <Select
                                                disabled={true}
                                                value={data.client_contact_person_gender}
                                                onValueChange={(value) => setData('client_contact_person_gender', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Anrede auswählen" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value={GenderEnum.MALE}>Herr</SelectItem>
                                                        <SelectItem value={GenderEnum.FEMALE}>Frau</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.client_contact_person_gender} />
                                        </div>
                                        <div className="w-2/4">
                                            <Input
                                                disabled={true}
                                                placeholder="Musterunternehmen"
                                                type="text"
                                                value={data.client_contact_person}
                                                onChange={(e) => setData('client_contact_person', e.target.value)}
                                            />
                                            <InputError message={errors.client_contact_person} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label>
                                        Straße <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        disabled={true}
                                        placeholder="Musterstraße 1"
                                        type="text"
                                        value={data.client_street}
                                        onChange={(e) => setData('client_street', e.target.value)}
                                    />
                                    <InputError message={errors.client_street} />
                                </div>
                                <div className="hidden xl:block"></div>
                                <div>
                                    <Label>
                                        Postleitzahl <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        disabled={true}
                                        placeholder="00000"
                                        type="text"
                                        value={data.client_postal_code}
                                        onChange={(e) => setData('client_postal_code', e.target.value)}
                                    />
                                    <InputError message={errors.client_postal_code} />
                                </div>
                                <div>
                                    <Label>
                                        Stadt <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        disabled={true}
                                        placeholder="Musterstadt"
                                        type="text"
                                        value={data.client_city}
                                        onChange={(e) => setData('client_city', e.target.value)}
                                    />
                                    <InputError message={errors.client_city} />
                                </div>
                                <div>
                                    <Label>
                                        Land <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        disabled={true}
                                        placeholder="Deutschland"
                                        type="text"
                                        value={data.client_country}
                                        onChange={(e) => setData('client_country', e.target.value)}
                                    />
                                    <InputError message={errors.client_country} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Projektinformationen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                <div>
                                    <Label>
                                        Name <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        disabled={true}
                                        placeholder="Musterunternehmen"
                                        type="text"
                                        value={data.project_name}
                                        onChange={(e) => setData('project_name', e.target.value)}
                                    />
                                    <InputError message={errors.project_name} />
                                </div>
                                <div className="hidden xl:block"></div>
                                <div>
                                    <Label>
                                        Beschreibung <span className="text-red-600">*</span>
                                    </Label>
                                    <TipTapEditor value={data.project_description} onUpdate={(val) => setData('project_description', val)} />
                                    <InputError message={errors.project_description} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Leistungen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <Button onClick={() => setIsAddingItem(true)}>
                                    <Plus />
                                    Position hinzufügen
                                </Button>
                            </div>
                            <Table>
                                <TableHead>
                                    <TableHeadRow>
                                        <TableHeadCell>
                                            <></>
                                        </TableHeadCell>
                                        <TableHeadCell>Einheit</TableHeadCell>
                                        <TableHeadCell>Menge</TableHeadCell>
                                        <TableHeadCell>Beschreibung</TableHeadCell>
                                        <TableHeadCell className="w-[300px] text-right">Einzelpreis</TableHeadCell>
                                        <TableHeadCell className="w-[300px] text-right">Gesamtpreis</TableHeadCell>
                                    </TableHeadRow>
                                </TableHead>
                                <TableBody>
                                    {data.items.map((item, index) => (
                                        <TableBodyRow key={`item_${index}`}>
                                            <TableBodyCell>
                                                <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                                                    <Trash className="text-red-600" />
                                                </Button>

                                                <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                                                    <Pencil />
                                                </Button>
                                            </TableBodyCell>
                                            <TableBodyCell>{item.unit}</TableBodyCell>
                                            <TableBodyCell>
                                                {new Intl.NumberFormat('de-DE', {
                                                    style: 'decimal',
                                                    minimumFractionDigits: 2,
                                                }).format(item.quantity)}
                                            </TableBodyCell>
                                            <TableBodyCell>
                                                <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
                                            </TableBodyCell>
                                            <TableBodyCell className="text-right">{currency(item.unit_price)}</TableBodyCell>
                                            <TableBodyCell className="text-right">{currency(item.unit_price * item.quantity)}</TableBodyCell>
                                        </TableBodyRow>
                                    ))}
                                    <TableBodyRow className="border-t">
                                        <TableBodyCell colSpan={4}>
                                            <></>
                                        </TableBodyCell>
                                        <TableBodyCell className="text-right">Zwischensumme</TableBodyCell>
                                        <TableBodyCell className="text-right">
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
                                        <TableBodyCell className="text-right">MwSt.</TableBodyCell>
                                        <TableBodyCell className="text-right">
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
                                        <TableBodyCell className="text-right">
                                            {new Intl.NumberFormat('de-DE', {
                                                style: 'currency',
                                                currency: 'EUR',
                                            }).format(prices.total)}
                                        </TableBodyCell>
                                    </TableBodyRow>
                                </TableBody>
                            </Table>

                            <InputError message={errors.items} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Button onClick={(e) => submit(e)} disabled={processing}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : null}
                                    Angebot aktualisieren
                                </Button>

                                {recentlySuccessful ? <span className="text-sm text-green-600">Aktualisiert.</span> : null}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={isSendingOfferToClient}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Möchten Sie das Angebot wirklich an Ihren Kunden senden?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Wenn Sie das Angebot an Ihren Kunden versenden, schicken wir eine E-Mail mit Ihrer Angebots-PDF an die E-Mail Ihres
                            Kunden. Der Kunde hat in der E-Mail die Möglichkeit, das Angebot anzunehmen. Wenn das Angebot durch den Kunden angenommen
                            wird, legen wir das Projekt automatisch an.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-sm">
                        Die E-Mail wird an folgende Adresse versendet: <br /> {offer.client?.email}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsSendingOfferToClient(false)}>
                            Abbrechen
                        </Button>
                        <Button size="sm" onClick={() => submitSendEmailToClient()}>
                            E-Mail versenden
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isDeletingOffer}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sind Sie sicher, dass Sie das Angebot {offer.offer_number} löschen möchten?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Das Löschen des Angebotes hat zur Folge, dass Sie keine weiteren Änderungen an diesem durchführen können. Wenn Sie sicher
                            sind, dass Sie dieses Angebot löschen möchten, klicken Sie bitte auf den Button "Jetzt Löschen". Sie haben jederzeit die
                            Möglichkeit, das Angebot widerherzustellen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button onClick={() => setIsDeletingOffer(false)} size="sm" variant="outline">
                            Abbrechen
                        </Button>
                        <Button onClick={() => deleteOffer()} variant="destructive">
                            Jetzt Löschen
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isAddingItem}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Neue Position hinzufügen</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <div>
                            <Label>
                                Einheit <span className="text-red-600">*</span>
                            </Label>
                            <Input type="text" value={addData.unit} onChange={(e) => setAddData('unit', e.target.value)} />
                            <InputError message={addErrors.unit} />
                        </div>
                        <div>
                            <Label>
                                Anzahl <span className="text-red-600">*</span>
                            </Label>
                            <Input type="number" value={addData.quantity} onChange={(e) => setAddData('quantity', Number(e.target.value))} />
                            <InputError message={addErrors.quantity} />
                        </div>
                        <div className="xl:col-span-2">
                            <Label>
                                Beschreibung <span className="text-red-600">*</span>
                            </Label>
                            <TipTapEditor value={addData.description} onUpdate={(e) => setAddData('description', e)} />
                            <InputError message={addErrors.quantity} />
                        </div>
                        <div>
                            <Label>
                                Einzelpreis <span className="text-red-600">*</span>
                            </Label>
                            <Input type="text" value={addData.unit_price} onChange={(e) => setAddData('unit_price', e.target.value)} />
                            <InputError message={addErrors.unit_price} />
                        </div>
                        <div>
                            <Label>
                                Gesamtpreis <span className="text-red-600">*</span>
                            </Label>
                            <Input disabled={true} type="text" value={addData.total} onChange={(e) => setAddData('total', e.target.value)} />
                            <InputError message={addErrors.total} />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => cancelAddItem()}>
                            Abbrechen
                        </Button>
                        <Button onClick={() => submitAddItem()}>Speichern</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
