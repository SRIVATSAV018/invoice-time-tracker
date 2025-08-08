<?php

use App\Models\CompanyDetails;
use App\Models\User;
use App\Services\ConfigurationService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use function Pest\Laravel\actingAs;

it('ersetzt ein bestehendes Logo durch ein neues und aktualisiert den Pfad', function () {
    Storage::fake('public');
    // User + Firmendaten mit vorhandenem Logo
    $user = User::factory()->create();
    $company = CompanyDetails::factory()->for($user)->create();
    // Altes Logo simulieren
    $oldPath = "users/{$user->id}/logos/old_logo.png";
    Storage::disk('public')->put($oldPath, 'dummy-content');
    $company->update(['logo_path' => $oldPath]);
    // Neues Logo-File erzeugen
    $newFile = UploadedFile::fake()->image('new_logo.jpg');
    actingAs($user);
    app(ConfigurationService::class)->replaceLogo($newFile);
    // Alte Datei sollte gelöscht sein
    Storage::disk('public')->assertMissing($oldPath);
    // Neue Datei wurde gespeichert und Pfad in DB aktualisiert
    $freshCompany = $company->fresh();
    expect($freshCompany->logo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($freshCompany->logo_path);
    // Pfad sollte dem users/{id}/logos Verzeichnis entsprechen
    expect($freshCompany->logo_path)->toStartWith("users/{$user->id}/logos/")
        ->and(pathinfo($freshCompany->logo_path, PATHINFO_EXTENSION))->toBe('jpeg');
});

