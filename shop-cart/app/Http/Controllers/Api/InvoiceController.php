<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    // USER: only his own + only if PAID
    public function invoice(Order $order)
    {
        abort_unless($order->user_id === auth()->id(), 403);
        abort_unless($order->status === 'paid', 403);

        $order->load(['items.product', 'user']);

        return Pdf::loadView('pdf.invoice', ['order' => $order])
            ->download("invoice-{$order->id}.pdf");
    }

    // ADMIN: any order, any status
    public function adminInvoice(Order $order)
    {
        abort_unless(auth()->user()?->is_admin, 403);

        $order->load(['items.product', 'user']);

        return Pdf::loadView('pdf.invoice', ['order' => $order])
            ->download("invoice-{$order->id}.pdf");
    }
}
