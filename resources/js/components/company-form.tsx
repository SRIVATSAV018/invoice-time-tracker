import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm, usePage } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { CompanyDetails, SharedData } from '@/types';

type CompanyForm = {
    logo: File | null;
    name: string;
    address_line1: string;
    address_line2: string;
    postal_code: string;
    city: string;
    country: string;
    email: string;
    phone: string;
    tax_number: string;
};

interface Props extends SharedData {
    companyDetails: CompanyDetails
}

export default function CompanyForm() {
    const { companyDetails } = usePage<Props>().props;

    useEffect(() => {
        setData('name', companyDetails?.name);
        setData('address_line1', companyDetails?.address_line1);
        setData('address_line2', companyDetails?.address_line2);
        setData('postal_code', companyDetails?.postal_code);
        setData('city', companyDetails?.city);
        setData('country', companyDetails?.country);
        setData('email', companyDetails?.email);
        setData('phone', companyDetails?.phone);
        setData('tax_number', companyDetails?.tax_number);
    }, [companyDetails])

    const { data, setData, errors, processing, recentlySuccessful, post, reset } = useForm<Required<CompanyForm>>({
        logo: null,
        name: companyDetails?.name,
        address_line1: companyDetails?.address_line1,
        address_line2: companyDetails?.address_line2,
        postal_code: companyDetails?.postal_code,
        city: companyDetails?.postal_code,
        country: companyDetails?.country,
        email: companyDetails?.email,
        phone: companyDetails?.phone,
        tax_number: companyDetails?.tax_number
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('configuration.submit.company-information'), {
            preserveScroll: true,
            only: ['companyDetails']
        });
    };

    const [logoPreview, setLogoPreview] = useState<string | null>(companyDetails?.logo_url || null);

    useEffect(() => {
        if (!data.logo) {
            return;
        }

        const url = URL.createObjectURL(data.logo);

        setLogoPreview(url);
    }, [data.logo]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Unternehmensinformationen</CardTitle>
            </CardHeader>
            <form onSubmit={(e) => submit(e)}>
                <CardContent>

                    <div className="grid auto-rows-min grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="p-4 rounded-lg bg-blue-500/10">
                            <h4 className="font-semibold">
                                Information
                            </h4>
                            <p className="text-sm">
                                Die Unternehmensinformationen werden benötigt um Rechnungen zu generieren.
                            </p>
                        </div>
                        <div className="lg:block hidden"></div>
                        <div>

                            <Label>
                                Logo <span className="text-red-600">*</span>
                            </Label>
                            {logoPreview ? <img src={logoPreview} className="h-48 mb-3" alt="" /> : null}
                            <Input type="file"
                                   accept="image/*"
                                   onChange={(e) => setData('logo', e.target.files![0])} />
                            <InputError message={errors.logo} />
                        </div>
                        <div className="lg:block hidden"></div>
                        <div>
                            <Label>
                                Name <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            <InputError message={errors.name} />
                        </div>
                        <div className="lg:block hidden"></div>
                        <div>
                            <Label>
                                Addresszeile 1 <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.address_line1} onChange={(e) => setData('address_line1', e.target.value)} />
                            <InputError message={errors.address_line1} />
                        </div>
                        <div>
                            <Label>Addresszeile 2</Label>
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
                            <Input value={data.country} onChange={(e) => setData('country', e.target.value)} placeholder="Deutschland" />
                            <InputError message={errors.country} />
                        </div>

                        <div className="lg:col-span-2">
                            <hr/>
                        </div>

                        <div>
                            <Label>
                                E-Mail Adresse <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="user@example.com" />
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
                            <hr/>
                        </div>

                        <div>
                            <Label>USt-IdNr. / Steuernummer</Label>
                            <Input value={data.tax_number} onChange={(e) => setData('tax_number', e.target.value)} />
                            <small>
                                Wenn Sie keine Ust-IdNr. / Steuernummer angegeben haben, gehen wir davon aus, dass Sie von der
                                Kleinunternehmerregelung Gebrauch nehmen.
                            </small>
                            <InputError message={errors.tax_number} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="mt-6">
                        <div className="flex items-center gap-2">
                            <Button type="submit">
                                {processing ? <LoaderCircle className="animate-spin" /> : null}
                                Angaben speichern
                            </Button>
                            {recentlySuccessful ? <span className="text-sm text-green-600">Gespeichert.</span> : null}
                        </div>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
