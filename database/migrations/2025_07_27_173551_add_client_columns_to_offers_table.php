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
        Schema::table('offers', function (Blueprint $table) {
            $table->string('client_contact_person')
                ->nullable()
                ->after('client_company');
            $table->enum('client_contact_person_gender', [
                \App\Enums\GenderEnum::MALE->name,
                \App\Enums\GenderEnum::FEMALE->name
            ])->after('client_contact_person');
            $table->enum('client_contact_person_salutation', array_keys(config('salutations')))
                ->after('client_contact_person_gender')
                ->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn('client_contact_person');
            $table->dropColumn('client_contact_person_gender');
            $table->dropColumn('client_contact_person_salutation');
        });
    }
};
