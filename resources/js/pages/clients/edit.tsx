import Heading from '@/components/heading';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Client, GenderEnum, SalutationEnum, SharedData } from '@/types';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { FormEventHandler } from 'react';
import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kunden',
        href: '/kunden',
    },
    {
        title: 'Bearbeiten',
        href: '/kunden/erstellen',
    },
];

type CreateClientForm = {
    company_name: string;
    contact_person: string;
    contact_person_salutation: SalutationEnum | null;
    contact_person_gender: GenderEnum;
    email: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    postal_code: string;
    city: string;
    country: string;
    tax_number: string;
    notes: string;
};

interface Props extends SharedData {
    client: Client;
}

export default function Create() {
    const { client } = usePage<Props>().props;
    const { data, put, setData, processing, recentlySuccessful, errors } = useForm<Required<CreateClientForm>>({
        company_name: client.company_name,
        contact_person: client.contact_person,
        contact_person_salutation: null,
        contact_person_gender: GenderEnum.MALE,
        email: client.email,
        phone: client.phone,
        address_line1: client.address_line1,
        address_line2: client.address_line2,
        postal_code: client.postal_code,
        city: client.city,
        country: client.country,
        tax_number: client.tax_number,
        notes: client.notes,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('clients.update', client.id), {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <Heading title={`Kunden ${client.company_name} bearbeiten`} description="Hier bearbeiten Sie Kundenprofile, ändern Angaben und speichern Ihre Anpassungen." />

                    <Link href={route('clients.index')} className="mb-8">
                        <Button>
                            <ChevronLeft />
                            <span className="lg:block hidden">Zurück</span>
                        </Button>
                    </Link>
                </div>

                <Card>
                    <form onSubmit={submit}>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div>
                                    <Label>
                                        Firmenname <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} />
                                    <InputError message={errors.company_name} />
                                </div>
                                <div className="lg:col-span-2 my-2">
                                    <hr/>
                                </div>
                                <div>
                                    <Label>
                                        Adresszeile 1 <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.address_line1} onChange={(e) => setData('address_line1', e.target.value)} />
                                    <InputError message={errors.address_line1} />
                                </div>
                                <div>
                                    <Label>
                                        Adresszeile 2
                                    </Label>
                                    <Input value={data.address_line2} onChange={(e) => setData('address_line2', e.target.value)} />
                                    <InputError message={errors.address_line2} />
                                </div>

                                <div>
                                    <Label>
                                        Postleitzahl <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} />
                                    <InputError message={errors.postal_code} />
                                </div>

                                <div>
                                    <Label>
                                        Stadt <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.city} onChange={(e) => setData('city', e.target.value)} />
                                    <InputError message={errors.city} />
                                </div>

                                <div>
                                    <Label>
                                        Land <span className="text-red-600">*</span>
                                    </Label>
                                    <Input value={data.country} onChange={(e) => setData('country', e.target.value)} />
                                    <InputError message={errors.country} />
                                </div>

                                <div className="lg:col-span-2 my-2">
                                    <hr/>
                                </div>

                                <div>
                                    <Label>
                                        E-Mail Adresse <span className="text-red-600">*</span>
                                    </Label>
                                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    <InputError message={errors.email} />
                                </div>

                                <div>
                                    <Label>
                                        Telefon
                                    </Label>
                                    <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="lg:col-span-2">
                                    <Label>Ansprechpartner</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1/4">
                                            <Select value={data.contact_person_salutation} onValueChange={(value) => setData('contact_person_salutation', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Akademischen Titel auswählen" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value={null}>Akademischen Titel ausäwhlen</SelectItem>
                                                        <SelectItem value={SalutationEnum.DR}>Dr.</SelectItem>
                                                        <SelectItem value={SalutationEnum.PROF}>Prof.</SelectItem>
                                                        <SelectItem value={SalutationEnum.PROF_DR}>Prof. Dr.</SelectItem>
                                                        <SelectItem value={SalutationEnum.DIPL_INg}>Dipl.-Ing.</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.contact_person_salutation} />
                                        </div>
                                        <div className="w-1/4">
                                            <Select value={data.contact_person_gender} onValueChange={(value) => setData('contact_person_gender', value)}>
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
                                            <InputError message={errors.contact_person_gender} />
                                        </div>
                                        <div className="w-2/4">
                                            <Input placeholder="Max Mustermann" value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} />
                                            <InputError message={errors.contact_person} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label>
                                        Steuernummer
                                    </Label>
                                    <Input value={data.tax_number} onChange={(e) => setData('tax_number', e.target.value)} />
                                    <InputError message={errors.tax_number} />
                                </div>

                                <div className="lg:col-span-2 my-2">
                                    <hr/>
                                </div>

                                <div className="lg:col-span-2">
                                    <Label>
                                        Notiz
                                    </Label>
                                    <Textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                    <InputError message={errors.notes} />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <div className="flex items-center gap-2 mt-6">
                                <Button type="submit" disabled={processing || recentlySuccessful}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : null}
                                    Kunden aktualisieren
                                </Button>

                                {recentlySuccessful ? <div className="text-green-600 text-sm">
                                    Kunde aktualisiert.
                                </div>: null}
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
