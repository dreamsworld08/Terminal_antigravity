"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Eye, MousePointer } from "lucide-react";

const monthlyData = [
    { month: "Sep", revenue: 3735000 },
    { month: "Oct", revenue: 5146000 },
    { month: "Nov", revenue: 6474000 },
    { month: "Dec", revenue: 7885000 },
    { month: "Jan", revenue: 7304000 },
    { month: "Feb", revenue: 10578350 },
];

const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

export default function AdminAnalyticsPage() {
    return (
        <div>
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="font-display text-3xl text-white mb-1">Analytics</h1>
                <p className="text-gray-500 text-sm">Performance metrics and insights.</p>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Page Views", value: "24,532", change: "+18%", icon: Eye },
                    { label: "Click Rate", value: "4.7%", change: "+0.8%", icon: MousePointer },
                    { label: "Conv. Rate", value: "3.2%", change: "+0.3%", icon: TrendingUp },
                    { label: "Avg. Session", value: "4m 23s", change: "+12%", icon: BarChart3 },
                ].map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <kpi.icon size={16} className="text-luxury-gold" />
                            <span className="text-xs text-green-400">{kpi.change}</span>
                        </div>
                        <p className="text-2xl font-semibold text-white mb-1">{kpi.value}</p>
                        <p className="text-xs text-gray-500">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Chart (CSS-based bar chart) */}
            <motion.div
                className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="text-sm font-medium text-white mb-6">Monthly Revenue</h3>
                <div className="flex items-end gap-4 h-48">
                    {monthlyData.map((d, i) => (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-xs text-gray-500">₹{(d.revenue / 100000).toFixed(1)}L</span>
                            <motion.div
                                className="w-full bg-gradient-to-t from-luxury-gold/80 to-luxury-gold/40 rounded-t-md"
                                initial={{ height: 0 }}
                                animate={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                            />
                            <span className="text-xs text-gray-500">{d.month}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Integration Placeholders */}
            <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                    className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-[#4285F4]/20 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-[#4285F4]">G</span>
                        </div>
                        <div>
                            <h3 className="text-sm text-white">Google Analytics</h3>
                            <p className="text-xs text-gray-500">Tracking ID: {process.env.GA_TRACKING_ID || "Not configured"}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                        Connect your Google Analytics account to view detailed traffic and behavior data.
                    </p>
                    <button className="text-xs bg-white/5 text-gray-300 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                        Configure GA
                    </button>
                </motion.div>

                <motion.div
                    className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-[#1877F2]/20 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-[#1877F2]">M</span>
                        </div>
                        <div>
                            <h3 className="text-sm text-white">Meta Ads</h3>
                            <p className="text-xs text-gray-500">Pixel ID: {process.env.META_PIXEL_ID || "Not configured"}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                        Connect Meta Pixel to track ad conversions and optimize your campaigns.
                    </p>
                    <button className="text-xs bg-white/5 text-gray-300 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                        Configure Meta Ads
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
