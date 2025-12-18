import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

export default function Index({ auth }) {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", price: "", stock_quantity: "", image: null, remove_image: false });
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}`, {
                credentials: "same-origin",
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            setMessage(e.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []); // eslint-disable-line

    function openCreate() {
        setEditing(null);
        setForm({ name: "", price: "", stock_quantity: "", image: null, remove_image: false });
    }

    function openEdit(p) {
        setEditing(p);
        setForm({
            name: p.name || "",
            price: String(p.price ?? ""),
            stock_quantity: String(p.stock_quantity ?? ""),
            image: null,
            remove_image: false,
        });
    }

    function csrf() {
        return document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "";
    }

    async function save() {
        setSaving(true);
        setMessage(null);
        try {
            const fd = new FormData();
            fd.append("name", form.name);
            fd.append("price", form.price);
            fd.append("stock_quantity", form.stock_quantity);
            if (form.image) fd.append("image", form.image);
            if (form.remove_image) fd.append("remove_image", "1");

            const url = editing ? `/api/admin/products/${editing.id}` : `/api/admin/products`;
            const res = await fetch(url, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrf(),
                },
                body: fd,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Save failed (${res.status}): ${text}`);
            }

            openCreate();
            await load();
            setMessage("Saved");
        } catch (e) {
            setMessage(e.message || "Save failed");
        } finally {
            setSaving(false);
        }
    }

    async function del(p) {
        if (!confirm(`Delete "${p.name}"?`)) return;
        setMessage(null);
        try {
            const res = await fetch(`/api/admin/products/${p.id}`, {
                method: "DELETE",
                credentials: "same-origin",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrf(),
                },
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Delete failed (${res.status}): ${text}`);
            }
            await load();
            setMessage("Deleted");
        } catch (e) {
            setMessage(e.message || "Delete failed");
        }
    }

    const title = useMemo(() => (editing ? `Edit #${editing.id}` : "Create Product"), [editing]);

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl font-semibold">Admin · Products</h2>}>
            <Head title="Admin Products" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    {message && (
                        <div className="mb-4 rounded-md border border-gray-200 bg-white p-3 text-sm">
                            {message}
                        </div>
                    )}

                    <div className="mb-4 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-2">
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm md:w-72"
                                placeholder="Search by name..."
                            />
                            <button
                                onClick={load}
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                Search
                            </button>
                        </div>

                        <button
                            onClick={openCreate}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                        >
                            + New Product
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow-sm">
                            {loading ? (
                                <p className="text-sm text-gray-600">Loading...</p>
                            ) : items.length === 0 ? (
                                <p className="text-sm text-gray-600">No products.</p>
                            ) : (
                                <div className="divide-y">
                                    {items.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between gap-3 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-14 w-14 overflow-hidden rounded-md border bg-gray-50">
                                                    {p.image_url ? (
                                                        <img
                                                            src={p.image_url}
                                                            alt={p.name}
                                                            className="h-14 w-14 rounded object-cover border"
                                                        />
                                                    ) : (
                                                        <div className="h-14 w-14 rounded border bg-gray-50 text-xs text-gray-400 flex items-center justify-center">
                                                            No image
                                                        </div>
                                                    )}

                                                </div>

                                                <div>
                                                    <div className="font-medium">{p.name}</div>
                                                    <div className="text-xs text-gray-600">
                                                        #{p.id} · ${((p.price || 0) / 100).toFixed(2)} · Stock: {p.stock_quantity}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(p)}
                                                    className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => del(p)}
                                                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-semibold">{title}</h3>

                            <label className="mt-4 block text-sm font-medium text-gray-700">Name</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                className="mt-1 w-full rounded-md border-gray-300 text-sm"
                            />

                            <label className="mt-4 block text-sm font-medium text-gray-700">Price (cents)</label>
                            <input
                                value={form.price}
                                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                className="mt-1 w-full rounded-md border-gray-300 text-sm"
                                inputMode="numeric"
                            />

                            <label className="mt-4 block text-sm font-medium text-gray-700">Stock</label>
                            <input
                                value={form.stock_quantity}
                                onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                                className="mt-1 w-full rounded-md border-gray-300 text-sm"
                                inputMode="numeric"
                            />

                            <label className="mt-4 block text-sm font-medium text-gray-700">Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))}
                                className="mt-1 w-full text-sm"
                            />

                            {editing?.image_path && (
                                <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={form.remove_image}
                                        onChange={(e) => setForm((f) => ({ ...f, remove_image: e.target.checked }))}
                                    />
                                    Remove current image
                                </label>
                            )}

                            <button
                                onClick={save}
                                disabled={saving}
                                className="mt-6 w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-gray-800"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
