<?php

namespace App\DataTransferObjects;

class UserSettingsDTO extends BaseDTO
{
    public string|null $logo;
    public string|null $name;
    public string|null $address_line1;
    public string|null $address_line2;
    public string|null $postal_code;
    public string|null $city;
    public string|null $country;
    public string|null $email;
    public string|null $phone;
    public string|null $website;

    public string|null $bank_name;
    public string|null $account_holder;
    public string|null $iban;
    public string|null $bic;

    public string|null $currency;
    public bool|null $subject_to_sales_tax;
    public int|null $sales_tax;
    public string|null $tax_number;

    public int|null $payment_goal;

    public function fromArray(array|\stdClass $data): UserSettingsDTO
    {
        $dto = new self();

        $dto->logo = data_get($data, 'logo');
        $dto->name = data_get($data, 'name');
        $dto->address_line1 = data_get($data, 'address_line1');
        $dto->address_line2 = data_get($data, 'address_line2');
        $dto->postal_code = data_get($data, 'postal_code');
        $dto->city = data_get($data, 'city');
        $dto->country = data_get($data, 'country');
        $dto->email = data_get($data, 'email');
        $dto->phone = data_get($data, 'phone');
        $dto->website = data_get($data, 'website');
        $dto->bank_name = data_get($data, 'bank_name');
        $dto->account_holder = data_get($data, 'account_holder');
        $dto->iban = data_get($data, 'iban');
        $dto->bic = data_get($data, 'bic');
        $dto->currency = data_get($data, 'currency');
        $dto->subject_to_sales_tax = data_get($data, 'subject_to_sales_tax');
        $dto->sales_tax = data_get($data, 'sales_tax');
        $dto->tax_number = data_get($data, 'tax_number');
        $dto->payment_goal = data_get($data, 'payment_goal');

        return $dto;
    }

    public function toArray(): array
    {
        return [
            'logo' => $this->logo,
            'name' => $this->name,
            'address_line1' => $this->address_line1,
            'address_line2' => $this->address_line2,
            'postal_code' => $this->postal_code,
            'city' => $this->city,
            'country' => $this->country,
            'email' => $this->email,
            'phone' => $this->phone,
            'website' => $this->website,
            'bank_name' => $this->bank_name,
            'account_holder' => $this->account_holder,
            'iban' => $this->iban,
            'bic' => $this->bic,
            'currency' => $this->currency,
            'subject_to_sales_tax' => $this->subject_to_sales_tax,
            'sales_tax' => $this->sales_tax,
            'tax_number' => $this->tax_number,
            'payment_goal' => $this->payment_goal,
        ];
    }
}
