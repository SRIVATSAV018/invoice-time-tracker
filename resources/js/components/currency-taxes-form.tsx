import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompanyDetails, SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

type CurrencyTaxesForm = {
    currency: string;
    vat: number;
    payment_term: number;
};

interface Props extends SharedData {
    companyDetails: CompanyDetails;
}

export default function CurrencyTaxesForm() {
    const { companyDetails } = usePage<Props>().props;

    useEffect(() => {
        setData('currency', companyDetails?.currency);
        setData('vat', Number(companyDetails?.vat));
    }, [companyDetails]);

    const { data, setData, errors, processing, recentlySuccessful, post } = useForm<Required<CurrencyTaxesForm>>({
        currency: 'eur',
        vat: 19,
        payment_term: 14
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('configuration.submit.currency-taxes'), {
            preserveScroll: true,
            only: ['companyDetails'],
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Währung & Steuern</CardTitle>
            </CardHeader>
            <form onSubmit={(e) => submit(e)}>
                <CardContent>
                    <div className="grid auto-rows-min grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <Label>
                                Währung <span className="text-red-500">*</span>
                            </Label>
                            <Select value={data.currency} onValueChange={(e) => setData('currency', e)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Währung auswählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="eur">Euro</SelectItem>
                                        <SelectItem value="usd">USD</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.currency} />
                        </div>

                        <div>
                            <Label>
                                Mehrwertsteuer <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.vat} onChange={(e) => setData('vat', e.target.value)} />
                            <InputError message={errors.vat} />
                        </div>

                        <div>
                            <Label>
                                Zahlungsziel <span className="text-red-600">*</span>
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input type="number" value={data.payment_term} onChange={(e) => setData('payment_term', Number(e.target.value))} />
                                <p>Tag(e)</p>
                            </div>
                            <InputError message={errors.payment_term} />
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
