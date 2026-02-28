"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard, Package, ShoppingCart, Users,
    Settings, BarChart3, ChevronLeft, Menu, X, Shield,
    LogOut, Sparkles
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

const sidebarLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/studio", label: "Studio", icon: Sparkles },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-gray-200 flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Dark Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#141414] border-r border-white/5 flex flex-col transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Logo className="w-8 h-8 group-hover:scale-105 transition-transform duration-500 delay-75" />
                        <div className="flex flex-col justify-center">
                            <span className="font-display text-lg tracking-[0.1em] text-white uppercase leading-none mb-1">
                                TERMINAL
                            </span>
                            <span className="text-[9px] tracking-widest uppercase text-luxury-gold flex items-center gap-1 leading-none">
                                <Shield size={9} /> Admin
                            </span>
                        </div>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <link.icon size={18} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-4 border-t border-white/5">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={16} />
                        User Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="h-16 border-b border-white/5 bg-[#0f0f0f]/80 backdrop-blur-xl flex items-center px-6 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden mr-4 text-gray-400"
                    >
                        <Menu size={20} />
                    </button>
                    <h2 className="text-xs tracking-widest uppercase text-gray-500">Admin Panel</h2>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="w-8 h-8 bg-luxury-gold hover:bg-white transition-colors rounded-full flex items-center justify-center focus:outline-none"
                            >
                                <span className="text-xs font-bold text-luxury-black">A</span>
                            </button>

                            <AnimatePresence>
                                {profileOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setProfileOpen(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-white/5">
                                                <p className="text-sm font-medium text-white">Admin User</p>
                                                <p className="text-xs text-gray-500">admin@terminal.co</p>
                                            </div>
                                            <div className="p-1">
                                                <button
                                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg flex items-center gap-2 transition-colors"
                                                >
                                                    <LogOut size={14} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <motion.main
                    className="flex-1 p-6 lg:p-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
}
