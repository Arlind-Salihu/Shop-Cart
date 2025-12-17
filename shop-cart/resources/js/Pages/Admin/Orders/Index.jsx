import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function AdminOrdersIndex({ auth }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function load(pageUrl = "/api/admin/orders") {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(pageUrl, {
                credentials: "same-origin",
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });

            if (!res.ok) throw new Error(await res.text());
            setData(await res.json());
        } catch (e) {
            setError(e.message || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin Orders" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">Orders</h1>
                        <Link
                            href="/admin"
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Back to Dashboard
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
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="py-2">#</th>
                                                <th className="py-2">Customer</th>
                                                <th className="py-2">Email</th>
                                                <th className="py-2">Total</th>
                                                <th className="py-2">Date</th>
                                                <th className="py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.data.map((o) => (
                                                <tr key={o.id} className="border-b">
                                                    <td className="py-2">{o.id}</td>
                                                    <td className="py-2">{o.user?.name}</td>
                                                    <td className="py-2">{o.user?.email}</td>
                                                    <td className="py-2">
                                                        ${(o.total / 100).toFixed(2)}
                                                    </td>
                                                    <td className="py-2">
                                                        {new Date(o.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="py-2">
                                                        <Link
                                                            href={`/admin/orders/${o.id}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        disabled={!data.prev_page_url}
                                        onClick={() => load(data.prev_page_url)}
                                        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        disabled={!data.next_page_url}
                                        onClick={() => load(data.next_page_url)}
                                        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                    <span className="ml-2 text-sm text-gray-600">
                                        Page {data.current_page} of {data.last_page}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
