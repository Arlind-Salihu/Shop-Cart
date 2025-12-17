<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show()
    {
        return CartItem::with('product')
            ->where('user_id', auth()->id())
            ->get();

    }




    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $item = CartItem::firstOrCreate(
            [
                'user_id' => auth()->id(),
                'product_id' => $request->product_id,
            ],
            ['quantity' => 0]
        );


        $item->increment('quantity', $request->quantity);

        return response()->json(['success' => true]);
    }

    public function update(Request $request, Product $product)
    {
        $item = CartItem::where('user_id', auth()->id())
            ->where('product_id', $product->id)
            ->firstOrFail();


        $item->update([
            'quantity' => max(1, (int) $request->quantity)
        ]);

        return response()->json($item->load('product'));
    }


    public function remove(Product $product)
    {
        CartItem::where('user_id', auth()->id())
            ->where('product_id', $product->id)
            ->delete();


        return response()->noContent();
    }

    public function store()
    {
        $user = auth()->user();

        $items = CartItem::with('product')
            ->where('user_id', $user->id)
            ->get();

        if ($items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 422);
        }

        foreach ($items as $item) {
            if ($item->product->stock_quantity < $item->quantity) {
                return response()->json([
                    'message' => "Not enough stock for {$item->product->name}"
                ], 422);
            }
        }

        foreach ($items as $item) {
            $item->product->decrement('stock_quantity', $item->quantity);
        }

        CartItem::where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Checkout completed']);
    }


}
