<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Mail;
use App\Mail\DailySalesReportMail;

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Mail;
use App\Mail\DailySalesReportMail;

class DailySalesReport extends Command
{
    protected $signature = 'report:daily-sales';
    protected $description = 'Send daily sales report to admin';

    public function handle(): int
    {
        $items = OrderItem::with('product')
            ->whereDate('created_at', today())
            ->get();

        if ($items->isEmpty()) {
            $this->info('No sales today.');
            return Command::SUCCESS;
        }

        $rows = $items->map(fn ($item) => [
            'product'  => $item->product?->name ?? 'Deleted product',
            'quantity' => $item->quantity,
            'price'    => $item->price,
            'subtotal' => $item->price * $item->quantity,
        ]);

        $totalRevenue = $rows->sum('subtotal');
        $date = today()->toDateString();

        Mail::to(env('ADMIN_EMAIL'))
            ->send(new DailySalesReportMail($rows, $totalRevenue, $date));

        $this->info('Daily sales report sent.');
        return Command::SUCCESS;
    }
}
