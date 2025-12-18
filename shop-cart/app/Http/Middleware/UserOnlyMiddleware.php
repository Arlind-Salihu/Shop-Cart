<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UserOnlyMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->is_admin) {
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
