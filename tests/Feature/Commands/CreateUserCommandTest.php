<?php

test("can create new users", function () {
    $this->artisan('make:user')
        ->expectsQuestion(
            question: 'Wie lautet dein Name?',
            answer: 'John Doe'
        )->expectsQuestion(
            question: 'Wie lautet deine E-Mail Adresse?',
            answer: 'user@example.com'
        )->expectsQuestion(
            question: 'Wie lautet dein Passwort?',
            answer: fake()->password(8)
        );

    $this->assertDatabaseHas((new \App\Models\User())->getTable(), [
        'name' => 'John Doe',
        'email' => 'user@example.com',
    ]);
});

test('cannot create user with a password less than 8 characters', function () {
    $this->assertDatabaseCount((new \App\Models\User())->getTable(), 0);

    $this->artisan('make:user')
        ->expectsQuestion(
            question: 'Wie lautet dein Name?',
            answer: 'John Doe'
        )->expectsQuestion(
            question: 'Wie lautet deine E-Mail Adresse?',
            answer: 'user@example.com'
        )->expectsQuestion(
            question: 'Wie lautet dein Passwort?',
            answer: fake()->password(maxLength: 3)
        )->assertFailed();

    $this->assertDatabaseCount((new \App\Models\User())->getTable(), 0);
});

test('cannot create duplicate user', function () {
    \App\Models\User::factory()->create([
        'email' => 'user@example.com'
    ]);
    $this->artisan('make:user')
        ->expectsQuestion(
            question: 'Wie lautet dein Name?',
            answer: 'John Doe'
        )->expectsQuestion(
            question: 'Wie lautet deine E-Mail Adresse?',
            answer: 'user@example.com'
        )->expectsQuestion(
            question: 'Wie lautet dein Passwort?',
            answer: fake()->password(8)
        )->assertFailed();

    $this->assertDatabaseCount((new \App\Models\User())->getTable(), 1);
});
