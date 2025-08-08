<?php

namespace App\Enums;

enum OfferStatusEnum
{
    case DRAFT;
    case SENT;
    case ACCEPTED;
    case REJECTED;
    case EXPIRED;
}
