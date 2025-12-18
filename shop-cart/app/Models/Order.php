<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['user_id', 'total', 'paid_at', 'payment_method'];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    protected $appends = ['is_paid'];

    public function getIsPaidAttribute(): bool
    {
        return !is_null($this->paid_at);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
    public function items()
    {
        return $this->hasMany(\App\Models\OrderItem::class);
    }


}
