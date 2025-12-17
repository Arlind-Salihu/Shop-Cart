import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function AdminOrderShow({ auth, orderId }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function load() {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                credentials: "same-origin",
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });

            if (!res.ok) throw new Error(await res.text());
            setOrder(await res.json());
        } catch (e) {
            setError(e.message || "Failed to load order.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [orderId]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Order #${orderId}`} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Order #{orderId}</h1>
                        <Link
                            href="/admin/orders"
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Back to Orders
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        {loading ? (
                            <p className="text-sm text-gray-600">Loading...</p>
                        ) : (
                            <>
                                <div className="mb-4 text-sm text-gray-700">
                                    <div>
                                        <span className="font-medium">Customer:</span>{" "}
                                        {order.user?.name} ({order.user?.email})
                                    </div>
                                    <div>
                                        <span className="font-medium">Date:</span>{" "}
                                        {new Date(order.created_at).toLocaleString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Total:</span>{" "}
                                        ${(order.total / 100).toFixed(2)}
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="py-2">Product</th>
                                                <th className="py-2">Qty</th>
                                                <th className="py-2">Price</th>
                                                <th className="py-2">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((it) => (
                                                <tr key={it.id} className="border-b text-center">
                                                    <td className="py-2">{it.product?.name}</td>
                                                    <td className="py-2">{it.quantity}</td>
                                                    <td className="py-2">
                                                        ${(it.price / 100).toFixed(2)}
                                                    </td>
                                                    <td className="py-2">
                                                        ${((it.price * it.quantity) / 100).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
