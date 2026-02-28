"use client";

import { motion } from "framer-motion";
import { Package, Palette, MessageSquare, ArrowUpRight } from "lucide-react";
import Link from "next/link";
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

export default function DashboardOverview() {
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

    const stats = [
        { label: "Total Orders", value: orders.length.toString(), icon: Package, href: "/dashboard/orders" },
        { label: "Saved Designs", value: "7", icon: Palette, href: "/dashboard/designs" },
        { label: "Custom Requests", value: "2", icon: MessageSquare, href: "/dashboard/requests" },
    ];

    return (
        <div>
            {/* Welcome */}
            <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="font-display text-3xl text-luxury-black mb-2">
                    Welcome back
                </h1>
                <p className="text-luxury-stone">
                    Here&apos;s an overview of your Terminal experience.
                </p>
            </motion.div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link href={stat.href} className="luxury-card p-6 flex items-start justify-between group block">
                            <div>
                                <p className="text-xs tracking-widest uppercase text-luxury-stone mb-2">{stat.label}</p>
                                <p className="font-display text-3xl text-luxury-black">{stat.value}</p>
                            </div>
                            <div className="w-10 h-10 bg-luxury-cream rounded-full flex items-center justify-center group-hover:bg-luxury-sand transition-colors">
                                <stat.icon size={18} className="text-luxury-brown" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl text-luxury-black">Recent Orders</h2>
                    <Link
                        href="/dashboard/orders"
                        className="text-xs tracking-widest uppercase text-luxury-stone hover:text-luxury-black flex items-center gap-1"
                    >
                        View All <ArrowUpRight size={12} />
                    </Link>
                </div>

                <div className="luxury-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-luxury-sand/20">
                                    <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Order</th>
                                    <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Product</th>
                                    <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Status</th>
                                    <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Date</th>
                                    <th className="text-right px-6 py-4 text-xs tracking-widest uppercase text-luxury-stone font-normal">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-luxury-stone text-sm">Loading orders...</td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-luxury-stone text-sm">No recent orders.</td>
                                    </tr>
                                ) : orders.slice(0, 3).map((order) => (
                                    <tr key={order.id} className="border-b border-luxury-sand/10 last:border-0 hover:bg-luxury-cream/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-luxury-black">
                                            {order.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-luxury-gray">
                                            {order.items && order.items.length > 0
                                                ? `${order.items[0].product.name}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}`
                                                : 'Unknown Product'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2.5 py-1 text-[11px] tracking-wider uppercase rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-luxury-stone">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm text-luxury-black text-right">₹{order.total.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
