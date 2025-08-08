<?php

namespace App\Notifications;

use App\Models\Offer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Attachment;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Storage;

class OfferAcceptedConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Offer $offer,
    )
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
        $this->offer->loadMissing([
            'client.user',
            'project'
        ]);

        $mailMessage = (new MailMessage)
            ->subject("Angebotsbestätigung - Ihr Projekt mit " . $this->offer->client->user->settings?->name)
            ->view('mails.offer-confirmation', [
                'offer' => $this->offer,
            ]);

        if (Storage::disk('local')->exists("offers/{$this->offer->getFileName()}")) {
            $mailMessage->attach(Attachment::fromStorageDisk('local', "offers/{$this->offer->getFileName()}"));
        }

        return $mailMessage;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
