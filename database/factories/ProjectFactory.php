<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Lottery;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => Client::inRandomOrder()->first()?->id
                ?? Client::factory()->create()->id,
            'name' => $this->faker->company(),
            'description' => $this->faker->text(50),
            'hourly_rate' => rand(0.25, 50.00),
            'starts_at' => $this->faker->date(),
            'ends_at' => Lottery::odds(50, 100)->choose()
                ? $this->faker->date(max: now()->addYear())
                : null,
            'tech_stack' => Lottery::odds(50, 100)->choose()
                ? 'VILT'
                : 'RILT',
            'auto_generate_amount' => 30,
            'auto_generate_invoice' => true,
            'created_at' => $this->faker->dateTimeBetween(now()->subYear(), now()),
        ];
    }
}
