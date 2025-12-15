<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendLowStockEmail;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderConfirmationMail;

class CheckoutController extends Controller
{
    public function store(Request $request)
{
    $user = $request->user();

    $cartItems = CartItem::query()
        ->where('user_id', $user->id)
        ->get();

    if ($cartItems->isEmpty()) {
        return response()->json(['message' => 'Cart is empty.'], 422);
    }

    $threshold = config('shop.low_stock_threshold', 5);
    $lowStockProductIds = [];

    try {
        $order = DB::transaction(function () use ($user, $cartItems, $threshold, &$lowStockProductIds) {

            $products = Product::query()
                ->whereIn('id', $cartItems->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $total = 0;
            foreach ($cartItems as $item) {
                $product = $products->get($item->product_id);

                if (!$product) {
                    throw new \RuntimeException('Product not found.');
                }

                if ($item->quantity > $product->stock_quantity) {
                    throw new \RuntimeException("Not enough stock for {$product->name}.");
                }

                $total += ($product->price * $item->quantity);
            }

            $order = Order::create([
                'user_id' => $user->id,
                'total'   => $total,
            ]);

            foreach ($cartItems as $item) {
                $product = $products->get($item->product_id);

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $product->id,
                    'price'      => $product->price,
                    'quantity'   => $item->quantity,
                ]);

                $product->stock_quantity -= $item->quantity;
                $product->save();

                if ($product->stock_quantity <= $threshold) {
                    $lowStockProductIds[] = $product->id;
                }
            }

            CartItem::where('user_id', $user->id)->delete();

            return $order;
        });
    } catch (\RuntimeException $e) {
        return response()->json(['message' => $e->getMessage()], 422);
    }

foreach (array_unique($lowStockProductIds) as $id) {
    $product = Product::find($id);
    if ($product) {
        SendLowStockEmail::dispatch($product)->afterCommit();
    }
}

Mail::to($user->email)
    ->queue((new OrderConfirmationMail($order))->afterCommit());


return response()->json([
    'message'  => 'Checkout complete.',
    'order_id' => $order->id,
]);


}
}
