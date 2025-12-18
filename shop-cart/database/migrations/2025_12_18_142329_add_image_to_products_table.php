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
        Schema::table('products', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->string('image_path')->nullable()->after('stock_quantity');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (\Illuminate\Database\Schema\Blueprint $table) {
            $table->dropColumn('image_path');
        });
    }

};
