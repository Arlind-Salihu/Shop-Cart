<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Mail;
use App\Mail\DailySalesReportMail;

class DailySalesReport extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'report:daily-sales';

    /**
     * The console command description.
     */
    protected $description = 'Send daily sales report to admin';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $items = OrderItem::with('product')
            ->whereDate('created_at', today())
            ->get();

        if ($items->isEmpty()) {
            $this->info('No sales today.');
            return Command::SUCCESS;
        }

        Mail::to(env('ADMIN_EMAIL'))
            ->send(new DailySalesReportMail($items));

        $this->info('Daily sales report sent.');

        return Command::SUCCESS;
    }
}
