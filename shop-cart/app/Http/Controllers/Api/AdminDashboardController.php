<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $threshold = config('shop.low_stock_threshold', 5);

        $todayOrdersQuery = Order::query()->whereDate('created_at', today());

        return response()->json([
            'orders_today' => $todayOrdersQuery->count(),
            'revenue_today_cents' => (int) $todayOrdersQuery->sum('total'),
            'low_stock_count' => Product::query()->where('stock_quantity', '<=', $threshold)->count(),
            'threshold' => $threshold,
        ]);
    }
}
