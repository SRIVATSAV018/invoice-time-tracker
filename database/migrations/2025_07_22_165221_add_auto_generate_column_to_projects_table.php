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
        Schema::table('projects', function (Blueprint $table) {
            $table->boolean('auto_generate_invoice')
                ->after('tech_stack')
                ->default(false);
            $table->integer('auto_generate_amount')
                ->after('auto_generate_invoice');

            $table->timestamp('last_auto_generated_invoice')
                ->after('auto_generate_amount')
                ->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('auto_generate_invoice');
            $table->dropColumn('auto_generate_amount');
            $table->dropColumn('last_auto_generated_invoice');
        });
    }
};
