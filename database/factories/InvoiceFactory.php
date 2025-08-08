<?php

namespace Database\Factories;

use App\Enums\InvoiceStatusEnum;
use App\Models\Client;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Lottery;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $issuedAt = $this->faker->date();

        return [
            'client_id' => Client::inRandomOrder()->first()?->id ?? Client::factory()->create()->id,
            'project_id' => Project::inRandomOrder()->first()?->id ?? Project::factory()->create()->id,
            'issued_at' => $issuedAt,
            'due_at' => now()->addMonth(),
            'status' => $this->faker->randomElement([
                InvoiceStatusEnum::DRAFT->name,
                InvoiceStatusEnum::OPEN->name,
                InvoiceStatusEnum::SENT->name,
                InvoiceStatusEnum::PAID->name,
                InvoiceStatusEnum::OVERDUE->name,
                InvoiceStatusEnum::UNDER_REVIEW->name,
                InvoiceStatusEnum::APPROVED->name,
            ]),
            'is_pdf_generating' => false,
            'client_company' => $this->faker->company(),
            'client_address_line1' => $this->faker->streetAddress(),
            'client_postal_code' => $this->faker->postcode(),
            'client_city' => $this->faker->city(),
            'client_country' => $this->faker->country(),
            'service_period_start' => now()->startOfMonth(),
            'service_period_end' => rand(0, 100) > 50
                ? now()->endOfMonth()
                : null,
            'created_at' => $this->faker->dateTimeBetween(now()->subYear(), now()),
        ];
    }
}
