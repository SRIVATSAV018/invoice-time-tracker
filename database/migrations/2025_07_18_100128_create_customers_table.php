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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')
                ->comment('Firmenname des Kunden');
            $table->string('contact_person')
                ->nullable()
                ->comment('Ansprechpartner (optional)');
            $table->string('email')
                ->comment('E-Mail Adresse (für Rechnungsversand)');
            $table->string('phone', 50)
                ->nullable()
                ->comment('Telefonnummer (optional)');
            $table->string('address_line1')
                ->comment('Straße + Hausnummer');
            $table->string('address_line2')
                ->nullable()
                ->comment('Zusatzinfos (z.B. Etage, Gebäude)');
            $table->string('postal_code', 20)
                ->comment('PLZ');
            $table->string('city', 100)
                ->comment('Ort');
            $table->string('country', 100)
                ->comment('Land (für Rechnungsstellung)');
            $table->string('tax_number')
                ->nullable()
                ->comment('USt-IdNr. / Steuernummer');
            $table->text('notes')
                ->nullable()
                ->comment('Freitext (z.B. Besonderheiten)');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
