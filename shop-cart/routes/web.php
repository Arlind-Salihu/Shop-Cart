<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\HandleInertiaRequests;

// Admin Controllers (API)
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminProductsController;
use App\Http\Controllers\Api\AdminOrdersController;

// User Controllers
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\InvoiceController;

Route::get('/', function () {
    if (!auth()->check()) {
        return redirect()->route('login');
    }

    return auth()->user()->is_admin
        ? redirect()->route('admin.dashboard')
        : redirect()->route('products.index');
})->name('home');


/**
 * USER Inertia Pages (admins blocked)
 */
Route::middleware(['auth', 'user'])->group(function () {
    Route::get('/products', fn() => Inertia::render('Products/Index'))->name('products.index');
    Route::get('/cart', fn() => Inertia::render('Cart/Index'))->name('cart.index');

    Route::get('/orders', fn() => Inertia::render('Orders/Index'))->name('orders.index');
    Route::get('/orders/{order}', fn() => Inertia::render('Orders/Show'))->name('orders.show');

    // PDF download route (Blade/PDF controller)
    Route::get('/orders/{order}/invoice', [InvoiceController::class, 'invoice'])
        ->name('orders.invoice');
});

/**
 * ADMIN Inertia Pages (users blocked)
 */
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', fn() => Inertia::render('Admin/Dashboard'))
        ->name('admin.dashboard');

    Route::get('/admin/products', fn() => Inertia::render('Admin/Products/Index'))
        ->name('admin.products.index');

    Route::get('/admin/orders', fn() => Inertia::render('Admin/Orders/Index'))
        ->name('admin.orders.index');

    Route::get('/admin/orders/{order}', fn($order) => Inertia::render('Admin/Orders/Show', [
        'orderId' => (int) $order
    ]))->name('admin.orders.show');

    Route::get('/admin/orders/{order}/invoice', [InvoiceController::class, 'adminInvoice'])
        ->name('admin.orders.invoice');
});

/**
 * USER JSON endpoints (admins blocked, no Inertia middleware)
 */
Route::middleware(['auth', 'user'])
    ->withoutMiddleware([
        HandleInertiaRequests::class,
        \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    ])
    ->group(function () {
        // profile routes...
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // products
        Route::get('/api/products', [ProductController::class, 'index']);

        // cart
        Route::get('/api/cart', [CartController::class, 'show']);
        Route::post('/api/cart/items', [CartController::class, 'add']);
        Route::patch('/api/cart/items/{product}', [CartController::class, 'update']);
        Route::delete('/api/cart/items/{product}', [CartController::class, 'remove']);

        // checkout
        Route::post('/api/checkout', [CheckoutController::class, 'store']);

        // orders
        Route::get('/api/orders', [OrderController::class, 'index']);
        Route::get('/api/orders/{order}', [OrderController::class, 'show']);
        Route::post('/api/orders/{order}/pay', [OrderController::class, 'pay']);
        Route::get('/api/orders/{order}/invoice', [OrderController::class, 'invoice']);
    });


/**
 * ADMIN JSON endpoints (users blocked, no Inertia middleware)
 */
Route::middleware(['auth', 'admin'])
    ->withoutMiddleware([
        HandleInertiaRequests::class,
        \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
    ])
    ->prefix('api/admin')
    ->group(function () {

        Route::get('/stats', [AdminDashboardController::class, 'stats']);

        Route::get('/products', [AdminProductsController::class, 'index']);
        Route::post('/products', [AdminProductsController::class, 'store']);
        Route::get('/products/{product}', [AdminProductsController::class, 'show']);
        Route::put('/products/{product}', [AdminProductsController::class, 'update']);
        Route::delete('/products/{product}', [AdminProductsController::class, 'destroy']);

        Route::get('/orders', [AdminOrdersController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrdersController::class, 'show']);
    });


require __DIR__ . '/auth.php';
