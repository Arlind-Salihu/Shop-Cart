<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminProductsController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $query = Product::query()->orderByDesc('id');
        if ($q !== '') {
            $query->where('name', 'like', "%{$q}%");
        }

        return $query->get()->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'price' => (int) $p->price,
            'stock_quantity' => (int) $p->stock_quantity,
            'image_path' => $p->image_path,
            'image_url' => $p->image_path ? Storage::url($p->image_path) : null,
        ]);
    }

    public function show(Product $product)
    {
        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'price' => (int) $product->price,
            'stock_quantity' => (int) $product->stock_quantity,
            'image_path' => $product->image_path,
            'image_url' => $product->image_path ? Storage::url($product->image_path) : null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateProduct($request);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name' => $data['name'],
            'price' => (int) $data['price'],
            'stock_quantity' => (int) $data['stock_quantity'],
            'image_path' => $imagePath,
        ]);

        return response()->json($this->shape($product), 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validateProduct($request, isUpdate: true);

        if ($request->boolean('remove_image') && $product->image_path) {
            Storage::disk('public')->delete($product->image_path);
            $product->image_path = null;
        }

        if ($request->hasFile('image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $product->image_path = $request->file('image')->store('products', 'public');
        }

        $product->name = $data['name'];
        $product->price = (int) $data['price'];
        $product->stock_quantity = (int) $data['stock_quantity'];
        $product->save();

        return response()->json($this->shape($product));
    }

    public function destroy(Product $product)
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }
        $product->delete();

        return response()->noContent();
    }

    private function validateProduct(Request $request, bool $isUpdate = false): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ]);
    }

    private function shape(Product $p): array
    {
        return [
            'id' => $p->id,
            'name' => $p->name,
            'price' => (int) $p->price,
            'stock_quantity' => (int) $p->stock_quantity,
            'image_path' => $p->image_path,
            'image_url' => $p->image_path ? Storage::url($p->image_path) : null,
        ];
    }
}
