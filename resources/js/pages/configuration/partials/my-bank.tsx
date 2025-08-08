import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { FormEventHandler } from 'react';
import { SharedData } from '@/types';

interface Form {
    bank_name: string;
    account_holder: string;
    iban: string;
    bic: string;
}

export default function MyBank({ className }: { className: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, processing, recentlySuccessful, errors, isDirty, post, clearErrors } = useForm<Required<Form>>({
        bank_name: auth.user?.settings?.bank_name,
        account_holder: auth.user?.settings?.account_holder,
        iban: auth.user?.settings?.iban,
        bic: auth.user?.settings?.bic
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('configuration.submit.bank-information'), {
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
                        Meine Bankverbindung
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 rounded-lg bg-blue-500/10 mb-4">
                        <h4 className="font-semibold">
                            Hinweis
                        </h4>
                        <p className="text-sm">
                            Ihre Bankverbindung wird in Rechnungen, sowie Mahnungen und Verträgen angezeigt.
                        </p>
                    </div>

                    <form onSubmit={(e) => submit(e)} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <Label>
                                Bankname <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.bank_name} onChange={(e) => setData('bank_name', e.target.value)} placeholder="Sparkasse KoelnBonn" />
                            <InputError message={errors.bank_name} />
                        </div>
                        <div className="lg:block hidden"></div>
                        <div>
                            <Label>
                                Kontoinhaber <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.account_holder} onChange={(e) => setData('account_holder', e.target.value)} placeholder="Max Mustermann" />
                            <InputError message={errors.account_holder} />
                        </div>
                        <div className="lg:block hidden"></div>
                        <div>
                            <Label>
                                IBAN <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.iban} onChange={(e) => setData('iban', e.target.value)} placeholder="DE00 ..." />
                            <InputError message={errors.iban} />
                        </div>
                        <div className="lg:block hidden"></div>
                        <div>
                            <Label>
                                BIC <span className="text-red-600">*</span>
                            </Label>
                            <Input value={data.bic} onChange={(e) => setData('bic', e.target.value)} />
                            <InputError message={errors.bic} />
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
