<?php

namespace App\Mail;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LowStockMail extends Mailable
{
    public function __construct(public Product $product) {}

 public function build()
{
    return $this
        ->subject('Low Stock Alert')
        ->view('emails.low-stock')
        ->with([
            'product' => $this->product,
        ]);
}

}
