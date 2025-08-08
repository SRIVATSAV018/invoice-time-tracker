<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InvoicePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Invoice $invoice): bool
    {
        return $this->userCheck($user, $invoice);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Invoice $invoice): bool
    {
        return is_null($invoice->deleted_at) && $this->userCheck($user, $invoice);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Invoice $invoice): bool
    {
        return is_null($invoice->deleted_at) && $this->userCheck($user, $invoice);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Invoice $invoice): bool
    {
        return is_object($invoice->deleted_at) && $this->userCheck($user, $invoice);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Invoice $invoice): bool
    {
        // An invoice can be deleted after a total of 10 years.
        return $this->userCheck($user, $invoice) && $invoice->issued_at->copy()->addYears(10) < now();
    }

    public function preview(User $user, Invoice $invoice): bool
    {
        return $invoice->does_pdf_exist && $this->userCheck($user, $invoice);
    }

    public function sendToClient(User $user, Invoice $invoice): bool
    {
        return $invoice->does_pdf_exist && $this->userCheck($user, $invoice);
    }

    private function userCheck(User $user, Invoice $invoice): bool
    {
        $invoice->loadMissing('client.user');

        return $invoice->client->user->id === $user->id;
    }
}
