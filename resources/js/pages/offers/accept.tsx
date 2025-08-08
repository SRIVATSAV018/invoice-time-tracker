import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, LoaderCircle } from 'lucide-react';
import { Offer, UserSettings } from '@/types';
import { format } from 'date-fns';
import Table from '@/components/table/Table';
import TableHead from '@/components/table/TableHead';
import TableHeadRow from '@/components/table/TableHeadRow';
import TableHeadCell from '@/components/table/TableHeadCell';
import TableBody from '@/components/table/TableBody';
import TableBodyRow from '@/components/table/TableBodyRow';
import TableBodyCell from '@/components/table/TableBodyCell';
import { useCurrency } from '@/hooks/use-currency';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';

interface Form {
    i_have_read_the_offer: boolean;
}

export default function Accept({ offer, settings }: { offer: Offer; settings: UserSettings }) {
    const currency = useCurrency();

    const { data, setData, post, processing, errors } = useForm<Required<Form>>({
        i_have_read_the_offer: false
    });

    const submit = () => {
        post(route('offers.accept', {
            offer: offer.id
        }), {
            preserveScroll: true
        });
    }

    return (
        <GuestLayout title="Angebotsübersicht" description="Hier können Sie sich die Angebotsdetails im Detail anschauen.">
            <div>
                <div>
                    <small className="text-muted-foreground">
                        {settings.name} - {settings.address_line1} - {settings.postal_code} {settings.city}
                    </small>
                    <div className="lg:flex items-start justify-between">
                        <div>
                            <p>
                                {offer.client_company}
                            </p>
                            <p>
                                {offer.client_street}
                            </p>
                            <p>
                                {offer.client_postal_code} {offer.client_city}
                            </p>
                        </div>
                        <div className="lg:mt-0 mt-8">
                            <p>
                                Tel.: {settings.phone}
                            </p>
                            <p>
                                {settings.email}
                            </p>
                            <p>
                                {settings.website}
                            </p>
                            {settings.subject_to_sales_tax ? <p>USt-IdNr.: {settings.tax_number}</p> : null}
                        </div>
                    </div>

                    <div className="mt-8 ml-auto text-sm text-muted-foreground">
                        <p>
                            Datum: {format(offer.created_at, 'dd.MM.yyyy')}
                        </p>
                        <p>
                            Gültig bis: {format(offer.valid_until, 'dd.MM.yyyy')}
                        </p>
                        <p>
                            Leistungszeitraum: {format(offer.service_period_start, 'dd.MM.yyyy')} - {format(offer.service_period_end, 'dd.MM.yyyy')}
                        </p>
                    </div>

                    <h3 className="mt-6 text-lg font-bold">Angebot {offer.offer_number}</h3>

                    <h6 className="font-medium mt-4">Gesamtübersicht</h6>

                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <TableHeadCell>
                                    Menge
                                </TableHeadCell>
                                <TableHeadCell>
                                    Einheit
                                </TableHeadCell>
                                <TableHeadCell>
                                    Bezeichnung
                                </TableHeadCell>
                                <TableHeadCell className="text-right">
                                    Einzelpreis
                                </TableHeadCell>
                                <TableHeadCell className="text-right">
                                    Gesamtpreis
                                </TableHeadCell>
                            </TableHeadRow>
                        </TableHead>
                        <TableBody>
                            {offer.items?.map(item => <TableBodyRow key={item.id}>
                                <TableBodyCell>
                                    {item.quantity}
                                </TableBodyCell>
                                <TableBodyCell>
                                    {item.unit}
                                </TableBodyCell>
                                <TableBodyCell>
                                    <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
                                </TableBodyCell>
                                <TableBodyCell className="text-right">
                                    {currency(item.unit_price)}
                                </TableBodyCell>
                                <TableBodyCell className="text-right">
                                    {currency(item.unit_price * item.quantity)}
                                </TableBodyCell>
                            </TableBodyRow>)}
                            <TableBodyRow className="border-t">
                                <TableBodyCell colSpan={3}>
                                    <></>
                                </TableBodyCell>
                                <TableBodyCell className="text-right">
                                    Zwischensumme
                                </TableBodyCell>
                                <TableBodyCell className="text-right">
                                    {currency(offer.items?.reduce((total, item) => total + (item.quantity * item.unit_price), 0))}
                                </TableBodyCell>
                            </TableBodyRow>
                            <TableBodyRow className="border-t">
                                <TableBodyCell colSpan={3}>
                                    <></>
                                </TableBodyCell>
                                <TableBodyCell className="text-right">
                                    MwSt. ({settings?.sales_tax} %)
                                </TableBodyCell>
                                <TableBodyCell className="text-right">
                                    {currency(offer.items?.reduce((total, item) => total + ((item.quantity * item.unit_price) * (settings?.sales_tax ?? 19) / 100), 0))}
                                </TableBodyCell>
                            </TableBodyRow>
                            <TableBodyRow className="border-t">
                                <TableBodyCell colSpan={3}>
                                    <></>
                                </TableBodyCell>
                                <TableBodyCell className="text-right">
                                    Gesamtsumme
                                </TableBodyCell>
                                <TableBodyCell className="text-right">
                                    {currency(offer.items?.reduce((total, item) => total + ((item.quantity * item.unit_price) + ((item.quantity * item.unit_price) * (settings?.sales_tax ?? 19) / 100)), 0))}
                                </TableBodyCell>
                            </TableBodyRow>
                        </TableBody>
                    </Table>

                    <div className="mt-6">
                        <h4 className="text-lg font-bold">
                            Projekt:
                        </h4>

                        <p dangerouslySetInnerHTML={{ __html: offer.project_description }}></p>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-lg font-bold">
                            Lieferzeitraum:
                        </h4>

                        <p>
                            Projektbeginn: {format(offer.service_period_start, 'dd.MM.yyyy')}
                        </p>
                        <p>
                            Geplante Fertigstellung: {format(offer.service_period_end, 'dd.MM.yyyy')}
                        </p>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-lg font-bold">
                            Zahlungsbedingungen:
                        </h4>

                        <p>
                            Zahlbar innehralb von {settings?.payment_goal ?? 14} Tagen nach Abnahme des Projekts.
                        </p>
                        <p>
                            Bankverbindung und Zahlungsdetails folgen auf der Rechnung.
                        </p>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-lg font-bold">
                            Zusätzliche Hinweise:
                        </h4>

                        <ul className="list-disc ml-5 leading-7">
                            <li>
                                Dieses Angebot ist gültig bis zum {format(offer.valid_until, 'dd.MM.yyyy')}
                            </li>
                            <li>
                                Änderungen oder Erweiterugnen des Leistungsumfangs werden separat angeboten.
                            </li>
                            <li>
                                Die Übergabe der finalen Dateien erfolgt nach vollständiger Zahlung.
                            </li>
                        </ul>
                    </div>
                </div>

                <p className="mt-8">
                    Sollten Sie das Angebot annehmen, senden wir Ihnen zur Bestätigung eine E-Mail.
                </p>

                <div className="mt-8">
                    <div className="flex items-center gap-2">
                        <Checkbox checked={data.i_have_read_the_offer} onClick={(_) => setData('i_have_read_the_offer', !data.i_have_read_the_offer)} id="i_have_read_the_ofer" />
                        <Label htmlFor="i_have_read_the_ofer">
                            Ich habe das Angebot durchgelesen und nehme dieses verbindlich an.
                        </Label>
                    </div>
                    <InputError message={errors.i_have_read_the_offer} />
                </div>

                <div className="mt-8">
                    <Button disabled={processing} onClick={() => submit()}>
                        {processing ? <LoaderCircle className="animate-spin" /> : <CheckCircle />}
                        Angebot verbindlich annehmen
                    </Button>
                </div>
            </div>
        </GuestLayout>
    );
}
