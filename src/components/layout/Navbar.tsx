"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Logo } from "@/components/ui/Logo";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/products", label: "Collections" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { cartCount, setIsCartOpen } = useCart();
    const { data: session, status } = useSession();

    const userLink = status === "authenticated"
        ? ((session?.user as any)?.role === "admin" ? "/admin" : "/dashboard")
        : "/login";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-luxury-ivory/80 backdrop-blur-xl border-b border-luxury-sand/20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <Logo className="w-10 h-10 group-hover:scale-105 transition-transform duration-500 delay-75" />
                        <div className="flex flex-col items-center justify-center pt-1">
                            {/* <span className="font-display text-[9px] tracking-[0.4em] text-luxury-stone leading-none uppercase ml-1 relative">The</span> */}
                            <span className="font-display text-2xl tracking-[0.1em] text-luxury-black uppercase leading-none">
                                TERMINAL
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm tracking-widest uppercase text-luxury-gray hover:text-luxury-black transition-colors duration-300"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-5">
                        <Link
                            href={userLink}
                            className="p-2 text-luxury-gray hover:text-luxury-black transition-colors"
                        >
                            <User size={20} />
                        </Link>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="p-2 text-luxury-gray hover:text-luxury-black transition-colors relative"
                        >
                            <ShoppingBag size={20} />
                            {cartCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 bg-luxury-black text-luxury-ivory text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-luxury-black"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-luxury-ivory border-t border-luxury-sand/20"
                    >
                        <div className="px-6 py-8 space-y-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-lg tracking-wider text-luxury-gray hover:text-luxury-black transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-6 border-t border-luxury-sand/20 flex gap-6">
                                {status === "authenticated" ? (
                                    <Link
                                        href={userLink}
                                        onClick={() => setIsOpen(false)}
                                        className="text-sm tracking-widest uppercase text-luxury-gray hover:text-luxury-black"
                                    >
                                        {(session?.user as any)?.role === "admin" ? "Admin Panel" : "Dashboard"}
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="text-sm tracking-widest uppercase text-luxury-gray hover:text-luxury-black"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
