<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrdersController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status'); // 'paid' | 'pending' | null
        $q = trim((string) $request->query('q', '')); // search text

        $orders = Order::query()
            ->with(['user:id,name,email'])
            ->withCount('items')
            ->orderByDesc('id');

        // Status filter
        if (in_array($status, ['paid', 'pending'], true)) {
            $orders->where('status', $status);
        }

        // Search by id / email / name
        if ($q !== '') {
            $orders->where(function ($w) use ($q) {
                if (ctype_digit($q)) {
                    $w->orWhere('id', (int) $q);
                }
                $w->orWhereHas('user', function ($u) use ($q) {
                    $u->where('email', 'like', "%{$q}%")
                        ->orWhere('name', 'like', "%{$q}%");
                });
            });
        }

        return response()->json(
            $orders->paginate(20)->withQueryString()
        );
    }

    public function show(Order $order)
    {
        $order->load(['user:id,name,email', 'items.product:id,name,price']);
        return response()->json($order);
    }
}
