"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Registration failed.");
                setLoading(false);
                return;
            }

            // Auto-login after successful registration
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                // If login fails for some reason, redirect to manual login
                window.location.href = "/login";
            } else {
                window.location.href = "/dashboard";
            }
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left - Image */}
            <div
                className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
                style={{
                    backgroundImage:
                        "url('/images/ui/ui-1631679706909-1844bbd07221.jpg')",
                }}
            >
                <div className="absolute inset-0 bg-luxury-black/40" />
                <div className="relative z-10 flex flex-col justify-end p-16">
                    <Link href="/" className="flex items-center gap-3 mb-auto group">
                        <Logo className="w-10 h-10 group-hover:scale-105 transition-transform duration-500 delay-75" />
                        <div className="flex flex-col items-center justify-center pt-1">
                            <span className="font-display text-2xl tracking-[0.1em] text-luxury-ivory uppercase leading-none">
                                TERMINAL
                            </span>
                        </div>
                    </Link>
                    <div>
                        <h2 className="font-display text-4xl text-luxury-ivory mb-4">
                            Join Terminal
                        </h2>
                        <p className="text-luxury-cream/70 max-w-md">
                            Create your account to save designs, request custom pieces, and access the full Terminal experience.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-luxury-ivory">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link href="/" className="lg:hidden flex items-center gap-3 mb-12 group">
                        <Logo className="w-10 h-10 group-hover:scale-105 transition-transform duration-500 delay-75" />
                        <div className="flex flex-col items-center justify-center pt-1">
                            <span className="font-display text-2xl tracking-[0.1em] text-luxury-black uppercase leading-none">
                                TERMINAL
                            </span>
                        </div>
                    </Link>

                    <h1 className="font-display text-3xl text-luxury-black mb-2">
                        Create Account
                    </h1>
                    <p className="text-luxury-stone text-sm mb-10">
                        Start your design journey with Terminal.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-stone" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                    className="w-full pl-12 pr-4 py-3 border border-luxury-sand/30 bg-luxury-white text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-stone" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 border border-luxury-sand/30 bg-luxury-white text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-stone" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    required
                                    minLength={8}
                                    className="w-full pl-12 pr-12 py-3 border border-luxury-sand/30 bg-luxury-white text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-stone"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-luxury-black text-luxury-ivory py-4 text-sm tracking-widest uppercase hover:bg-luxury-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Creating account..." : "Create Account"}
                            {!loading && <ArrowRight size={16} />}
                        </button>
                    </form>

                    <p className="text-center text-sm text-luxury-stone mt-8">
                        Already have an account?{" "}
                        <Link href="/login" className="text-luxury-brown hover:underline">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
