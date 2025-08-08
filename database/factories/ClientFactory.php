<?php

namespace Database\Factories;

use App\Enums\GenderEnum;
use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Client>
 */
class ClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory()->create()->id,
            'company_name' => $this->faker->company(),
            'contact_person' => $this->faker->name(),
            'contact_person_salutation' => 'dr',
            'contact_person_gender' => GenderEnum::MALE->name,
            'email' => $this->faker->email(),
            'phone' => $this->faker->phoneNumber(),
            'address_line1' => $this->faker->streetAddress(),
            'postal_code' => $this->faker->postcode(),
            'city' => $this->faker->city(),
            'country' => $this->faker->country(),
            'tax_number' => 'DE00000000',
            'created_at' => $this->faker->dateTimeBetween(now()->subYear(), now()),
        ];
    }
}
