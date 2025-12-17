<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function download(Request $request, Order $order)
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->load(['items.product:id,name']);

        $pdf = Pdf::loadView('pdf.invoice', [
            'order' => $order,
            'user' => $request->user(),
        ]);

        return $pdf->download("invoice-order-{$order->id}.pdf");
    }
}
