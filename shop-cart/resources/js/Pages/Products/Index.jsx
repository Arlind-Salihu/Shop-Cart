import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Index({ auth }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);
    const [message, setMessage] = useState(null);

    async function loadProducts() {
        setLoading(true);
        const res = await fetch("/api/products", { credentials: "include" });
        const data = await res.json();
        setProducts(data);
        setLoading(false);
    }

    async function addToCart(productId) {
        setAddingId(productId);
        setMessage(null);

        const res = await fetch("/api/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ product_id: productId, quantity: 1 }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            setMessage(err.message || "Failed to add to cart.");
        } else {
            setMessage("Added to cart ✅");
        }

        setAddingId(null);
        await loadProducts();
    }

    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Products
                    </h2>
                    <Link
                        href="/cart"
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        View Cart
                    </Link>
                </div>
            }
        >
            <Head title="Products" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    {message && (
                        <div className="mb-4 rounded-md border border-gray-200 bg-white p-3 text-sm">
                            {message}
                        </div>
                    )}

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        {loading ? (
                            <p className="text-sm text-gray-600">
                                Loading products...
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {products.map((p) => (
                                    <div
                                        key={p.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    {p.name}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Price:{" "}
                                                    <span className="font-medium">
                                                        $
                                                        {(
                                                            p.price / 100
                                                        ).toFixed(2)}
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Stock:{" "}
                                                    <span className="font-medium">
                                                        {p.stock_quantity}
                                                    </span>
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => addToCart(p.id)}
                                                disabled={
                                                    p.stock_quantity === 0 ||
                                                    addingId === p.id
                                                }
                                                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {addingId === p.id
                                                    ? "Adding..."
                                                    : "Add"}
                                            </button>
                                        </div>

                                        {p.stock_quantity === 0 && (
                                            <p className="mt-3 text-xs text-red-600">
                                                Out of stock
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
