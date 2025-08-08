<?php

use App\Enums\GenderEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->enum('contact_person_salutation', array_keys(config('salutations')))
                ->after('contact_person')
                ->nullable();
            $table->enum('contact_person_gender', [
                GenderEnum::MALE->name,
                GenderEnum::FEMALE->name
            ])
                ->after('contact_person_salutation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('contact_person_salutation');
            $table->dropColumn('contact_person_gender');
        });
    }
};
