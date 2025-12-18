<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        return Product::query()
            ->orderBy('id')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->price,
                'stock_quantity' => $p->stock_quantity,
                'image_url' => $p->image_path ? Storage::url($p->image_path) : null,
            ]);
    }
}
