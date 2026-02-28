"use client";

import { useState, useEffect } from "react";
import { Package, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, DollarSign, Activity } from "lucide-react";
import Link from "next/link";
// We would normally use Recharts here, but bypassing to use pure HTML/CSS for simple charts to avoid dependency issues
// if recharts isn't installed.

export default function IMSDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch("/api/ims/analytics");
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (isLoading) {
        return <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>;
    }

    const { kpis, alerts, recentMovements } = stats || {};

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time inventory metrics and alerts.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors">
                        Export Report
                    </button>
                    <Link href="/ims/forecast" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm transition-colors flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Run AI Forecast
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-blue-50 to-transparent opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Stock Value</h3>
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 relative z-10">{formatCurrency(kpis?.totalStockValue || 0)}</p>
                    <p className="text-sm text-green-600 mt-2 font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" /> +2.5% from last month
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-green-50 to-transparent opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Stock Health</h3>
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <Activity className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 relative z-10">{kpis?.stockHealth || 0}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${kpis?.stockHealth || 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-amber-50 to-transparent opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 relative z-10">{kpis?.lowStockCount || 0}</p>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Require reorder</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-purple-50 to-transparent opacity-50"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Pending POs</h3>
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <Package className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 relative z-10">{kpis?.pendingPOs || 0}</p>
                    <Link href="/ims/purchase-orders" className="text-sm text-purple-600 hover:text-purple-700 mt-2 font-medium flex items-center inline-flex group-hover:underline">
                        View orders <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visualizations / Charts */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Category Distribution</h2>
                    <div className="flex-1 flex items-center justify-center p-4">
                        {/* We use a simple CSS grid block chart since we don't have recharts installed */}
                        <div className="w-full space-y-4">
                            {stats?.salesByCategory?.map((cat: any, i: number) => {
                                const total = stats?.salesByCategory.reduce((sum: number, c: any) => sum + c.revenue, 0);
                                const percent = total > 0 ? (cat.revenue / total) * 100 : 0;
                                const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];
                                return (
                                    <div key={i} className="relative pt-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold capitalize text-gray-700">{cat.category}</span>
                                            <span className="text-sm font-medium text-gray-500">{formatCurrency(cat.revenue)}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className={`${colors[i % colors.length]} h-2 rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Alerts Panel */ }
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                Action Center <span className="ml-2 bg-red-100 text-red-600 text-xs py-0.5 px-2 rounded-full font-bold">{alerts?.length || 0}</span>
            </h2>
        </div>
        <div className="overflow-y-auto p-2 flex-1 max-h-[400px]">
            {alerts?.length > 0 ? (
                <div className="space-y-2">
                    {alerts.slice(0, 5).map((alert: any) => (
                        <div key={alert.id} className={`p-4 rounded-xl border ${alert.severity === 'critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div className="flex items-start">
                        {alert.severity === 'critical' ?
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" /> :
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        }
                        <div className="ml-3 flex-1">
                            <h4 className={`text-sm font-semibold ${alert.severity === 'critical' ? 'text-red-800' : 'text-amber-800'}`}>
                            {alert.inventory.product.name}
                        </h4>
                        <p className={`mt-1 text-sm ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                        {alert.message}
                    </p>
                    <div className="mt-3">
                        <button className="text-xs font-semibold bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                            Create PO
                        </button>
                    </div>
                </div>
                                        </div>
    </div>
                                ))
}
                            </div >
                        ) : (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
        <CheckCircle className="h-10 w-10 text-green-400 mb-3" />
        <p className="font-medium text-gray-900">All caught up!</p>
        <p className="text-sm mt-1">No pending alerts.</p>
    </div>
)}
                    </div >
    { alerts?.length > 5 && (
        <div className="p-3 border-t border-gray-100 text-center">
            <button className="text-sm text-gray-600 font-medium hover:text-gray-900">View all alerts</button>
        </div>
    )}
                </div >
            </div >

    {/* Recent Movements */ }
    < div className = "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Recent Stock Movements</h2>
                    <Link href="/ims/stock-movements" className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center group">
                        View all <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentMovements?.map((m: any) => (
                                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{m.inventory.product.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            m.type === 'in' ? 'bg-green-100 text-green-800' :
                                            m.type === 'out' ? 'bg-amber-100 text-amber-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {m.type === 'in' ? '+' : m.type === 'out' ? '-' : ''}{m.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">{m.quantity}</td>
                                    <td className="px-6 py-4 text-gray-500">{m.reason || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div >
            </div >
        </div >
    );
}
