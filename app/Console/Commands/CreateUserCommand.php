<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateUserCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:user';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create\'s a new user.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = $this->ask('Wie lautet dein Name?');
        $email = $this->ask('Wie lautet deine E-Mail Adresse?');
        $password = $this->secret('Wie lautet dein Passwort?');

        if (Str::length($password) < 8) {
            $this->fail("Das Passwort muss mind. 8 Zeichen beinhalten.");
        }

        if (User::whereEmail($email)->exists()) {
            $this->fail("Es existiert bereits ein Nutzer mit der E-Mail $email");
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => $password
        ]);

        $this->info("Der Benutzer $name ($email) wurde erfolgreich erstellt.");
        return self::SUCCESS;
    }
}
