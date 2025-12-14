<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::upsert([
            ['name' => 'Keyboard', 'price' => 4999, 'stock_quantity' => 12],
            ['name' => 'Mouse', 'price' => 1999, 'stock_quantity' => 7],
            ['name' => 'Headphones', 'price' => 8999, 'stock_quantity' => 4],
            ['name' => 'Monitor', 'price' => 15999, 'stock_quantity' => 2],
        ], ['name'], ['price', 'stock_quantity']);
    }
}
