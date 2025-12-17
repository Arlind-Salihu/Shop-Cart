<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\HandleInertiaRequests;

// Admin Routes
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminOrdersController;

// User Routes
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\InvoiceController;




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

// Inertia pages
Route::middleware(['auth'])->group(function () {
    Route::get('/products', fn() => Inertia::render('Products/Index'));
    Route::get('/cart', fn() => Inertia::render('Cart/Index'));

    Route::get('/orders', fn() => Inertia::render('Orders/Index'))->name('orders.index');
    Route::get('/orders/{order}', fn() => Inertia::render('Orders/Show'))->name('orders.show');
    Route::get('/orders/{order}/invoice', [\App\Http\Controllers\OrderInvoiceController::class, 'show'])
        ->name('orders.invoice');
});

// Admin Inertia page
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', fn() => Inertia::render('Admin/Dashboard'));
    Route::get('/admin/orders', fn() => Inertia::render('Admin/Orders/Index'))->name('admin.orders.index');
    Route::get('/admin/orders/{order}', fn($order) => Inertia::render('Admin/Orders/Show', ['orderId' => (int) $order]))->name('admin.orders.show');
});

// JSON endpoints (normal users)
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


        Route::get('/api/orders', [OrderController::class, 'index']);
        Route::get('/api/orders/{order}', [OrderController::class, 'show']);
        Route::post('/api/orders/{order}/pay', [OrderController::class, 'pay']);
        Route::get('/api/orders/{order}/invoice', [OrderController::class, 'invoice']);
    });

// JSON endpoints (ADMIN ONLY)
Route::middleware(['auth', 'admin'])
    ->withoutMiddleware([HandleInertiaRequests::class])
    ->prefix('api/admin')
    ->group(function () {
        Route::get('/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/orders', [AdminOrdersController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrdersController::class, 'show']);
    });



require __DIR__ . '/auth.php';
