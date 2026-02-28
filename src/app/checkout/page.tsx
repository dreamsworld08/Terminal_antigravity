"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Lock, MapPin, Phone, User as UserIcon } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const { items, cartTotal, clearCart } = useCart();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        name: session?.user?.name || "",
        phone: "",
        address: "",
        notes: "",
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/checkout");
        }
    }, [status, router]);

    // If completely empty, redirect back
    if (items.length === 0 && !success) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-luxury-ivory px-6 text-center">
                    <div>
                        <h1 className="font-display text-3xl text-luxury-black mb-4">Your cart is empty</h1>
                        <p className="text-luxury-stone mb-8">Add items to your cart to checkout.</p>
                        <Link href="/products" className="text-sm tracking-widest uppercase border-b border-luxury-black pb-1 hover:text-luxury-brown transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    if (status === "unauthenticated" || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
                <div className="w-8 h-8 border-2 border-luxury-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate payment processing delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Create Order
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: (session?.user as any)?.id,
                    total: cartTotal,
                    address: form.address,
                    phone: form.phone,
                    notes: form.notes,
                    items: items.map(i => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        price: i.price,
                        options: i.options
                    }))
                }),
            });

            if (!res.ok) throw new Error("Failed to create order");

            clearCart();
            setSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Checkout failed. Please try again.");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-luxury-ivory px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full bg-luxury-white p-12 shadow-xl border border-luxury-sand/20"
                    >
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={32} />
                        </div>
                        <h1 className="font-display text-3xl text-luxury-black mb-4">Order Confirmed</h1>
                        <p className="text-luxury-stone mb-8">Thank you for your purchase. We will contact you soon regarding shipping details.</p>
                        <Link href="/dashboard/orders" className="block w-full bg-luxury-black text-luxury-ivory py-4 text-sm tracking-widest uppercase hover:bg-luxury-charcoal transition-colors">
                            View Your Orders
                        </Link>
                    </motion.div>
                </div>
            </>
        );
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-[#faf9f6]">
            {/* Minimal Header */}
            <header className="h-20 border-b border-luxury-sand/20 bg-luxury-ivory flex items-center px-6 lg:px-12">
                <Link href="/" className="font-display text-2xl tracking-wider text-luxury-black">
                    TERMINAL
                </Link>
                <Link href="/products" className="ml-auto flex items-center gap-2 text-sm text-luxury-stone hover:text-luxury-black">
                    <ArrowLeft size={16} /> Returns to store
                </Link>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20 grid lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left - Checkout Form */}
                <div className="lg:col-span-7">
                    <h1 className="font-display text-3xl text-luxury-black mb-2">Checkout</h1>
                    <p className="text-luxury-stone mb-10 text-sm">Please provide your details below to complete your order.</p>

                    <form onSubmit={handleCheckout} className="space-y-8">
                        {/* Contact Info */}
                        <section>
                            <h2 className="text-sm tracking-widest uppercase text-luxury-black mb-6">Contact Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 relative">
                                    <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-stone" />
                                    <input
                                        type="text" name="name" placeholder="Full Name" required
                                        value={form.name} onChange={handleInput}
                                        className="w-full pl-12 pr-4 py-3 border border-luxury-sand/40 bg-luxury-white focus:outline-none focus:border-luxury-black text-sm"
                                    />
                                </div>
                                <div className="col-span-2 relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-stone" />
                                    <input
                                        type="tel" name="phone" placeholder="Phone Number" required
                                        value={form.phone} onChange={handleInput}
                                        className="w-full pl-12 pr-4 py-3 border border-luxury-sand/40 bg-luxury-white focus:outline-none focus:border-luxury-black text-sm"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Shipping */}
                        <section>
                            <h2 className="text-sm tracking-widest uppercase text-luxury-black mb-6 mt-4">Shipping Address</h2>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-4 text-luxury-stone" />
                                <textarea
                                    name="address" placeholder="Full Shipping Address" required rows={3}
                                    value={form.address} onChange={handleInput}
                                    className="w-full pl-12 pr-4 py-3 border border-luxury-sand/40 bg-luxury-white focus:outline-none focus:border-luxury-black text-sm resize-none"
                                />
                            </div>
                            <div className="mt-4">
                                <textarea
                                    name="notes" placeholder="Delivery Notes (Optional)" rows={2}
                                    value={form.notes} onChange={handleInput}
                                    className="w-full px-4 py-3 border border-luxury-sand/40 bg-luxury-white focus:outline-none focus:border-luxury-black text-sm resize-none"
                                />
                            </div>
                        </section>

                        {/* Payment Mock */}
                        <section>
                            <h2 className="text-sm tracking-widest uppercase text-luxury-black mb-6 mt-4">Payment</h2>
                            <div className="p-4 bg-luxury-cream border border-luxury-sand/30 flex items-start gap-3">
                                <Lock size={20} className="text-luxury-stone shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-luxury-black font-medium mb-1">Secure Checkout Simulation</p>
                                    <p className="text-xs text-luxury-stone">For testing purposes, no actual payment is required. Clicking "Place Order" will simulate a successful transaction and create your order.</p>
                                </div>
                            </div>
                        </section>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || status !== "authenticated"}
                            className="w-full bg-luxury-black text-luxury-ivory py-4 text-sm tracking-widest uppercase hover:bg-luxury-charcoal transition-colors disabled:opacity-50 mt-8 shadow-xl shadow-luxury-black/10"
                        >
                            {loading ? "Processing..." : `Place Order — ₹${cartTotal.toLocaleString('en-IN')}`}
                        </button>
                    </form>
                </div>

                {/* Right - Order Summary */}
                <div className="lg:col-span-5">
                    <div className="sticky top-8 bg-luxury-white border border-luxury-sand/20 p-6 lg:p-10 shadow-sm">
                        <h2 className="text-sm tracking-widest uppercase text-luxury-black mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                            {items.map(item => (
                                <div key={item.id} className="flex gap-4 items-start">
                                    <div className="relative w-20 h-20 bg-luxury-cream shrink-0 border border-luxury-sand/20 rounded">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        <div className="absolute -top-2 -right-2 bg-luxury-black text-luxury-ivory text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                            {item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-luxury-black leading-tight mb-1">{item.name}</p>
                                        {item.options && <p className="text-xs text-luxury-stone mb-2">{item.options}</p>}
                                        <p className="text-sm text-luxury-black">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-luxury-sand/20 text-sm">
                            <div className="flex justify-between text-luxury-stone">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-luxury-stone">
                                <span>Shipping</span>
                                <span>Calculated next step</span>
                            </div>
                            <div className="flex justify-between text-luxury-black font-medium text-lg pt-4">
                                <span>Total</span>
                                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
