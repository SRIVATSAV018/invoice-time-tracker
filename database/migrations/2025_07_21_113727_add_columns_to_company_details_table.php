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
        Schema::table('company_details', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->after('id')
                ->constrained()
                ->cascadeOnDelete();

            $table->integer('vat')
                ->nullable()
                ->change()
                ->after('tax_number');

            $table->string('bank_name')
                ->nullable()
                ->after('vat');
            $table->string('iban', 30)
                ->nullable()
                ->after('bank_name');
            $table->string('bic')
                ->nullable()
                ->after('iban');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_details', function (Blueprint $table) {
            $table->dropForeign('');
            $table->dropColumn('user_id');
            $table->string('vat')->nullable()->change();
            $table->dropColumn('bank_name');
            $table->dropColumn('iban');
            $table->dropColumn('bic');
        });
    }
};
