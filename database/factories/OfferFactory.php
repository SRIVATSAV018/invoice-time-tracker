<?php

namespace Database\Factories;

use App\Enums\OfferStatusEnum;
use App\Models\Client;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Offer>
 */
class OfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $client = Client::inRandomOrder()->first() ?? Client::factory()->create();
        $project = Project::inRandomOrder()->first() ?? Project::factory()->create();

        return [
            'client_id' => $client->id,
            'project_id' => $project->id,
            'status' => array_rand([
                OfferStatusEnum::DRAFT->name => OfferStatusEnum::DRAFT->name,
                OfferStatusEnum::SENT->name => OfferStatusEnum::SENT->name,
                OfferStatusEnum::ACCEPTED->name => OfferStatusEnum::ACCEPTED->name,
                OfferStatusEnum::REJECTED->name => OfferStatusEnum::REJECTED->name,
                OfferStatusEnum::EXPIRED->name => OfferStatusEnum::EXPIRED->name
            ]),
            'client_company' => $client->company_name,
            'client_contact_person' => $client->contact_person,
            'client_contact_person_salutation' => $client->contact_person_salutation,
            'client_contact_person_gender' => $client->contact_person_gender,
            'client_street' => $client->address_line1,
            'client_postal_code' => $client->postal_code,
            'client_city' => $client->city,
            'client_country' => $client->country,
            'client_tax_number' => $client->tax_number,
            'project_name' => $project->name,
            'project_description' => $this->faker->text(),
            'net_total' => 0,
            'tax_rate' => 0,
            'tax_total' => 0,
            'gross_total' => 0,
            'valid_until' => now()->addDays(14),
            'created_at' => $this->faker->dateTimeBetween(now()->subYear(), now()),
        ];
    }

    /**
     * Indicate that the offer email has been sent.
     */

    public function sent(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'sent_at' => now()->addMinute(),
                'status' => OfferStatusEnum::SENT->name
            ];
        });
    }
}
