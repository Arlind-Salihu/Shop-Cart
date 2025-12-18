import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";

function csrf() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || ""
    );
}

export default function Index({ auth }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    async function loadOrders() {
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/orders", {
                credentials: "same-origin",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrf(),
                },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`API error ${res.status}: ${text}`);
            }

            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            setMessage(e.message || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Orders
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href="/products"
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Products
                        </Link>
                        <Link
                            href="/cart"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                        >
                            Cart
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Orders" />

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
                                Loading orders...
                            </p>
                        ) : orders.length === 0 ? (
                            <div className="text-sm text-gray-600">
                                No orders yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-2 text-left">
                                                Order #
                                            </th>
                                            <th className="py-2 text-left">
                                                Status
                                            </th>
                                            <th className="py-2 text-left">
                                                Date
                                            </th>
                                            <th className="py-2 text-right">
                                                Total
                                            </th>
                                            <th className="py-2 text-right">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((o) => (
                                            <tr
                                                key={o.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3">
                                                    #{o.id}
                                                </td>
                                                <td className="py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${o.is_paid
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-800"
                                                            }`}
                                                    >
                                                        {o.is_paid
                                                            ? "PAID"
                                                            : "PENDING"}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-gray-600">
                                                    {
                                                        o.created_at
                                                            ? new Date(o.created_at).toLocaleDateString("en-GB")
                                                            : "—"
                                                    }
                                                </td>
                                                <td className="py-3 text-right font-medium">
                                                    $
                                                    {(
                                                        (o.total || 0) / 100
                                                    ).toFixed(2)}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <Link
                                                        href={`/orders/${o.id}`}
                                                        className="rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
