"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Camera } from "lucide-react";

export default function ProfilePage() {
    const [name, setName] = useState("Alex Morgan");
    const [email, setEmail] = useState("alex@example.com");
    const [phone, setPhone] = useState("+1 555 123 4567");
    const [saved, setSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div>
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="font-display text-3xl text-luxury-black mb-2">Profile</h1>
                <p className="text-luxury-stone text-sm">Manage your Terminal account details.</p>
            </motion.div>

            <div className="max-w-2xl">
                <motion.div
                    className="luxury-card p-8 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-luxury-sand/20">
                        <div className="w-20 h-20 bg-luxury-cream rounded-full flex items-center justify-center relative">
                            <span className="font-display text-2xl text-luxury-brown">AM</span>
                            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-luxury-black text-luxury-ivory rounded-full flex items-center justify-center">
                                <Camera size={12} />
                            </button>
                        </div>
                        <div>
                            <h3 className="font-display text-xl text-luxury-black">{name}</h3>
                            <p className="text-sm text-luxury-stone">Customer since January 2025</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-luxury-sand/30 bg-luxury-white px-4 py-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border border-luxury-sand/30 bg-luxury-white px-4 py-3 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-luxury-sand/30 bg-luxury-white px-4 py-3 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">New Password</label>
                            <input
                                type="password"
                                placeholder="Leave blank to keep current"
                                className="w-full border border-luxury-sand/30 bg-luxury-white px-4 py-3 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-luxury-black text-luxury-ivory px-8 py-3 text-xs tracking-widest uppercase hover:bg-luxury-charcoal transition-colors flex items-center gap-2"
                        >
                            <Save size={14} />
                            {saved ? "Saved!" : "Save Changes"}
                        </button>
                    </form>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    className="luxury-card p-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-xs text-luxury-stone mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="border border-red-300 text-red-600 px-5 py-2 text-xs tracking-widest uppercase hover:bg-red-50 transition-colors">
                        Delete Account
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
