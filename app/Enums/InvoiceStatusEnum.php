<?php

namespace App\Enums;

enum InvoiceStatusEnum
{
    case DRAFT;
    case OPEN;
    /**
     * This status is given to an invoice after it has been automatically created,
     * to indicate that it needs to be checked before being sent to the client.
     */
    case UNDER_REVIEW;
    /**
     * This status is assigned to an invoice once it has been manually verified.
     */
    case APPROVED;
    case SENT;
    case PAID;
    case OVERDUE;
}
