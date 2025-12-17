import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { csrfFetch } from "@/lib/csrfFetch";

export default function CartIndex({ auth }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [message, setMessage] = useState(null);

    async function loadCart() {
        setLoading(true);
        const res = await fetch("/api/cart", { credentials: "include" });
        const data = await res.json();
        setItems(data);
        setLoading(false);
    }

    const total = items.reduce(
        (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
        0
    );

    const updateQty = async (productId, quantity) => {
        await fetch(`/api/cart/items/${productId}`, {
            method: "PATCH",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken(),
                "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify({ quantity }),
        });

        await loadCart();
    };

    const removeItem = async (productId) => {
        await fetch(`/api/cart/items/${productId}`, {
            method: "DELETE",
            credentials: "same-origin",
            headers: {
                "X-CSRF-TOKEN": csrfToken(),
                "X-Requested-With": "XMLHttpRequest",
            },
        });

        await loadCart();
    };

    async function checkout() {
        setMessage(null);

        const res = await csrfFetch("/api/checkout", { method: "POST" });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            setMessage(data.message || "Checkout failed.");
            return;
        }

        // Go to payment method page for that order
        router.visit(`/orders/${data.order_id}`);
    }

    useEffect(() => {
        loadCart();
    }, []);

    function csrfToken() {
        return document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Cart
                    </h2>
                    <Link
                        href="/products"
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Back to Products
                    </Link>
                </div>
            }
        >
            <Head title="Cart" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {message && (
                        <div className="mb-4 rounded-md border border-gray-200 bg-white p-3 text-sm">
                            {message}
                        </div>
                    )}

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        {loading ? (
                            <p className="text-sm text-gray-600">
                                Loading cart...
                            </p>
                        ) : items.length === 0 ? (
                            <p className="text-sm text-gray-600">
                                Your cart is empty.
                            </p>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {items.map((it) => (
                                        <div
                                            key={it.id}
                                            className="flex items-center justify-between gap-4 rounded-lg border p-4"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-base font-semibold">
                                                    {it.product.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    $
                                                    {(
                                                        it.product.price / 100
                                                    ).toFixed(2)}{" "}
                                                    • Stock:{" "}
                                                    {it.product.stock_quantity}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        updateQty(
                                                            it.product_id,
                                                            Math.max(
                                                                1,
                                                                it.quantity - 1
                                                            )
                                                        )
                                                    }
                                                    disabled={
                                                        busyId === it.product_id
                                                    }
                                                    className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                                                >
                                                    -
                                                </button>

                                                <input
                                                    className="w-16 rounded-md border px-2 py-2 text-center text-sm"
                                                    value={it.quantity}
                                                    onChange={(e) => {
                                                        const v = parseInt(
                                                            e.target.value ||
                                                                "1",
                                                            10
                                                        );
                                                        if (
                                                            Number.isFinite(
                                                                v
                                                            ) &&
                                                            v >= 1
                                                        )
                                                            updateQty(
                                                                it.product_id,
                                                                v
                                                            );
                                                    }}
                                                    disabled={
                                                        busyId === it.product_id
                                                    }
                                                />

                                                <button
                                                    onClick={() =>
                                                        updateQty(
                                                            it.product_id,
                                                            it.quantity + 1
                                                        )
                                                    }
                                                    disabled={
                                                        busyId ===
                                                            it.product_id ||
                                                        it.quantity + 1 >
                                                            it.product
                                                                .stock_quantity
                                                    }
                                                    className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                                                >
                                                    +
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        removeItem(
                                                            it.product_id
                                                        )
                                                    }
                                                    disabled={
                                                        busyId === it.product_id
                                                    }
                                                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t pt-4">
                                    <p className="text-base font-semibold">
                                        Total: ${(total / 100).toFixed(2)}
                                    </p>

                                    <button
                                        onClick={checkout}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                                    >
                                        Checkout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
