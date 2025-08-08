import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { Banknote, Building, Euro, ShoppingBasket } from 'lucide-react';
import MyCompany from '@/pages/configuration/partials/my-company';
import { useState } from 'react';
import MyBank from '@/pages/configuration/partials/my-bank';
import MyTaxesAndCurrency from '@/pages/configuration/partials/my-taxes-and-currency';
import MyPayments from '@/pages/configuration/partials/my-payments';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Konfiguration',
        href: '/configuration'
    }
]

export default function Index() {
    const [selection, setSelection] = useState<string>('company');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Heading title="Konfiguration" />

                <div className="grid xl:grid-cols-12 gap-4">
                    <div className="xl:col-span-4">
                        <div className="border rounded-xl flex flex-col">
                            <button onClick={() => setSelection('company')}
                                    className={`px-3 py-4 text-sm font-medium ${selection === 'company' ? 'text-blue-400 bg-blue-400/10' : ''} rounded-t-xl inline-flex items-center gap-2 cursor-pointer`}>
                                <Building width={18} />
                                Mein Unternehmen
                            </button>
                            <button onClick={() => setSelection('bank')}
                                 className={`px-3 py-4 text-sm font-medium ${selection === 'bank' ? 'text-blue-400 bg-blue-400/10' : ''} inline-flex items-center gap-2 cursor-pointer`}>
                                <Banknote width={18} />
                                Meine Bankverbindung
                            </button>
                            <button onClick={() => setSelection('taxes_currency')}
                                 className={`px-3 py-4 text-sm font-medium ${selection === 'taxes_currency' ? 'text-blue-400 bg-blue-400/10' : ''} inline-flex items-center gap-2 cursor-pointer`}>
                                <Euro width={18} />
                                Meine Steuern & Währung
                            </button>
                            <button onClick={() => setSelection('payments')}
                                    className={`px-3 py-4 text-sm font-medium ${selection === 'payments' ? 'text-blue-400 bg-blue-400/10' : ''} rounded-b-xl inline-flex items-center gap-2 cursor-pointer`}>
                                <ShoppingBasket width={18} />
                                Meine Zahlungen
                            </button>
                        </div>
                    </div>

                    {selection === 'company' ? <MyCompany className="xl:col-span-8" /> : null}
                    {selection === 'bank' ? <MyBank className="xl:col-span-8" /> : null}
                    {selection === 'taxes_currency' ? <MyTaxesAndCurrency className="xl:col-span-8" /> : null}
                    {selection === 'payments' ? <MyPayments className="xl:col-span-8" /> : null}
                </div>
            </div>
        </AppLayout>
    );
}
