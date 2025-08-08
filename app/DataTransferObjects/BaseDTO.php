<?php

namespace App\DataTransferObjects;

abstract class BaseDTO
{
    abstract public function fromArray(array $data): self;
}
