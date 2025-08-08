import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import CompanyForm from '@/components/company-form';
import CurrencyTaxesForm from '@/components/currency-taxes-form';
import BankForm from '@/components/bank-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Konfiguration',
        href: '/konfiguration',
    },
];

export default function Configuration() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-4">
                <Heading title="Konfiguration" description="Konfiguriere die Seite, passe bestehende Werte an." />

                <div className="space-y-4">
                    <CompanyForm />
                    <BankForm />
                    <CurrencyTaxesForm />
                </div>
            </div>
        </AppLayout>
    );
}
