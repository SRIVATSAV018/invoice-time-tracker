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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')
                ->constrained()
                ->onDelete('cascade');
            $table->foreignId('project_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->string('invoice_number')->unique();
            $table->date('issued_at');
            $table->date('due_at')->nullable();
            $table->enum('status', [
                InvoiceStatusEnum::DRAFT->name,
                InvoiceStatusEnum::SENT->name,
                InvoiceStatusEnum::PAID->name,
                InvoiceStatusEnum::OVERDUE->name
            ])
                ->default(InvoiceStatusEnum::DRAFT->name);
            $table->string('client_company');
            $table->string('client_address_line1');
            $table->string('client_postal_code');
            $table->string('client_city');
            $table->string('client_country');

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
