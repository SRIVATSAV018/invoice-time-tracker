import { Offer } from '@/types';
import GuestLayout from '@/layouts/guest-layout';


export default function Accepted({ offer }: { offer: Offer }) {
    return (
        <GuestLayout title="Angebot angenommen" description="Sie haben das Angebot erfolgreich abgeschickt.">
            <p>
                Sehr {offer.client_contact_person_gender === 'MALE' ? 'geehrter' : 'geehrte'} {offer.client_contact_person_gender === 'MALE' ? 'Herr' : 'Frau'} {offer.client_contact_person},
            </p>
            <p className="font-bold mt-4">
                Vielen Dank für Ihre Angebotsannahme!
            </p>
            <p className="mt-4">
                Wir haben Ihre Zustimmung zum Angebot für das Projekt "{offer.project_name}" unter folgender Angebotsnr. "{offer.offer_number}" erfolgreich erhalten.
            </p>
            <p className="mt-4">
                Eine Bestätigungsemail mit allen relevanten Details wurde an Ihre E-Mail Adresse [{offer.client?.email}] gesendet.
            </p>

            <p className="mt-8 font-bold">
                Was passiert als nächstes?
            </p>

            <p className="mt-4">
                In Kürze werde ich mich mit Ihnen in Verbindung setzen, um die nächsten Schritte zur Umsetzung des Projekts abzustimmen.
            </p>

            <p className="mt-8">
                Sollten Sie Fragen oder Ergänzungen haben, können Sie sich jederzeit unter <a href={`mailto:${offer.client?.user?.settings?.email}`} className="text-blue-500">{offer.client?.user?.settings?.email}</a> oder telefonisch unter {offer.client?.user?.settings?.phone} bei mir melden.
            </p>

            <p className="font-bold mt-4">
                Ich freue mich auf die Zusammenarbeit!
            </p>

            <p className="mt-6">
                Freundliche Grüße, <br/>
                {offer.client?.user?.settings?.name} <br/>
                <span className="text-sm">Freiberuflicher Webentwickler</span> <br/>
                <span className="text-sm">
                    {offer.client?.user?.settings?.email}
                </span> <br/>
                <span className="text-sm">
                    {offer.client?.user?.settings?.website}
                </span>
            </p>
        </GuestLayout>
    );
}
