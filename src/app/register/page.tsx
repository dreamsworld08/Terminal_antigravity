"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, User, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}
declare var grecaptcha: any;

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            });
        }
    }, []);

    const formatPhoneNumber = (number: string) => {
        if (!number.startsWith("+")) {
            return `+${number.replace(/\D/g, "")}`;
        }
        return number;
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!name.trim()) {
            setError("Please enter your full name first.");
            return;
        }

        setLoading(true);

        try {
            const formattedNumber = formatPhoneNumber(phoneNumber);
            if (!window.recaptchaVerifier) throw new Error("Recaptcha not initialized");
            
            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setStep("otp");
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to send OTP. Please try again.");
            setLoading(false);
            
            if (window.recaptchaVerifier && typeof window.recaptchaVerifier.render === 'function') {
                try {
                  window.recaptchaVerifier.render().then((widgetId) => {
                    grecaptcha.reset(widgetId);
                  });
                } catch(e) {}
            }
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (!confirmationResult) throw new Error("No OTP request found.");
            
            const result = await confirmationResult.confirm(otp);
            const user = result.user;
            const idToken = await user.getIdToken();

            // First, trigger internal database setup if needed, and update the name
            await fetch("/api/auth/register-phone", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ name, phone: user.phoneNumber }),
            });

            // Sign in to NextAuth
            const signInResult = await signIn("phone", {
                phone: user.phoneNumber,
                idToken,
                redirect: false,
            });

            if (signInResult?.error) {
                setError("Terminal authentication failed.");
                setLoading(false);
            } else {
                window.location.href = "/dashboard";
            }
        } catch (err: any) {
            console.error(err);
            setError("Registration failed or invalid OTP.");
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

                    {step === "phone" ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
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
                                    Mobile Number
                                </label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-stone" />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+1 234 567 8900"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-luxury-sand/30 bg-luxury-white text-sm"
                                    />
                                </div>
                                <p className="text-xs text-luxury-stone mt-2">
                                    Include your country code (e.g., +1 for US, +91 for India)
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !phoneNumber || !name}
                                className="w-full bg-luxury-black text-luxury-ivory py-4 text-sm tracking-widest uppercase hover:bg-luxury-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? "Authenticating..." : "Get OTP"}
                                {!loading && <ArrowRight size={16} />}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">
                                    Enter OTP
                                </label>
                                <div className="relative">
                                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-stone" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        required
                                        maxLength={6}
                                        className="w-full pl-12 pr-4 py-3 border border-luxury-sand/30 bg-luxury-white text-sm text-center tracking-[0.5em]"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-luxury-black text-luxury-ivory py-4 text-sm tracking-widest uppercase hover:bg-luxury-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? "Verifying..." : "Verify & Create Account"}
                                {!loading && <ArrowRight size={16} />}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep("phone");
                                    setOtp("");
                                    setError("");
                                }}
                                className="w-full text-center text-xs text-luxury-stone hover:text-luxury-black mt-4"
                            >
                                Use a different phone number
                            </button>
                        </form>
                    )}
                    
                    <div id="recaptcha-container"></div>

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
