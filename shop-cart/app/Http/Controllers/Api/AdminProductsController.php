<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminProductsController extends Controller
{
    // LIST
    public function index()
    {
        return Product::orderBy('id')->get()->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'price' => $p->price,
            'stock_quantity' => $p->stock_quantity,
            'image_url' => $p->image_path ? Storage::url($p->image_path) : null,
        ]);
    }

    // CREATE PUT YOUR CODE HERE
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name' => $request->name,
            'price' => (int) $request->price,
            'stock_quantity' => (int) $request->stock_quantity,
            'image_path' => $imagePath,
        ]);

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
            'stock_quantity' => $product->stock_quantity,
            'image_url' => $imagePath ? Storage::url($imagePath) : null,
        ], 201);
    }

    // UPDATE
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => ['required', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $product->image_path = $request->file('image')->store('products', 'public');
        }

        $product->update([
            'name' => $request->name,
            'price' => (int) $request->price,
            'stock_quantity' => (int) $request->stock_quantity,
        ]);

        return response()->json([
            'id' => $product->id,
            'image_url' => $product->image_path ? Storage::url($product->image_path) : null,
        ]);
    }

    // DELETE
    public function destroy(Product $product)
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();
        return response()->noContent();
    }
}
