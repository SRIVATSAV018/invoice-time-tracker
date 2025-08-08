<?php

namespace App\DataTransferObjects;

class IncomeStatisticsDTO extends BaseDTO
{
    public float $estimated_income = 0;
    public float $estimated_taxes = 0;

    public function fromArray(array $data): IncomeStatisticsDTO
    {
        $dto = new self();

        $dto->estimated_income = data_get($data, 'estimated_income');
        $dto->estimated_taxes = data_get($data, 'estimated_taxes');

        return $dto;
    }
}
