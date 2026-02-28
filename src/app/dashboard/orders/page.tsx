"use client";

import { motion } from "framer-motion";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const statusColors: Record<string, string> = {
    "In Production": "bg-amber-100 text-amber-700",
    "Shipped": "bg-blue-100 text-blue-700",
    "Delivered": "bg-green-100 text-green-700",
    "Pending": "bg-gray-100 text-gray-700",
    "pending": "bg-gray-100 text-gray-700",
    "processing": "bg-amber-100 text-amber-700",
    "completed": "bg-green-100 text-green-700",
    "cancelled": "bg-red-100 text-red-700",
};

export default function OrdersPage() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            fetch(`/api/orders?userId=${session.user.id}`)
                .then(res => res.json())
                .then(data => {
                    setOrders(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [session]);
    return (
        <div>
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="font-display text-3xl text-luxury-black mb-2">Order History</h1>
                <p className="text-luxury-stone text-sm">Track and manage all your Terminal orders.</p>
            </motion.div>

            <motion.div
                className="luxury-card overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-luxury-sand/20">
                                <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Order ID</th>
                                <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Product</th>
                                <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Items</th>
                                <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Status</th>
                                <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Date</th>
                                <th className="text-right px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-luxury-stone text-sm">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-luxury-stone text-sm">You haven't placed any orders yet.</td>
                                </tr>
                            ) : orders.map((order, i) => (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-b border-luxury-sand/10 last:border-0 hover:bg-luxury-cream/30 transition-colors"
                                >
                                    <td className="px-6 py-4 text-sm font-medium text-luxury-black">
                                        {order.id.slice(0, 8).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-luxury-gray">
                                        {order.items && order.items.length > 0
                                            ? `${order.items[0].product.name}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}`
                                            : 'Unknown Product'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-luxury-stone">
                                        {order.items ? order.items.reduce((acc: number, item: any) => acc + item.quantity, 0) : 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-2.5 py-1 text-[11px] tracking-wider uppercase rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-luxury-stone">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm text-luxury-black text-right font-medium">₹{order.total.toLocaleString('en-IN')}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
