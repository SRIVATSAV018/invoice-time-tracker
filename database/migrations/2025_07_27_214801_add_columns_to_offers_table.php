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
            $table->text('project_description')
                ->after('project_name');
            $table->date('service_period_start')
                ->nullable()
                ->after('accepted_at');
            $table->date('service_period_end')
                ->nullable()
                ->after('service_period_start');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropColumn('project_description');
            $table->dropColumn('service_period_start');
            $table->dropColumn('service_period_end');
        });
    }
};
