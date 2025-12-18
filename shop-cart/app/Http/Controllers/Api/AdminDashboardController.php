<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $threshold = config('shop.low_stock_threshold', 5);

        $today = now()->toDateString();

        $todayOrdersQuery = Order::query()->whereDate('created_at', $today);

        $ordersToday = (int) $todayOrdersQuery->count();
        $revenueTodayCents = (int) $todayOrdersQuery->sum('total');

        $productsTotal = (int) Product::query()->count();
        $lowStockCount = (int) Product::query()->where('stock_quantity', '<=', $threshold)->count();

        // Chart: last 7 days (including today)
        $start = now()->startOfDay()->subDays(6);
        $end = now()->endOfDay();

        $ordersAgg = Order::query()
            ->selectRaw('DATE(created_at) as day, COUNT(*) as orders_count, COALESCE(SUM(total),0) as revenue_cents')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $series = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i)->toDateString();
            $row = $ordersAgg->get($day);

            $series[] = [
                'date' => $day, // YYYY-MM-DD
                'orders' => (int) ($row->orders_count ?? 0),
                'revenue_cents' => (int) ($row->revenue_cents ?? 0),
            ];
        }

        return response()->json([
            'orders_today' => $ordersToday,
            'revenue_today_cents' => $revenueTodayCents,
            'products_total' => $productsTotal,
            'low_stock_count' => $lowStockCount,
            'threshold' => $threshold,
            'last_7_days' => $series,
        ]);
    }
}
