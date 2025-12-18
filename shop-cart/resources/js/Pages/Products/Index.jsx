import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";

function xsrfToken() {
    return decodeURIComponent(
        document.cookie
            .split("; ")
            .find((r) => r.startsWith("XSRF-TOKEN="))
            ?.split("=")[1] ?? ""
    );
}

export default function Index({ auth }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);
    const [message, setMessage] = useState(null);

    async function loadProducts() {
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/products", {
                credentials: "same-origin",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": xsrfToken(),
                },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`API error ${res.status}: ${text}`);
            }

            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (e) {
            setMessage(e?.message || "Failed to load products.");
        } finally {
            setLoading(false);
        }
    }

    async function addToCart(productId) {
        setAddingId(productId);
        setMessage(null);

        try {
            const res = await fetch("/api/cart/items", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-XSRF-TOKEN": xsrfToken(),
                },
                body: JSON.stringify({ product_id: productId, quantity: 1 }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Add error ${res.status}: ${text}`);
            }

            setMessage("Added to cart ");
            await loadProducts();
        } catch (e) {
            setMessage(e?.message || "Failed to add to cart.");
        } finally {
            setAddingId(null);
        }
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
                    <div className="flex gap-2">
                        <Link
                            href="/orders"
                            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
                        >
                            Orders
                        </Link>
                        <Link
                            href="/cart"
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            View Cart
                        </Link>
                    </div>
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
                                        className="overflow-hidden rounded-lg border"
                                    >
                                        <div className="aspect-[4/3] w-full bg-gray-50">
                                            {p.image_url ? (
                                                <img
                                                    src={p.image_url}
                                                    alt={p.name}
                                                    className="mb-3 w-full rounded-md object-cover"
                                                />
                                            ) : (
                                                <div className="mb-3 h-40 w-full rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                    No image
                                                </div>
                                            )}

                                        </div>

                                        <div className="p-4">
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
                                                                (p.price || 0) /
                                                                100
                                                            ).toFixed(2)}
                                                        </span>
                                                    </p>

                                                    <p className="text-sm text-gray-600">
                                                        Stock:{" "}
                                                        <span className="font-medium">
                                                            {p.stock_quantity ??
                                                                0}
                                                        </span>
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => addToCart(p.id)}
                                                    disabled={
                                                        (p.stock_quantity ?? 0) ===
                                                        0 || addingId === p.id
                                                    }
                                                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-500"
                                                >
                                                    {addingId === p.id
                                                        ? "Adding..."
                                                        : "Add"}
                                                </button>
                                            </div>

                                            {(p.stock_quantity ?? 0) === 0 && (
                                                <p className="mt-3 text-xs text-red-600">
                                                    Out of stock
                                                </p>
                                            )}
                                        </div>
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
