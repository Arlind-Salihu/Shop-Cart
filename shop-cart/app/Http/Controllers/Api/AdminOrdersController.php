<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrdersController extends Controller
{
    // GET /api/admin/orders
    public function index(Request $request)
    {
        $orders = Order::query()
            ->with('user:id,name,email')
            ->latest()
            ->paginate(15);

        return response()->json($orders);
    }

    // GET /api/admin/orders/{order}
    public function show(Order $order)
    {
        $order->load([
            'user:id,name,email',
            'items.product:id,name',
        ]);

        return response()->json($order);
    }
}
