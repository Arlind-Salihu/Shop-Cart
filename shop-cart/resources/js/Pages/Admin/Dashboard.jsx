import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Dashboard({ auth }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadStats() {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/stats", {
                credentials: "same-origin",
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`API error ${res.status}: ${text}`);
            }

            setStats(await res.json());
        } catch (e) {
            setError(e.message || "Failed to load admin stats.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStats();
    }, []);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

                    {error && (
                        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        {loading ? (
                            <p className="text-sm text-gray-600">
                                Loading admin stats...
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-lg border p-4">
                                    <p className="text-sm text-gray-500">
                                        Orders Today
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats?.orders_today ?? 0}
                                    </p>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <p className="text-sm text-gray-500">
                                        Revenue Today
                                    </p>
                                    <p className="text-2xl font-bold">
                                        $
                                        {(
                                            (stats?.revenue_today_cents ?? 0) /
                                            100
                                        ).toFixed(2)}
                                    </p>
                                </div>

                                <div className="rounded-lg border p-4">
                                    <p className="text-sm text-gray-500">
                                        Low Stock (≤ {stats?.threshold ?? 5})
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats?.low_stock_count ?? 0}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
