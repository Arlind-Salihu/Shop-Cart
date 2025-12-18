<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'price',
        'stock_quantity',
        'image_path',
    ];


    public function cartItems()
    {
        return $this->hasMany(\App\Models\CartItem::class);
    }
}
