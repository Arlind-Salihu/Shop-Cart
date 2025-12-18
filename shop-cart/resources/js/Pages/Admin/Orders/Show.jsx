import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

function csrf() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || ""
    );
}

export default function Show({ auth, orderId: orderIdFromProps }) {
    const orderId = useMemo(() => {
        if (orderIdFromProps) return orderIdFromProps;

        const parts = window.location.pathname.split("/").filter(Boolean);
        return parts[2];
    }, [orderIdFromProps]);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    async function loadOrder() {
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
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
            setOrder(data);
        } catch (e) {
            setMessage(e.message || "Failed to load order.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const items = order?.items || [];
    const paid = order?.status === "paid" || !!order?.is_paid;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Admin · Order #{orderId}
                    </h2>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin/orders"
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Back to Orders
                        </Link>

                        {/* {paid && ( */}
                        <a
                            href={`/admin/orders/${orderId}/invoice`}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                        >
                            Download Invoice (PDF)
                        </a>
                        {/* )} */}
                    </div>
                </div>
            }
        >
            <Head title={`Admin Order #${orderId}`} />

            <div className="py-8">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    {message && (
                        <div className="mb-4 rounded-md border border-gray-200 bg-white p-3 text-sm">
                            {message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow-sm">
                            {loading ? (
                                <p className="text-sm text-gray-600">Loading order...</p>
                            ) : !order ? (
                                <p className="text-sm text-gray-600">Order not found.</p>
                            ) : (
                                <>
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-sm text-gray-600">
                                                Customer
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                {order.user?.name || "—"}
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                {order.user?.email || "—"}
                                            </div>

                                            <div className="mt-3 text-sm text-gray-600">
                                                Created
                                            </div>
                                            <div className="text-sm font-medium text-gray-800">
                                                {
                                                    order.created_at
                                                        ? new Date(order.created_at).toLocaleDateString("en-GB")
                                                        : "—"
                                                }
                                            </div>
                                        </div>

                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${paid
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-800"
                                                }`}
                                        >
                                            {paid ? "PAID" : "PENDING PAYMENT"}
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="py-2 text-left">Product</th>
                                                    <th className="py-2 text-right">Price</th>
                                                    <th className="py-2 text-right">Qty</th>
                                                    <th className="py-2 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((it) => (
                                                    <tr key={it.id} className="border-b last:border-0">
                                                        <td className="py-3">
                                                            {it.product?.name || `Product #${it.product_id}`}
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            ${(((it.price || 0) / 100).toFixed(2))}
                                                        </td>
                                                        <td className="py-3 text-right">{it.quantity}</td>
                                                        <td className="py-3 text-right font-medium">
                                                            ${((((it.price || 0) * it.quantity) / 100).toFixed(2))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <th className="py-3 text-right" colSpan={3}>
                                                        Total
                                                    </th>
                                                    <th className="py-3 text-right">
                                                        ${(((order.total || 0) / 100).toFixed(2))}
                                                    </th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-semibold">Admin Notes</h3>
                            {!order ? (
                                <p className="mt-2 text-sm text-gray-600">
                                    Load order to view details.
                                </p>
                            ) : (
                                <div className="mt-3 space-y-2 text-sm text-gray-700">
                                    <div>
                                        <span className="font-medium">Order ID:</span> #{order.id}
                                    </div>
                                    <div>
                                        <span className="font-medium">Status:</span>{" "}
                                        {paid ? "paid" : "pending"}
                                    </div>
                                    <div>
                                        <span className="font-medium">Items:</span> {items.length}
                                    </div>

                                    {!paid && (
                                        <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
                                            Invoice is locked until payment is completed.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
