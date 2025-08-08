<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TimeEntry>
 */
class TimeEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startedAt = $this->faker->dateTime();
        $endedAt = $this->faker->dateTime();

        return [
            'project_id' => Project::inRandomOrder()->first()?->id
                ?? Project::factory()->create()->id,
            'user_id' => User::inRandomOrder()->first()?->id
                ?? User::factory()->create()->id,
            'description' => $this->faker->text(50),
            'started_at' => $startedAt,
            'ended_at' => $endedAt,
            'duration_hours' => $startedAt->diff($endedAt)->i,
            'created_at' => $this->faker->dateTimeBetween(now()->subYear(), now()),
        ];
    }
}
