import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, usePage } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { SharedData } from '@/types';

interface Form {
    payment_goal: number;
}

export default function MyPayments({ className }: { className: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, processing, errors, recentlySuccessful, post, isDirty, clearErrors } = useForm<Required<Form>>({
        payment_goal: auth.user.settings.payment_goal
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('configuration.submit.payments'), {
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
                        Meine Zahlungen
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => submit(e)} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <Label>
                                Zahlungsziel (in Tagen) <span className="text-red-600">*</span>
                            </Label>
                            <Input type="number" value={data.payment_goal} onChange={(e) => setData('payment_goal', Number(e.target.value))} />
                            <small>
                                Das Zahlungsziel bestimmt, wann ein Kunde die Rechnungen zu zahlen hat.
                            </small>
                            <InputError message={errors.payment_goal} />
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
