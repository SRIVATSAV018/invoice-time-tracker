<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Attachment;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class SendInvoiceToClientNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Invoice $invoice)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $this->invoice->loadMissing(['client', 'project']);

        $prices = Invoice::calculate($this->invoice);

        $total = number_format($prices['total'], 2, ',', '.');

        $greeting = !is_null($this->invoice->client->contact_person)
            ? "Sehr geehrte/r " . $this->invoice->client->contact_person
            : "Sehr geehrte Damen und Herren,";

        $mailMessage = new MailMessage();

        if ($this->invoice->does_pdf_exist) {
            $mailMessage->attachMany([
                Attachment::fromStorageDisk('local', $this->invoice->pdf_path)
            ]);
        }

        return $mailMessage
            ->view('pdfs.invoice-mails', [
                'invoice' => $this->invoice
            ])
            ->subject("Ihre Rechnung zum Projekt {$this->invoice->project->name}")
            ->greeting($greeting)
            ->line("Anbei erhalten Sie die Rechnung für das Projekt \"{$this->invoice->project->name}\" als PDF im Anhang.")
            ->line("Bitte überweisen Sie den offenen Betrag in Höhe von {$total} € bis spätestens zum {$this->invoice->due_at->format('d.m.Y')} auf das in der Rechnung angegebene Konto.")
            ->line("Sollten Sie Fragen zur Rechnung oder zum Projektverlauf haben, stehe ich Ihnen selbstverständlich jederzeit gerne zur Verfügung.")
            ->line("Ich danke Ihnen für die angenehme Zusammenarbeit und freue mich auf weitere gemeinsame Projekte.")
            ->salutation("Marco Middeldorff");
    }
}
