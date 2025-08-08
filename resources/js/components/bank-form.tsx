import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { CompanyDetails, SharedData } from '@/types';

interface Form {
    bank_name: string;
    iban: string;
    bic: string;
}

interface Props extends SharedData {
    companyDetails: CompanyDetails
}

export default function BankForm() {
    const { companyDetails } = usePage<Props>().props;

    const { data, setData, processing, recentlySuccessful, errors, post } = useForm<Required<Form>>({
        bank_name: companyDetails?.bank_name,
        iban: companyDetails?.iban,
        bic: companyDetails?.bic,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('configuration.submit.bank-information'), {
            preserveScroll: true
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Bankinformationen</CardTitle>
            </CardHeader>
            <form onSubmit={(e) => submit(e)}>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <Label>
                                Bankname <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.bank_name} onChange={(e) => setData('bank_name', e.target.value)} placeholder="Beispielbank" />
                            <InputError message={errors.bank_name} />
                        </div>
                        <div className="hidden lg:block"></div>
                        <div>
                            <Label>
                                IBAN <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.iban} onChange={(e) => setData('iban', e.target.value)} placeholder="DE00000000000000000000" />
                            <InputError message={errors.iban} />
                        </div>
                        <div className="hidden lg:block"></div>
                        <div>
                            <Label>
                                BIC <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.bic} onChange={(e) => setData('bic', e.target.value)} placeholder="XXXXXXXXXXX" />
                            <InputError message={errors.bic} />
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
