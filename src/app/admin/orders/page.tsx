"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Eye, X, Clock, AlertCircle, Truck, CheckCircle,
    XCircle, ChevronDown, Package, MapPin, Phone, FileText
} from "lucide-react";

interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    options: string | null;
    product: { name: string; image: string; slug: string };
}

interface Order {
    id: string;
    status: string;
    total: number;
    address: string | null;
    phone: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    user: { name: string; email: string };
    items: OrderItem[];
}

const statusColors: Record<string, string> = {
    pending: "bg-amber-900/30 text-amber-400 border-amber-700/30",
    processing: "bg-blue-900/30 text-blue-400 border-blue-700/30",
    shipped: "bg-purple-900/30 text-purple-400 border-purple-700/30",
    delivered: "bg-green-900/30 text-green-400 border-green-700/30",
    cancelled: "bg-red-900/30 text-red-400 border-red-700/30",
};

const statusIcons: Record<string, typeof Clock> = {
    pending: Clock,
    processing: AlertCircle,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
};

const statusOptions = ["All", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/orders?all=true");
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            setOrders([]);
        }
        setLoading(false);
    };

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        setUpdatingStatus(orderId);
        try {
            const res = await fetch("/api/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: newStatus }),
            });
            if (!res.ok) throw new Error();
            setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
            }
            showToast(`Order status updated to ${newStatus}`, "success");
        } catch {
            showToast("Failed to update order status", "error");
        }
        setUpdatingStatus(null);
    };

    const filtered = orders.filter((o) => {
        if (statusFilter !== "All" && o.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                o.id.toLowerCase().includes(q) ||
                o.user?.name?.toLowerCase().includes(q) ||
                o.user?.email?.toLowerCase().includes(q) ||
                o.items?.some((item) => item.product?.name?.toLowerCase().includes(q))
            );
        }
        return true;
    });

    // Order stats
    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const processingCount = orders.filter((o) => o.status === "processing").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric"
        });
    };

    return (
        <div>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-sm ${toast.type === "success" ? "bg-green-900 text-green-100 border border-green-700" : "bg-red-900 text-red-100 border border-red-700"
                            }`}
                    >
                        {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="font-display text-3xl text-white mb-1">Orders</h1>
                <p className="text-gray-500 text-sm">Manage and track all customer orders.</p>
            </motion.div>

            {/* Order Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                    { label: "Total Orders", value: orders.length, color: "text-white" },
                    { label: "Pending", value: pendingCount, color: "text-amber-400" },
                    { label: "Processing", value: processingCount, color: "text-blue-400" },
                    { label: "Delivered", value: deliveredCount, color: "text-green-400" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4"
                    >
                        <p className={`text-xl font-semibold ${stat.color}`}>{loading ? "—" : stat.value}</p>
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by customer, order ID, or product..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 text-sm text-white rounded-lg focus:border-luxury-gold focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {statusOptions.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 text-xs tracking-wider uppercase rounded-lg transition-all whitespace-nowrap capitalize ${statusFilter === s
                                ? "bg-white/10 text-white"
                                : "text-gray-500 hover:text-white"
                                }`}
                        >
                            {s}
                            {s !== "All" && (
                                <span className="ml-1.5 text-[10px] opacity-60">
                                    ({orders.filter((o) => o.status === s).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <motion.div
                className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Order</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Customer</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Products</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Date</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Status</th>
                                <th className="text-right px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Total</th>
                                <th className="text-right px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        <td colSpan={7} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : filtered.length > 0 ? (
                                filtered.map((order) => {
                                    const StatusIcon = statusIcons[order.status] || Clock;
                                    return (
                                        <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-300 font-mono">{order.id.slice(0, 10)}…</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-200">{order.user?.name || "Guest"}</p>
                                                <p className="text-xs text-gray-500">{order.user?.email || ""}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {order.items?.slice(0, 2).map((item, i) => (
                                                        <div key={i} className="w-7 h-7 rounded overflow-hidden bg-white/5 shrink-0">
                                                            <img src={item.product?.image} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                    <span className="text-xs text-gray-400">
                                                        {order.items?.length === 1
                                                            ? order.items[0].product?.name
                                                            : `${order.items?.length || 0} items`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    disabled={updatingStatus === order.id}
                                                    className={`px-2.5 py-1 text-[11px] tracking-wider rounded-full border cursor-pointer capitalize appearance-none text-center ${statusColors[order.status]} ${updatingStatus === order.id ? "opacity-50" : ""}`}
                                                    style={{ paddingRight: "1.5rem", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "calc(100% - 6px) center" }}
                                                >
                                                    {statusOptions.filter((s) => s !== "All").map((s) => (
                                                        <option key={s} value={s} className="capitalize bg-[#1a1a1a] text-white">{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white text-right font-medium">₹{order.total.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-gray-500 hover:text-white transition-colors"
                                                    title="View details"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <Package size={32} className="mx-auto text-gray-600 mb-3" />
                                        <p className="text-sm text-gray-500">No orders found.</p>
                                        <p className="text-xs text-gray-600 mt-1">Orders will appear here as customers place them.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary footer */}
                {!loading && filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                        <span>Showing {filtered.length} of {orders.length} orders</span>
                        <span>Total: ₹{filtered.reduce((acc, o) => acc + o.total, 0).toLocaleString('en-IN')}</span>
                    </div>
                )}
            </motion.div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-2xl mb-12"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
                                <div>
                                    <h3 className="font-display text-xl text-white">Order Details</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{selectedOrder.id}</p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white p-1">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Status & Date */}
                                <div className="flex items-center gap-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border capitalize ${statusColors[selectedOrder.status]}`}>
                                        {(() => { const Icon = statusIcons[selectedOrder.status] || Clock; return <Icon size={12} />; })()}
                                        {selectedOrder.status}
                                    </span>
                                    <span className="text-xs text-gray-500">Placed {formatDate(selectedOrder.createdAt)}</span>
                                </div>

                                {/* Update Status */}
                                <div className="flex gap-2">
                                    {statusOptions.filter((s) => s !== "All").map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                            disabled={updatingStatus === selectedOrder.id || selectedOrder.status === status}
                                            className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${selectedOrder.status === status
                                                    ? "bg-white/10 text-white border border-white/20"
                                                    : "text-gray-500 hover:text-white hover:bg-white/5 border border-white/5"
                                                } ${updatingStatus === selectedOrder.id ? "opacity-50" : ""}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>

                                {/* Customer Info */}
                                <div className="bg-[#0f0f0f] border border-white/5 rounded-lg p-5">
                                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Customer</h4>
                                    <p className="text-sm text-gray-200 mb-1">{selectedOrder.user?.name || "Guest"}</p>
                                    <p className="text-xs text-gray-500">{selectedOrder.user?.email || ""}</p>
                                    {selectedOrder.phone && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                            <Phone size={11} />
                                            {selectedOrder.phone}
                                        </p>
                                    )}
                                    {selectedOrder.address && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin size={11} />
                                            {selectedOrder.address}
                                        </p>
                                    )}
                                    {selectedOrder.notes && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <FileText size={11} />
                                            {selectedOrder.notes}
                                        </p>
                                    )}
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Items</h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 bg-[#0f0f0f] border border-white/5 rounded-lg p-4">
                                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                                                    <img src={item.product?.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-200">{item.product?.name || "Product"}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    {item.options && <p className="text-xs text-gray-600 mt-0.5">{item.options}</p>}
                                                </div>
                                                <p className="text-sm text-white font-medium">₹{item.price.toLocaleString('en-IN')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-sm text-gray-400">Total</span>
                                    <span className="text-xl font-semibold text-white">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
