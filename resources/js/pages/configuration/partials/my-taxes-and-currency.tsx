import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface Form {
    currency: string | null;
    subject_to_sales_tax: boolean;
    sales_tax: number;
    tax_number: string;
}

interface Props extends SharedData {
    currencies: { [key: string]: string };
}

export default function MyTaxesAndCurrency({ className }: { className: string }) {
    const { currencies, auth } = usePage<Props>().props;

    const { data, setData, processing, errors, recentlySuccessful, post, isDirty, clearErrors } = useForm<Required<Form>>({
        currency: auth.user?.settings?.currency,
        subject_to_sales_tax: auth.user?.settings?.subject_to_sales_tax,
        sales_tax: auth.user?.settings?.sales_tax,
        tax_number: auth.user?.settings?.tax_number
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('configuration.submit.currency-taxes'), {
            onSuccess: () => {
                clearErrors();
            },
        });
    };

    const [subjectedToSalesTax, setSubjectedToSalesTax] = useState(false);

    useEffect(() => {
        setSubjectedToSalesTax(data.subject_to_sales_tax);

        if (!data.subject_to_sales_tax) {
            // Reset fields to default values if the user changed the value of their sales_tax.
            setData('sales_tax', '');
            setData('tax_number', '');
        }
    }, [data.subject_to_sales_tax]);

    return (
        <div className={cn('xl:col-span-8', className)}>
            <Card>
                <CardHeader>
                    <CardTitle>Meine Steuern & Währung</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => submit(e)} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <Label>
                                Währung <span className="text-red-600">*</span>
                            </Label>
                            <Select value={data.currency ?? ''} onValueChange={(value) => setData('currency', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Währung auswählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {Object.keys(currencies).map((key) => (
                                            <SelectItem key={key} value={key}>
                                                {currencies[key]}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.currency} />
                        </div>

                        <div className="py-2 lg:col-span-2">
                            <hr/>
                        </div>

                        <div className="inline-flex items-center gap-2">
                            <Switch checked={data.subject_to_sales_tax} onClick={(e) => setData('subject_to_sales_tax', !data.subject_to_sales_tax)} />
                            <Label>Ich bin Umsatzsteuerpflichtig</Label>
                        </div>

                        {subjectedToSalesTax ? (
                            <>
                                <div className="lg:block hidden"></div>
                                <div>
                                    <Label>Mehrwertsteuersatz</Label>
                                    <Input type="number" value={data.sales_tax} onChange={(e) => setData('sales_tax', Number(e.target.value))} />
                                    <InputError message={errors.sales_tax} />
                                </div>
                            </>
                        ) : (
                            ''
                        )}

                        {subjectedToSalesTax ? (
                            <>
                                <div className="lg:block hidden"></div>
                                <div>
                                    <Label>USt-IdNr.</Label>
                                    <Input type="text" value={data.tax_number} onChange={(e) => setData('tax_number', e.target.value)} />
                                    <InputError message={errors.tax_number} />
                                </div>
                            </>
                        ) : (
                            ''
                        )}

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
