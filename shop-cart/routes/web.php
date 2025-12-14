<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

/**
 * Inertia pages
 */
Route::middleware(['auth'])->group(function () {
    Route::get('/products', fn () => Inertia::render('Products/Index'))->name('products.index');
    Route::get('/cart', fn () => Inertia::render('Cart/Index'))->name('cart.index');
});

/**
 * JSON endpoints (session auth, but WITHOUT Inertia middleware)
 */
Route::middleware(['auth'])
    ->withoutMiddleware([HandleInertiaRequests::class])
    ->group(function () {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
        Route::get('/api/products', [ProductController::class, 'index']);

        Route::get('/api/cart', [CartController::class, 'show']);
        Route::post('/api/cart/items', [CartController::class, 'add']);
        Route::patch('/api/cart/items/{product}', [CartController::class, 'update']);
        Route::delete('/api/cart/items/{product}', [CartController::class, 'remove']);

        Route::post('/api/checkout', [CheckoutController::class, 'store']);
    });

require __DIR__ . '/auth.php';
