<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('company_details', function (Blueprint $table) {
            $table->id();
            $table->string('name')
                ->nullable()
                ->comment('Name des Unternehmens');
            $table->string('address_line1')
                ->nullable()
                ->comment('Addresszeile 1');
            $table->string('address_line2')
                ->nullable()
                ->comment('Addresszeile 2 (optional)');
            $table->string('postal_code', 20)
                ->nullable();
            $table->string('city')
                ->nullable()
                ->comment('Stadt');
            $table->string('country')
                ->nullable()
                ->comment('Land');
            $table->string('email')
                ->nullable()
                ->comment('E-Mail Adresse');
            $table->string('phone')
                ->nullable()
                ->nullable()
                ->comment('Telefonnummer');
            $table->string('tax_number')
                ->nullable()
                ->comment('Steuernummer');

            $table->string('currency')
                ->nullable()
                ->comment('Währung');
            $table->string('vat')
                ->nullable()
                ->comment('Mehrwertsteuer');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_details');
    }
};
