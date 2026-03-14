"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Phone, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}
declare var grecaptcha: any;

export default function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [error, setError] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    // Cooldown timer for Resend OTP
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    useEffect(() => {
        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                    // @ts-ignore
                    window.recaptchaVerifier = null;
                } catch (e) {}
            }
        };
    }, []);

    const formatPhoneNumber = (number: string) => {
        const cleaned = number.replace(/\D/g, "");
        return number.startsWith("+") ? `+${cleaned}` : `+${cleaned}`;
    };

    const validatePhoneNumber = (number: string) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(number.replace(/\s+/g, ""));
    };

    const handleSendOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError("");
        
        const formattedNumber = formatPhoneNumber(phoneNumber);
        if (!validatePhoneNumber(formattedNumber)) {
            setError("Please enter a valid phone number with country code (e.g., +917976614691).");
            return;
        }

        setIsSending(true);

        try {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            });
            
            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setStep("otp");
            setResendCooldown(60); // Start 60s cooldown
        } catch (err: any) {
            console.error("SMS Send Error (Full Object):", JSON.stringify(err, null, 2));
            console.error("SMS Send Error Code:", err.code);
            console.error("SMS Send Error Message:", err.message);
            
            let message = "Failed to send OTP. Please try again.";
            if (err.code === "auth/invalid-app-credential") {
                message = "Invalid app credential. Ensure the domain (like 127.0.0.1) is authorized in Firebase Console and your API key has no restrictions.";
            } else if (err.code === "auth/too-many-requests") {
                message = "Too many requests. Please try again later.";
            } else if (err.code === "auth/invalid-phone-number") {
                message = "The phone number is invalid. Use international format (e.g., +91...).";
            } else if (err.message) {
                message = err.message;
            }

            setError(message);
            // Re-render/reset recaptcha if it fails
            if (window.recaptchaVerifier) {
                try {
                    const widgetId = await window.recaptchaVerifier.render();
                    grecaptcha.reset(widgetId);
                } catch(e) {}
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (otp.length < 6) {
            setError("Please enter a 6-digit OTP.");
            return;
        }

        setIsVerifying(true);

        try {
            if (!confirmationResult) throw new Error("No OTP request found.");
            
            const result = await confirmationResult.confirm(otp);
            const user = result.user;
            const idToken = await user.getIdToken();

            const signInResult = await signIn("phone", {
                phone: user.phoneNumber,
                idToken,
                redirect: false,
            });

            if (signInResult?.error) {
                setError("Terminal authentication failed. Could not sync with customer profile.");
            } else {
                window.location.href = "/dashboard";
            }
        } catch (err: any) {
            console.error("Verification Error:", err);
            let message = "Invalid OTP entered. Please try again.";
            if (err.code === "auth/code-expired") {
                message = "OTP has expired. Please request a new one.";
            } else if (err.code === "auth/invalid-verification-code") {
                message = "Invalid verification code. Please check and try again.";
            }
            setError(message);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left - Image */}
            <div
                className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
                style={{
                    backgroundImage:
                        "url('/images/ui/ui-1618221195710-dd6b41faaea6.jpg')",
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
                            Welcome Back
                        </h2>
                        <p className="text-luxury-cream/70 max-w-md">
                            Sign in to access your dashboard, saved designs, and custom furniture requests.
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
                    {/* Mobile Logo */}
                    <Link href="/" className="lg:hidden flex items-center gap-3 mb-12 group">
                        <Logo className="w-10 h-10 group-hover:scale-105 transition-transform duration-500 delay-75" />
                        <div className="flex flex-col items-center justify-center pt-1">
                            <span className="font-display text-2xl tracking-[0.1em] text-luxury-black uppercase leading-none">
                                TERMINAL
                            </span>
                        </div>
                    </Link>

                    <h1 className="font-display text-3xl text-luxury-black mb-2">
                        Sign In or Sign Up
                    </h1>
                    <p className="text-luxury-stone text-sm mb-10">
                        Enter your mobile number to access your account or create a new one.
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
                                    Mobile Number
                                </label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-stone" />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+91 79766 14691"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-luxury-sand/30 bg-luxury-white text-sm"
                                    />
                                </div>
                                <p className="text-xs text-luxury-stone mt-2">
                                    Include your country code (e.g., +91 for India)
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSending || !phoneNumber}
                                className="w-full bg-luxury-black text-luxury-ivory py-4 text-sm tracking-widest uppercase hover:bg-luxury-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSending ? "Sending OTP..." : "Get OTP"}
                                {!isSending && <ArrowRight size={16} />}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block text-center">
                                    OTP sent to {phoneNumber}
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
                                disabled={isVerifying || otp.length < 6}
                                className="w-full bg-luxury-black text-luxury-ivory py-4 text-sm tracking-widest uppercase hover:bg-luxury-charcoal transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isVerifying ? "Verifying..." : "Verify & Sign In"}
                                {!isVerifying && <ArrowRight size={16} />}
                            </button>
                            
                            <div className="flex flex-col gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => handleSendOTP()}
                                    disabled={isSending || resendCooldown > 0}
                                    className="text-xs text-luxury-brown hover:underline disabled:text-luxury-stone disabled:no-underline"
                                >
                                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep("phone");
                                        setOtp("");
                                        setError("");
                                    }}
                                    className="text-center text-xs text-luxury-stone hover:text-luxury-black"
                                >
                                    Use a different phone number
                                </button>
                            </div>
                        </form>
                    )}
                    
                    <div id="recaptcha-container"></div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-luxury-sand/30" />
                        <span className="text-xs text-luxury-stone">or</span>
                        <div className="flex-1 h-px bg-luxury-sand/30" />
                    </div>

                    {/* Google */}
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        className="w-full border border-luxury-sand/30 py-3 text-sm text-luxury-gray hover:border-luxury-black hover:text-luxury-black transition-colors flex items-center justify-center gap-3"
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-center text-sm text-luxury-stone mt-8">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-luxury-brown hover:underline">
                            Create one
                        </Link>
                    </p>

                    <div className="mt-8 p-4 bg-luxury-cream/70 border border-luxury-sand/20 text-xs text-luxury-stone">
                        <p className="font-medium text-luxury-black mb-1">Testing Information</p>
                        <p>Firebase invisible reCAPTCHA is active. Use your real phone number to receive an OTP.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
