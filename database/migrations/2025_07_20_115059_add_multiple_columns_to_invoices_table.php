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
        Schema::table('invoices', function (Blueprint $table) {
            $table->timestamp('email_send_scheduled_at')
                ->nullable()
                ->after('notes');
            $table->timestamp('email_sent_at')->nullable()
                ->after('email_send_scheduled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('email_send_scheduled_at');
            $table->dropColumn('email_sent_at');
        });
    }
};
