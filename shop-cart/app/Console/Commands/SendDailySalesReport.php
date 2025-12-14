<?php

namespace App\Console\Commands;

use App\Mail\DailySalesReportMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class SendDailySalesReport extends Command
{
    protected $signature = 'report:daily-sales';
    protected $description = 'Send daily sales report to admin email';

    public function handle(): int
    {
        $start = now()->startOfDay();
        $end = now()->endOfDay();

        $rows = DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->selectRaw('products.id, products.name, SUM(order_items.quantity) as total_qty, SUM(order_items.quantity * order_items.price) as revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_qty')
            ->get();

        $totalRevenue = (int) $rows->sum('revenue');

        Mail::to(config('shop.admin_email'))->send(
            new DailySalesReportMail($rows, $totalRevenue, $start->toDateString())
        );

        $this->info('Daily sales report sent.');
        return self::SUCCESS;
    }
}
