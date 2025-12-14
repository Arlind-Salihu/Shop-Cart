<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request)
    {
        return CartItem::query()
            ->where('user_id', $request->user()->id)
            ->with(['product:id,name,price,stock_quantity'])
            ->get();
    }

    public function add(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($data['product_id']);

        $item = CartItem::firstOrNew([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        $newQty = ($item->exists ? $item->quantity : 0) + $data['quantity'];

        if ($newQty > $product->stock_quantity) {
            return response()->json(['message' => 'Quantity exceeds available stock.'], 422);
        }

        $item->quantity = $newQty;
        $item->save();

        return response()->json(['message' => 'Added to cart.']);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        if ($data['quantity'] > $product->stock_quantity) {
            return response()->json(['message' => 'Quantity exceeds available stock.'], 422);
        }

        CartItem::query()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->update(['quantity' => $data['quantity']]);

        return response()->json(['message' => 'Cart updated.']);
    }

    public function remove(Request $request, Product $product)
    {
        CartItem::query()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        return response()->json(['message' => 'Item removed.']);
    }
}
