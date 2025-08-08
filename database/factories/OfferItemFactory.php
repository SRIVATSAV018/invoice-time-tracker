<?php

namespace Database\Factories;

use App\Models\Offer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OfferItem>
 */
class OfferItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = rand(3, 10);
        $unit_price = rand(65.00, 85.00);

        return [
            'offer_id' => Offer::factory()->create()->id,
            'unit' => 'Std.',
            'description' => $this->faker->text(100),
            'quantity' => $quantity,
            'unit_price' => $unit_price,
            'total' => $quantity * $unit_price,
            'created_at' => $this->faker->dateTimeBetween(now()->subYear(), now()),
        ];
    }
}
