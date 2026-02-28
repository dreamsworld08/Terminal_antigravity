"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ArrowLeftRight,
    Truck,
    ShoppingCart,
    TrendingUp,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    Search
} from "lucide-react";

export default function IMSLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState<{ name: string, role: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Authenticate IMS session
        const init = async () => {
            const token = localStorage.getItem("ims_token");
            if (!token) {
                if (pathname !== "/ims/login") {
                    router.push("/ims/login");
                }
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/ims/auth", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Invalid session");

                const data = await res.json();
                setUser(data.user);

                if (pathname === "/ims/login") {
                    router.push("/ims");
                }
            } catch (err) {
                localStorage.removeItem("ims_token");
                if (pathname !== "/ims/login") {
                    router.push("/ims/login");
                }
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [router, pathname]);

    const handleLogout = () => {
        localStorage.removeItem("ims_token");
        localStorage.removeItem("ims_user");
        router.push("/ims/login");
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;
    }

    if (pathname === "/ims/login") {
        return <>{children}</>;
    }

    const navigation = [
        { name: "Dashboard", href: "/ims", icon: LayoutDashboard },
        { name: "Inventory", href: "/ims/inventory", icon: Package },
        { name: "Movements", href: "/ims/stock-movements", icon: ArrowLeftRight },
        { name: "Suppliers", href: "/ims/suppliers", icon: Truck },
        { name: "Purchase Orders", href: "/ims/purchase-orders", icon: ShoppingCart },
        { name: "AI Forecast", href: "/ims/forecast", icon: TrendingUp },
        { name: "Settings", href: "/ims/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
                <div className="flex flex-col h-full">
                    <div className="h-16 flex items-center px-6 border-b border-gray-800">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                            <span className="text-xl font-bold text-gray-900">T</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">IMS Pro</span>
                        <button className="ml-auto lg:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? "bg-gray-800 text-white"
                                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                        }`}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-gray-800">
                        <div className="flex items-center px-2 py-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center">
                                <span className="text-sm font-medium">{user?.name?.charAt(0) || 'A'}</span>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
                            </div>
                            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors" title="Logout">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 hidden sm:flex">
                    <div className="flex items-center flex-1">
                        <button className="text-gray-500 hover:text-gray-700 lg:hidden mr-4" onClick={() => setIsSidebarOpen(true)}>
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="max-w-md w-full relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-gray-900 focus:border-gray-900 sm:text-sm bg-gray-50 focus:bg-white transition-colors"
                                placeholder="Search inventory, orders, SKU..."
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="relative text-gray-400 hover:text-gray-500">
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                            <Bell className="h-6 w-6" />
                        </button>
                        <Link href="/" target="_blank" className="text-sm text-gray-500 hover:text-gray-900 font-medium border border-gray-200 px-3 py-1.5 rounded-lg flex items-center">
                            Storefront <ArrowLeftRight className="ml-2 h-3 w-3" />
                        </Link>
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:hidden z-10">
                    <button className="text-gray-500" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-bold">IMS Pro</span>
                    <button className="text-gray-400">
                        <span className="absolute top-4 right-4 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                        <Bell className="h-6 w-6" />
                    </button>
                </header>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
