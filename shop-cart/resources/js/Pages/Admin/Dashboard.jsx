import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
} from "recharts";

function money(cents) {
    const v = (Number(cents || 0) / 100);
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(v);
}

export default function Dashboard({ auth }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState(null);

    async function loadStats() {
        setLoading(true);
        setMsg(null);

        try {
            const res = await fetch("/api/admin/stats", {
                credentials: "same-origin",
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Stats error ${res.status}: ${text}`);
            }

            const data = await res.json();
            setStats(data);
        } catch (e) {
            setMsg(e.message || "Failed to load admin stats.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStats();
    }, []);

    const series = stats?.last_7_days || [];

    const revenueSeries = useMemo(() => {
        return series.map((d) => ({
            ...d,
            revenue: Number(d.revenue_cents || 0) / 100, // for Y axis
            label: (d.date || "").slice(5), // MM-DD
        }));
    }, [series]);

    const ordersSeries = useMemo(() => {
        return series.map((d) => ({
            ...d,
            label: (d.date || "").slice(5), // MM-DD
        }));
    }, [series]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Admin Dashboard
                    </h2>
                    <div className="flex gap-2">
                        <Link
                            href="/admin/orders"
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                        >
                            Orders
                        </Link>
                        <button
                            onClick={loadStats}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    {msg && (
                        <div className="mb-4 rounded-md border border-gray-200 bg-white p-3 text-sm">
                            {msg}
                        </div>
                    )}

                    {loading ? (
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-600">Loading dashboard...</p>
                        </div>
                    ) : !stats ? (
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-600">No stats.</p>
                        </div>
                    ) : (
                        <>
                            {/* KPI cards */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-lg bg-white p-5 shadow-sm">
                                    <div className="text-xs text-gray-500">Orders Today</div>
                                    <div className="mt-1 text-2xl font-semibold">
                                        {stats.orders_today ?? 0}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-white p-5 shadow-sm">
                                    <div className="text-xs text-gray-500">Revenue Today</div>
                                    <div className="mt-1 text-2xl font-semibold">
                                        {money(stats.revenue_today_cents)}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-white p-5 shadow-sm">
                                    <div className="text-xs text-gray-500">Products Total</div>
                                    <div className="mt-1 text-2xl font-semibold">
                                        {stats.products_total ?? 0}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-white p-5 shadow-sm">
                                    <div className="text-xs text-gray-500">
                                        Low Stock (≤ {stats.threshold})
                                    </div>
                                    <div className="mt-1 text-2xl font-semibold">
                                        {stats.low_stock_count ?? 0}
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="rounded-lg bg-white p-6 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Revenue (Last 7 Days)
                                    </h3>
                                    <div className="mt-4 h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={revenueSeries}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value) => money(Number(value) * 100)}
                                                    labelFormatter={(label) => `Day ${label}`}
                                                />
                                                <Area type="monotone" dataKey="revenue" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-white p-6 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Orders (Last 7 Days)
                                    </h3>
                                    <div className="mt-4 h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ordersSeries}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip
                                                    formatter={(value) => `${value} orders`}
                                                    labelFormatter={(label) => `Day ${label}`}
                                                />
                                                <Bar dataKey="orders" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
