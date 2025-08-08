<?php

use App\Enums\OfferStatusEnum;
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
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('offer_number')
                ->nullable()
                ->unique()
                ->index();
            $table->foreignId('client_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('project_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->enum('status', [
                OfferStatusEnum::DRAFT->name,
                OfferStatusEnum::SENT->name,
                OfferStatusEnum::ACCEPTED->name,
                OfferStatusEnum::REJECTED->name,
                OfferStatusEnum::EXPIRED->name
            ]);

            // Client information
            $table->string('client_company');
            $table->string('client_street');
            $table->string('client_postal_code');
            $table->string('client_city');
            $table->string('client_country');
            $table->string('client_tax_number');

            $table->string('project_name');

            $table->text('notes')
                ->nullable();

            $table->decimal('net_total', 10, 2);
            $table->decimal('tax_rate', 10, 2);
            $table->decimal('tax_total', 10, 2);
            $table->decimal('gross_total', 10, 2);
            $table->text('pdf_url')
                ->nullable();

            $table->string('accepted_by_ip')
                ->nullable();

            $table->date('valid_until');
            $table->timestamp('sent_at')
                ->nullable();
            $table->timestamp('accepted_at')
                ->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
