<?php

use App\Enums\InvoiceStatusEnum;
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
            $table->enum('status', [
                InvoiceStatusEnum::DRAFT->name,
                InvoiceStatusEnum::OPEN->name,
                InvoiceStatusEnum::UNDER_REVIEW->name,
                InvoiceStatusEnum::APPROVED->name,
                InvoiceStatusEnum::SENT->name,
                InvoiceStatusEnum::PAID->name,
                InvoiceStatusEnum::OVERDUE->name
            ])
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->enum('status', [
                InvoiceStatusEnum::DRAFT->name,
                InvoiceStatusEnum::SENT->name,
                InvoiceStatusEnum::PAID->name,
                InvoiceStatusEnum::OVERDUE->name
            ])
                ->change();
        });
    }
};
