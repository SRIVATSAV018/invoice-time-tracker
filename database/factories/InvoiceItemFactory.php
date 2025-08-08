<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InvoiceItem>
 */
class InvoiceItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = rand(3, 25);
        $unitPrice = rand(65.00, 85.00);

        return [
            'invoice_id' => Invoice::inRandomOrder()->first()?->id ?? Invoice::factory()->create()->id,
            'unit' => 'Std.',
            'unit_price' => $unitPrice,
            'description' => $this->faker->text(50),
            'quantity' => $quantity,
            'total' => $quantity * $unitPrice,
            'created_at' => $this->faker->dateTimeBetween(now()->subYear(), now()),
        ];
    }
}
