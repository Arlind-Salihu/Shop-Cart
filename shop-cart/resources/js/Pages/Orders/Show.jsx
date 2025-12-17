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

export default function Show({ auth }) {
    const orderId = useMemo(() => {
        const parts = window.location.pathname.split("/").filter(Boolean);
        return parts[1]; // /orders/{id}
    }, []);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    const [method, setMethod] = useState("test_card");
    const [paying, setPaying] = useState(false);

    async function loadOrder() {
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
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

    async function pay() {
        setPaying(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/orders/${orderId}/pay`, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrf(),
                },
                body: JSON.stringify({ payment_method: method }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Pay error ${res.status}: ${text}`);
            }

            await loadOrder();
            setMessage("Payment completed ✅");
        } catch (e) {
            setMessage(e.message || "Payment failed.");
        } finally {
            setPaying(false);
        }
    }

    function downloadInvoice() {
        // Only allow after paid (UI also hides it, but keep this safe)
        if (!order?.is_paid) return;
        window.location.href = `/orders/${orderId}/invoice`;
    }

    useEffect(() => {
        loadOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const items = order?.items || [];
    const isPaid = !!order?.is_paid;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Order #{orderId}
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href="/orders"
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Orders
                        </Link>
                        <Link
                            href="/products"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                        >
                            Products
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Order #${orderId}`} />

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
                                <p className="text-sm text-gray-600">
                                    Loading order...
                                </p>
                            ) : !order ? (
                                <p className="text-sm text-gray-600">
                                    Order not found.
                                </p>
                            ) : (
                                <>
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            Created:{" "}
                                            <span className="font-medium text-gray-800">
                                                {order.created_at_human ||
                                                    order.created_at ||
                                                    "-"}
                                            </span>
                                        </div>

                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                isPaid
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {isPaid
                                                ? "PAID"
                                                : "PENDING PAYMENT"}
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="py-2 text-left">
                                                        Product
                                                    </th>
                                                    <th className="py-2 text-right">
                                                        Price
                                                    </th>
                                                    <th className="py-2 text-right">
                                                        Qty
                                                    </th>
                                                    <th className="py-2 text-right">
                                                        Subtotal
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((it) => (
                                                    <tr
                                                        key={it.id}
                                                        className="border-b last:border-0"
                                                    >
                                                        <td className="py-3">
                                                            {it.product?.name ||
                                                                `Product #${it.product_id}`}
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            $
                                                            {(
                                                                (it.price ||
                                                                    0) / 100
                                                            ).toFixed(2)}
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            {it.quantity}
                                                        </td>
                                                        <td className="py-3 text-right font-medium">
                                                            $
                                                            {(
                                                                ((it.price ||
                                                                    0) *
                                                                    it.quantity) /
                                                                100
                                                            ).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <th
                                                        className="py-3 text-right"
                                                        colSpan={3}
                                                    >
                                                        Total
                                                    </th>
                                                    <th className="py-3 text-right">
                                                        $
                                                        {(
                                                            (order.total || 0) /
                                                            100
                                                        ).toFixed(2)}
                                                    </th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-semibold">Payment</h3>

                            {!order ? (
                                <p className="mt-2 text-sm text-gray-600">
                                    Load order to pay.
                                </p>
                            ) : isPaid ? (
                                <>
                                    <p className="mt-2 text-sm text-gray-700">
                                        Payment completed.
                                    </p>
                                    <button
                                        onClick={downloadInvoice}
                                        className="mt-4 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                                    >
                                        Download Receipt / Invoice
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Choose a method (simulation) and pay to
                                        unlock the invoice.
                                    </p>

                                    <label className="mt-4 block text-sm font-medium text-gray-700">
                                        Payment Method
                                    </label>
                                    <select
                                        value={method}
                                        onChange={(e) =>
                                            setMethod(e.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="test_card">
                                            Test Card
                                        </option>
                                        <option value="cash_on_delivery">
                                            Cash on Delivery
                                        </option>
                                        <option value="bank_transfer">
                                            Bank Transfer
                                        </option>
                                    </select>

                                    <button
                                        onClick={pay}
                                        disabled={paying}
                                        className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-500"
                                    >
                                        {paying ? "Processing..." : "Pay Now"}
                                    </button>

                                    <button
                                        disabled
                                        className="mt-3 w-full cursor-not-allowed rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500"
                                        title="Complete payment first"
                                    >
                                        Download Receipt / Invoice
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
