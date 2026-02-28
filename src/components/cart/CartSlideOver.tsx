"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartSlideOver() {
    const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.push("/checkout");
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-luxury-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Sliding Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-luxury-white shadow-2xl flex flex-col border-l border-luxury-sand/20"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-luxury-sand/20 bg-luxury-ivory">
                            <h2 className="font-display text-xl text-luxury-black flex items-center gap-2">
                                <ShoppingBag size={20} />
                                Your Cart
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 text-luxury-stone hover:text-luxury-black transition-colors rounded-full hover:bg-luxury-cream"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-luxury-cream rounded-full flex items-center justify-center text-luxury-stone mb-2">
                                        <ShoppingBag size={24} />
                                    </div>
                                    <p className="text-luxury-stone">Your cart is currently empty.</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="text-sm tracking-widest uppercase pb-1 border-b border-luxury-black text-luxury-black hover:text-luxury-brown transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            {/* Image */}
                                            <div className="w-24 h-24 bg-luxury-cream rounded-lg overflow-hidden shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-sm font-medium text-luxury-black line-clamp-2">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-luxury-stone hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                {item.options && (
                                                    <p className="text-xs text-luxury-stone mb-2">{item.options}</p>
                                                )}

                                                <div className="mt-auto flex items-center justify-between">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center border border-luxury-sand/40 rounded bg-luxury-ivory">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-1.5 text-luxury-stone hover:text-luxury-black transition-colors"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-medium text-luxury-black">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-1.5 text-luxury-stone hover:text-luxury-black transition-colors"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>

                                                    <p className="text-sm font-medium text-luxury-black">
                                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer (Checkout) */}
                        {items.length > 0 && (
                            <div className="p-6 bg-luxury-ivory border-t border-luxury-sand/20 space-y-4">
                                <div className="flex items-center justify-between text-luxury-black">
                                    <span className="text-sm uppercase tracking-widest text-luxury-stone">Subtotal</span>
                                    <span className="text-xl font-display">₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <p className="text-xs text-luxury-stone text-center mb-4">
                                    Shipping & taxes calculated at checkout.
                                </p>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-luxury-black text-luxury-ivory py-4 text-sm tracking-widest uppercase hover:bg-luxury-charcoal transition-colors flex items-center justify-center gap-2 shadow-xl shadow-luxury-black/10"
                                >
                                    Proceed to Checkout
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
