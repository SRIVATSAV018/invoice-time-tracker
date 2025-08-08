<?php

use App\Models\CompanyDetails;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use function Pest\Laravel\{actingAs, get, post};

it('redirects guests from configuration routes', function () {
    get(route('configuration.index'))->assertRedirect(route('login'));
    post(route('configuration.submit.company-information'), [])->assertRedirect(route('login'));
    post(route('configuration.submit.currency-taxes'), [])->assertRedirect(route('login'));
    post(route('configuration.submit.bank-information'), [])->assertRedirect(route('login'));
});

it('allows viewing the configuration page with current company details', function () {
    $user = User::factory()->create();
    // Ensure some CompanyDetails exist for the user
    CompanyDetails::factory()->create([
        'user_id' => $user->id
    ]);

    $response = actingAs($user)->get(route('configuration.index'));
    $response->assertStatus(200);  // the company name is displayed
});

it('updates company information with valid data', function () {
    Storage::fake('public');
    $user = User::factory()->create(['email_verified_at' => now()]);
    $data = [
        'name'          => 'New Company Name',
        'address_line1' => '123 New Street',
        'postal_code'   => '98765',
        'city'          => 'New City',
        'country'       => 'Wonderland',
        'email'         => 'company@example.com',
        'phone'         => '+49 123 12345678',
        'logo'          => UploadedFile::fake()->image('logo.png'),
        'website'       => 'www.example.com'
    ];
    $response = actingAs($user)->post(route('configuration.submit.company-information'), $data);
    $response->assertStatus(200);
    // CompanyDetails record should be created or updated with given data
    $company = $user->settings;
    expect($company)->not->toBeNull()
        ->and($company->name)->toBe('New Company Name')
        ->and($company->city)->toBe('New City')
        ->and($company->logo)->not->toBeEmpty();
    // Logo file should have been stored and logo_path set
    Storage::disk('public')->assertExists($company->logo);
});

it('validates company information input', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    // Omit required fields like name and provide invalid email
    $response = actingAs($user)->post(route('configuration.submit.company-information'), [
        'name'  => '',
        'email' => 'not-an-email'
    ]);
    $response->assertSessionHasErrors(['name', 'email']);
    // CompanyDetails should not be created
    expect($user->companyDetails()->exists())->toBeFalse();
});

it('updates currency and tax settings with valid data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $data = [
        'currency'     => 'EUR',
        'subject_to_sales_tax'          => true,
        'sales_tax' => 19,
        'tax_number' => 'DE00'
    ];
    $response = actingAs($user)->post(route('configuration.submit.currency-taxes'), $data);
    $response->assertStatus(200);
    $company = $user->settings;
    expect($company)->not->toBeNull()
        ->and($company->currency)->toBe('EUR')
        ->and($company->sales_tax)->toBe(19);
});

it('validates currency and tax input', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    // Missing currency and out-of-range VAT
    $response = actingAs($user)->post(route('configuration.submit.currency-taxes'), [
        'currency' => '',
        'subject_to_sales_tax'          => true,
        'sales_tax' => 190,
        'tax_number' => ''
    ]);
    $response->assertSessionHasErrors(['currency', 'sales_tax', 'tax_number']);
    expect($user->companyDetails()->exists())->toBeFalse();
});

it('updates bank information with valid data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $data = [
        'bank_name' => 'Bank Corp',
        'account_holder' => 'John Doe',
        'iban'      => 'DE89370400440532013000',
        'bic'       => 'MARKDEF1100',
    ];
    $response = actingAs($user)->post(route('configuration.submit.bank-information'), $data);
    $response->assertStatus(200);
    $company = $user->settings;
    expect($company)->not->toBeNull()
        ->and($company->bank_name)->toBe('Bank Corp')
        ->and($company->iban)->toBe('DE89370400440532013000')
        ->and($company->bic)->toBe('MARKDEF1100');
});

it('validates bank information input', function () {
    $user = User::factory()->create();
    // Missing required fields
    $response = actingAs($user)->post(route('configuration.submit.bank-information'), [
        'bank_name' => '',
        'account_holder' => '',
        'iban'      => '',
        'bic'       => ''
    ]);
    $response->assertSessionHasErrors(['bank_name', 'account_holder', 'iban', 'bic']);
    expect($user->companyDetails()->exists())->toBeFalse();
});

