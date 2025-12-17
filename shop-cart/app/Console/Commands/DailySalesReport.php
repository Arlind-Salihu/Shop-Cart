<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\DailySalesReportMail;

class DailySalesReport extends Command
{
    protected $signature = 'report:daily-sales';
    protected $description = 'Send daily sales report to admin';

    public function handle(): int
    {
        $date = now()->toDateString();

        // Aggregate sales for today (grouped by product)
        $rows = DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereDate('orders.created_at', $date)
            ->selectRaw('products.name as product, SUM(order_items.quantity) as quantity, order_items.price as price, SUM(order_items.price * order_items.quantity) as subtotal')
            ->groupBy('products.name', 'order_items.price')
            ->orderBy('products.name')
            ->get()
            ->map(fn ($r) => [
                'product' => $r->product,
                'quantity' => (int) $r->quantity,
                'price' => (int) $r->price,
                'subtotal' => (int) $r->subtotal,
            ])
            ->toArray();

        if (count($rows) === 0) {
            $this->info('No sales today.');
            return Command::SUCCESS;
        }

        $totalRevenue = array_sum(array_map(fn ($r) => $r['subtotal'], $rows));

        $adminEmail = env('ADMIN_EMAIL', 'admin-cart@mailinator.com');

        Mail::to($adminEmail)->send(
            new DailySalesReportMail($rows, $totalRevenue, $date)
        );

        $this->info('Daily sales report sent.');
        return Command::SUCCESS;
    }
}
