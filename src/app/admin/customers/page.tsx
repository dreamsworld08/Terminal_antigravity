"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, ShoppingCart, Search, Users, DollarSign } from "lucide-react";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string | null;
}

const statusStyles: Record<string, string> = {
    "VIP": "bg-purple-900/30 text-purple-400",
    "Active": "bg-green-900/30 text-green-400",
    "New": "bg-blue-900/30 text-blue-400",
};

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/customers")
            .then((r) => r.json())
            .then((data) => {
                setCustomers(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const getStatus = (c: Customer) => {
        if (c.totalSpent > 500000) return "VIP";
        if (c.orderCount > 0) return "Active";
        return "New";
    };

    const filtered = customers.filter((c) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    });

    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);
    const vipCount = customers.filter((c) => c.totalSpent > 500000).length;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            month: "short", year: "numeric"
        });
    };

    return (
        <div>
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="font-display text-3xl text-white mb-1">Customers</h1>
                <p className="text-gray-500 text-sm">Customer insights and management.</p>
            </motion.div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Total Customers", value: loading ? "—" : totalCustomers.toString(), icon: Users, color: "text-blue-400" },
                    { label: "VIP Customers", value: loading ? "—" : vipCount.toString(), icon: ShoppingCart, color: "text-purple-400" },
                    { label: "Total Revenue", value: loading ? "—" : `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: "text-green-400" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                                <stat.icon size={16} className={stat.color} />
                            </div>
                        </div>
                        <p className="text-2xl font-semibold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search customers..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 text-sm text-white rounded-lg focus:border-luxury-gold focus:outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <motion.div
                className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Customer</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Contact</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Orders</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Total Spent</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Joined</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : filtered.length > 0 ? (
                                filtered.map((c) => {
                                    const status = getStatus(c);
                                    return (
                                        <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xs text-gray-300">
                                                        {c.name?.split(" ").map((n) => n[0]).join("") || "?"}
                                                    </div>
                                                    <span className="text-sm text-gray-200">{c.name || "Guest"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <a href={`mailto:${c.email}`} className="text-gray-500 hover:text-white" title={c.email}><Mail size={14} /></a>
                                                    {c.phone && <a href={`tel:${c.phone}`} className="text-gray-500 hover:text-white" title={c.phone}><Phone size={14} /></a>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                                    <ShoppingCart size={13} />
                                                    {c.orderCount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white font-medium">
                                                {c.totalSpent > 0 ? `₹${c.totalSpent.toLocaleString('en-IN')}` : "₹0"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-[11px] rounded-full ${statusStyles[status]}`}>
                                                    {status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <Users size={32} className="mx-auto text-gray-600 mb-3" />
                                        <p className="text-sm text-gray-500">No customers found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-white/5 text-xs text-gray-500">
                        Showing {filtered.length} of {customers.length} customers
                    </div>
                )}
            </motion.div>
        </div>
    );
}
