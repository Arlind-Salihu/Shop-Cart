<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return Order::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get(['id', 'total', 'status', 'created_at', 'paid_at']);
    }

    public function show(Request $request, Order $order)
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->load(['items.product']);

        return response()->json([
            'id' => $order->id,
            'total' => $order->total,
            'status' => $order->status,
            'created_at' => $order->created_at,
            'paid_at' => $order->paid_at,
            'items' => $order->items->map(fn($i) => [
                'id' => $i->id,
                'product' => [
                    'id' => $i->product->id,
                    'name' => $i->product->name,
                ],
                'price' => $i->price,
                'quantity' => $i->quantity,
                'subtotal' => $i->price * $i->quantity,
            ]),
        ]);
    }

    public function pay(Request $request, Order $order)
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        if ($order->status === 'paid') {
            return response()->json(['message' => 'Already paid.']);
        }

        $request->validate([
            'payment_method' => ['required', Rule::in(['test_card', 'test_cash'])],
        ]);

        $order->forceFill([
            'status' => 'paid',
            'paid_at' => now(),
        ])->save();

        return response()->json(['message' => 'Payment successful.']);
    }
    

    public function invoice(Request $request, Order $order)
    {
        abort_unless($order->user_id === auth()->id() || auth()->user()->is_admin, 403);
        abort_unless($order->status === 'paid', 403);

        $html = view('pdf.invoice', ['order' => $order->load('items.product')])->render();

        return Pdf::loadHTML($html)
            ->download("invoice-{$order->id}.pdf");

        if ($order->status !== 'paid') {
            abort(Response::HTTP_FORBIDDEN, 'Invoice is available only after payment.');
        }

        $order->load(['items.product','user']);

        return view('invoice', ['order' => $order]);
    }
}
