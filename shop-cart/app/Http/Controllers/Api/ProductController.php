<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        return Product::query()
            ->select(['id', 'name', 'price', 'stock_quantity'])
            ->orderBy('name')
            ->get();
    }
}
