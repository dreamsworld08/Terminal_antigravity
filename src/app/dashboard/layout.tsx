"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard, Package, Palette, MessageSquare,
    User, LogOut, ChevronLeft, Menu, X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";

// Client-side auth check to redirect admins away from the customer dashboard
function DashboardAuthCheck() {
    const router = useRouter();
    useEffect(() => {
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(session => {
                if (session?.user?.role === "admin") {
                    router.push("/admin");
                }
            })
            .catch(() => { });
    }, [router]);
    return null;
}

const sidebarLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "Orders", icon: Package },
    { href: "/dashboard/designs", label: "Saved Designs", icon: Palette },
    { href: "/dashboard/requests", label: "Custom Requests", icon: MessageSquare },
    { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-luxury-ivory flex">
            <DashboardAuthCheck />
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-luxury-white border-r border-luxury-sand/20 flex flex-col transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-luxury-sand/20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Logo className="w-8 h-8 group-hover:scale-105 transition-transform duration-500 delay-75" />
                        <div className="flex flex-col justify-center pt-1">
                            <span className="font-display text-lg tracking-[0.1em] text-luxury-black uppercase leading-none mb-1">
                                TERMINAL
                            </span>
                        </div>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
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
                                    ? "bg-luxury-cream text-luxury-black font-medium"
                                    : "text-luxury-gray hover:text-luxury-black hover:bg-luxury-cream/50"
                                    }`}
                            >
                                <link.icon size={18} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-4 border-t border-luxury-sand/20">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-luxury-stone hover:text-luxury-black transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Back to Store
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-luxury-stone hover:text-red-600 transition-colors w-full"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="h-16 border-b border-luxury-sand/20 bg-luxury-white/80 backdrop-blur-xl flex items-center px-6 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden mr-4"
                    >
                        <Menu size={20} />
                    </button>
                    <h2 className="text-sm tracking-widest uppercase text-luxury-stone">Dashboard</h2>
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
