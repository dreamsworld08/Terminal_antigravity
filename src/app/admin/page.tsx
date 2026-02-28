"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    DollarSign, ShoppingCart, Users, TrendingUp, Package,
    ArrowUpRight, ArrowDownRight, Eye, Plus, Clock,
    AlertCircle, CheckCircle, Truck, XCircle
} from "lucide-react";

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    category: string;
    material: string;
    image: string;
    images: string;
    inStock: boolean;
    featured: boolean;
}

interface Order {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    user: { name: string; email: string };
    items: { product: { name: string; image: string }; quantity: number; price: number }[];
}

const statusColors: Record<string, string> = {
    pending: "bg-amber-900/30 text-amber-400",
    processing: "bg-blue-900/30 text-blue-400",
    shipped: "bg-purple-900/30 text-purple-400",
    delivered: "bg-green-900/30 text-green-400",
    cancelled: "bg-red-900/30 text-red-400",
};

const statusIcons: Record<string, typeof Clock> = {
    pending: Clock,
    processing: AlertCircle,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
};

export default function AdminOverview() {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/products").then((r) => r.json()),
            fetch("/api/orders").then((r) => r.json()).catch(() => []),
        ]).then(([productsData, ordersData]) => {
            setProducts(productsData);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setLoading(false);
        });
    }, []);

    // Compute live stats
    const totalProducts = products.length;
    const inStockCount = products.filter((p) => p.inStock).length;
    const featuredCount = products.filter((p) => p.featured).length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products by frequency in orders
    const productSalesMap = new Map<string, { name: string; count: number; image: string }>();
    orders.forEach((o) => {
        o.items?.forEach((item) => {
            const key = item.product?.name || "Unknown";
            const existing = productSalesMap.get(key);
            if (existing) {
                existing.count += item.quantity;
            } else {
                productSalesMap.set(key, {
                    name: key,
                    count: item.quantity,
                    image: item.product?.image || "",
                });
            }
        });
    });
    const topProducts = Array.from(productSalesMap.values()).sort((a, b) => b.count - a.count).slice(0, 5);

    // Category distribution
    const categoryMap = new Map<string, number>();
    products.forEach((p) => {
        categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
    });
    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        percentage: Math.round((count / totalProducts) * 100) || 0,
    }));

    const stats = [
        { label: "Total Revenue", value: totalRevenue > 0 ? `₹${totalRevenue.toLocaleString('en-IN')}` : "₹0", change: "+12.5%", up: true, icon: DollarSign, color: "text-emerald-400" },
        { label: "Total Orders", value: totalOrders.toString(), change: "+8.2%", up: true, icon: ShoppingCart, color: "text-blue-400" },
        { label: "Total Products", value: totalProducts.toString(), change: `${inStockCount} in stock`, up: true, icon: Package, color: "text-purple-400" },
        { label: "Avg. Order Value", value: avgOrderValue > 0 ? `₹${Math.round(avgOrderValue).toLocaleString('en-IN')}` : "—", change: "+3.1%", up: true, icon: TrendingUp, color: "text-luxury-gold" },
    ];

    return (
        <div>
            {/* Header with greeting */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="font-display text-3xl text-white mb-1">
                    Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"} 👋
                </h1>
                <p className="text-gray-500 text-sm">Here's what's happening with your store today.</p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="flex flex-wrap gap-3 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <Link href="/admin/products" className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-luxury-black text-xs tracking-widest uppercase rounded-lg hover:bg-luxury-sand transition-colors">
                    <Plus size={14} />
                    Add Product
                </Link>
                <Link href="/admin/orders" className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 text-xs tracking-widest uppercase rounded-lg hover:bg-white/10 transition-colors">
                    <ShoppingCart size={14} />
                    View Orders
                </Link>
                <Link href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 text-xs tracking-widest uppercase rounded-lg hover:bg-white/10 transition-colors">
                    <Eye size={14} />
                    View Store
                </Link>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 group hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon size={18} className={stat.color} />
                            </div>
                            {loading ? (
                                <div className="w-12 h-4 bg-white/5 rounded animate-pulse" />
                            ) : (
                                <span className={`flex items-center gap-1 text-xs ${stat.up ? "text-green-400" : "text-red-400"}`}>
                                    {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        {loading ? (
                            <div className="h-7 bg-white/5 rounded w-24 animate-pulse mb-1" />
                        ) : (
                            <p className="text-2xl font-semibold text-white mb-1">{stat.value}</p>
                        )}
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Pending Orders Alert */}
            {!loading && pendingOrders > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8 bg-amber-900/10 border border-amber-700/20 rounded-xl p-4 flex items-center gap-4"
                >
                    <div className="w-10 h-10 bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <AlertCircle size={18} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-amber-200">You have {pendingOrders} pending order{pendingOrders > 1 ? "s" : ""} requiring attention</p>
                        <p className="text-xs text-amber-400/60 mt-0.5">Review and process these orders promptly</p>
                    </div>
                    <Link href="/admin/orders" className="text-xs text-amber-400 hover:underline shrink-0">
                        View Orders →
                    </Link>
                </motion.div>
            )}

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Recent Orders */}
                <motion.div
                    className="lg:col-span-2 bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <ShoppingCart size={14} className="text-gray-500" />
                            Recent Orders
                        </h3>
                        <Link href="/admin/orders" className="text-xs text-luxury-gold hover:underline">View All →</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left px-6 py-3 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Order</th>
                                    <th className="text-left px-6 py-3 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Customer</th>
                                    <th className="text-left px-6 py-3 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Status</th>
                                    <th className="text-right px-6 py-3 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="border-b border-white/5">
                                            <td colSpan={4} className="px-6 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                                        </tr>
                                    ))
                                ) : orders.length > 0 ? (
                                    orders.slice(0, 5).map((order) => {
                                        const StatusIcon = statusIcons[order.status] || Clock;
                                        return (
                                            <tr key={order.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                <td className="px-6 py-3">
                                                    <span className="text-sm text-gray-300 font-mono">{order.id.slice(0, 8)}…</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <p className="text-sm text-gray-200">{order.user?.name || "Guest"}</p>
                                                    <p className="text-xs text-gray-500">{order.user?.email || ""}</p>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] rounded-full capitalize ${statusColors[order.status] || statusColors.pending}`}>
                                                        <StatusIcon size={10} />
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-white text-right font-medium">₹{order.total.toLocaleString('en-IN')}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                                            No orders yet. Orders will appear here as customers place them.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Right column: Product Catalog Summary + Category Breakdown */}
                <div className="space-y-6">
                    {/* Product Summary */}
                    <motion.div
                        className="bg-[#1a1a1a] border border-white/5 rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                <Package size={14} className="text-gray-500" />
                                Product Catalog
                            </h3>
                            <Link href="/admin/products" className="text-xs text-luxury-gold hover:underline">Manage →</Link>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="text-center">
                                            <p className="text-2xl font-semibold text-white">{totalProducts}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-500">Total</p>
                                        </div>
                                        <div className="text-center border-x border-white/5">
                                            <p className="text-2xl font-semibold text-green-400">{inStockCount}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-500">In Stock</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-semibold text-luxury-gold">{featuredCount}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-500">Featured</p>
                                        </div>
                                    </div>

                                    {/* Category breakdown */}
                                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">By Category</h4>
                                    <div className="space-y-2.5">
                                        {categories.map((cat) => (
                                            <div key={cat.name}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-300 capitalize">{cat.name}</span>
                                                    <span className="text-[10px] text-gray-500">{cat.count} products</span>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-luxury-gold/60 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${cat.percentage}%` }}
                                                        transition={{ delay: 0.5, duration: 0.6 }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Top Products */}
                    {topProducts.length > 0 && (
                        <motion.div
                            className="bg-[#1a1a1a] border border-white/5 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="px-6 py-4 border-b border-white/5">
                                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                    <TrendingUp size={14} className="text-gray-500" />
                                    Top Products
                                </h3>
                            </div>
                            <div className="p-4 space-y-2">
                                {topProducts.map((product, i) => (
                                    <div key={product.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.02]">
                                        <span className="text-xs text-gray-600 w-4 text-right">#{i + 1}</span>
                                        {product.image && (
                                            <div className="w-8 h-8 rounded overflow-hidden bg-white/5 shrink-0">
                                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-200 truncate">{product.name}</p>
                                            <p className="text-[10px] text-gray-500">{product.count} units</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Inventory Grid — quick view of all products */}
            <motion.div
                className="bg-[#1a1a1a] border border-white/5 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                        <Package size={14} className="text-gray-500" />
                        Inventory Overview
                    </h3>
                    <Link href="/admin/products" className="text-xs text-luxury-gold hover:underline">View All →</Link>
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-square bg-white/5 rounded-lg mb-2" />
                                    <div className="h-3 bg-white/5 rounded w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {products.slice(0, 12).map((product) => {
                                let variantCount = 0;
                                try {
                                    const parsed = JSON.parse(product.images);
                                    if (Array.isArray(parsed)) variantCount = parsed.length;
                                } catch { }

                                return (
                                    <Link
                                        key={product.id}
                                        href={`/admin/products`}
                                        className="group"
                                    >
                                        <div className="aspect-square rounded-lg overflow-hidden bg-white/5 mb-2 relative">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {!product.inStock && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-[10px] uppercase tracking-wider text-red-400">Out of Stock</span>
                                                </div>
                                            )}
                                            {variantCount > 1 && (
                                                <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded">
                                                    {variantCount} colors
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-300 truncate group-hover:text-white transition-colors">{product.name}</p>
                                        <p className="text-[10px] text-gray-500">₹{product.price.toLocaleString('en-IN')}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
