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

export default function Index({ auth }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    const [status, setStatus] = useState("all");
    const [q, setQ] = useState("");

    async function loadOrders() {
        setLoading(true);
        setMessage(null);

        const params = new URLSearchParams();
        if (status !== "all") params.set("status", status);
        if (q.trim()) params.set("q", q.trim());

        try {
            const res = await fetch(`/api/admin/orders?${params.toString()}`, {
                credentials: "include",
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
            setOrders(Array.isArray(data) ? data : data.data || []);
        } catch (e) {
            setMessage(e.message || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        if (!qq) return orders;

        return orders.filter((o) => {
            const idMatch = String(o.id || "").includes(qq);
            const emailMatch = (o.user?.email || "").toLowerCase().includes(qq);
            const nameMatch = (o.user?.name || "").toLowerCase().includes(qq);
            return idMatch || emailMatch || nameMatch;
        });
    }, [orders, q]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Admin · Orders
                    </h2>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/admin"
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Admin Dashboard
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Admin Orders" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    {message && (
                        <div className="mb-4 rounded-md border border-gray-200 bg-white p-3 text-sm">
                            {message}
                        </div>
                    )}

                    <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                        className="mt-1 w-full rounded-md border-gray-300 text-sm"
                                    >
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>

                                <div className="sm:min-w-[320px]">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Search (id / email / name)
                                    </label>
                                    <input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="e.g. 28 or test@example.com"
                                        className="mt-1 w-full rounded-md border-gray-300 text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={loadOrders}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        {loading ? (
                            <p className="text-sm text-gray-600">
                                Loading orders...
                            </p>
                        ) : filtered.length === 0 ? (
                            <p className="text-sm text-gray-600">
                                No orders found.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-2 text-left">
                                                ID
                                            </th>
                                            <th className="py-2 text-left">
                                                Customer
                                            </th>
                                            <th className="py-2 text-left">
                                                Status
                                            </th>
                                            <th className="py-2 text-left">
                                                Total
                                            </th>
                                            <th className="py-2 text-left">
                                                Created
                                            </th>
                                            <th className="py-2 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((o) => {
                                            const paid =
                                                o.status === "paid" ||
                                                !!o.is_paid;
                                            return (
                                                <tr
                                                    key={o.id}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="py-3 font-medium">
                                                        #{o.id}
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="font-medium text-gray-900">
                                                            {o.user?.name ||
                                                                "—"}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {o.user?.email ||
                                                                "—"}
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                                paid
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-yellow-100 text-yellow-800"
                                                            }`}
                                                        >
                                                            {paid
                                                                ? "PAID"
                                                                : "PENDING"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-left font-medium">
                                                        $
                                                        {(
                                                            (o.total || 0) / 100
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 text-gray-700">
                                                        {o.created_at
                                                            ? new Date(
                                                                  o.created_at
                                                              ).toLocaleDateString(
                                                                  "en-GB"
                                                              )
                                                            : "—"}
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <Link
                                                            href={`/admin/orders/${o.id}`}
                                                            className="rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
