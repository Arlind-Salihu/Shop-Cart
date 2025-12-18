<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function invoice(Order $order)
    {
        // Security
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        if (!$order->is_paid) {
            abort(403, 'Order not paid');
        }

        $order->load(['items.product', 'user']);

        $pdf = Pdf::loadView('pdf.invoice', [
            'order' => $order
        ]);

        return $pdf->download(
            'invoice-order-' . $order->id . '.pdf'
        );
    }
}
