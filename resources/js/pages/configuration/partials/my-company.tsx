import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { SharedData } from '@/types';

interface Form {
    logo: File | null;
    name: string;
    address_line1: string;
    address_line2: string | null;
    postal_code: string;
    city: string;
    country: string;
    email: string;
    phone: string;
    website: string;
}

export default function MyCompany({ className }: { className: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, processing, recentlySuccessful, errors, isDirty, post, clearErrors } = useForm<Required<Form>>({
        logo: null,
        name: auth.user?.settings?.name ?? '',
        address_line1: auth.user?.settings?.address_line1 ?? '',
        address_line2: auth.user?.settings?.address_line2 ?? '',
        postal_code: auth.user?.settings?.postal_code ?? '',
        city: auth.user?.settings?.city ?? '',
        country: auth.user?.settings?.country ?? '',
        email: auth.user?.settings?.email ?? '',
        phone: auth.user?.settings?.phone ?? '',
        website: auth.user?.settings?.website ?? ''
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(auth.user?.settings?.logo ? '/storage/' + auth.user?.settings?.logo : null);

    useEffect(() => {
        if (!data.logo) {
            return;
        }

        const url = URL.createObjectURL(data.logo);

        setLogoPreview(url);
    }, [data.logo]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('configuration.submit.company-information'), {
            onSuccess: () => {
                clearErrors();
            }
        })
    }

    return (
        <div className={cn('xl:col-span-8', className)}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Mein Unternehmen
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => submit(e)} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>

                            <Label>
                                Logo <span className="text-red-600">*</span>
                            </Label>
                            <div className="flex items-center gap-4">
                                {logoPreview ? <img src={logoPreview} className="h-12" alt="Logo" /> : null}
                                <Input type="file"
                                       accept="image/*"
                                       onChange={(e) => setData('logo', 'files' in e.target && e.target.files !== null && e.target.files.length > 0 ? e.target.files[0] : null)} />
                            </div>
                            <InputError message={errors.logo} />
                        </div>
                        <div className="lg:block hidden"></div>
                        <div>
                            <Label>
                                Name des Unternehmen <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Beispielunternehmen" />
                            <InputError message={errors.name} />
                        </div>
                        <div className="lg:block hidden"></div>
                        <div>
                            <Label>
                                Adresszeile 1 <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.address_line1} onChange={(e) => setData('address_line1', e.target.value)} placeholder="Musterstraße" />
                            <InputError message={errors.address_line1} />
                        </div>
                        <div>
                            <Label aria-label="Adresszeile 2">
                                Adresszeile 2
                            </Label>
                            <Input value={data.address_line2 ?? ''} onChange={(e) => setData('address_line2', e.target.value)} placeholder="Erdgeschoss, Gebäude, etc." />
                            <InputError message={errors.address_line2} />
                        </div>
                        <div>
                            <Label>
                                Postleitzahl <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} placeholder="11111" />
                            <InputError message={errors.postal_code} />
                        </div>
                        <div>
                            <Label>
                                Stadt <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.city} onChange={(e) => setData('city', e.target.value)} placeholder="Köln" />
                            <InputError message={errors.city} />
                        </div>
                        <div>
                            <Label>
                                Land <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.country} onChange={(e) => setData('country', e.target.value)} placeholder="Deutschland" />
                            <InputError message={errors.country} />
                        </div>

                        <div className="py-4 lg:col-span-2">
                            <hr/>
                        </div>

                        <div>
                            <Label>
                                Kontakt E-Mail Adresse <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="user@example.com" />
                            <InputError message={errors.email} />
                        </div>
                        <div>
                            <Label>
                                Kontakt Telefonnummer <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+49 123 45678901" />
                            <InputError message={errors.phone} />
                        </div>
                        <div>
                            <Label>
                                Website <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.website} onChange={(e) => setData('website', e.target.value)} placeholder="+49 123 45678901" />
                            <InputError message={errors.website} />
                        </div>
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2">
                                <Button type="submit" disabled={processing || !isDirty}>
                                    {processing ? <LoaderCircle className="animate-spin" /> : null}
                                    Speichern
                                </Button>

                                {recentlySuccessful ? <span className="text-sm text-green-600">Gespeichert.</span> : null}
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
