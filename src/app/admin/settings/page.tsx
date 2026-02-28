"use client";

import { motion } from "framer-motion";
import { MessageCircle, Shield, Bell } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
    const [whatsappNumber, setWhatsappNumber] = useState("+91 98765 43210");
    const [gaId, setGaId] = useState("G-XXXXXXXXXX");
    const [metaPixel, setMetaPixel] = useState("");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
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
                <h1 className="font-display text-3xl text-white mb-1">Settings</h1>
                <p className="text-gray-500 text-sm">Configure integrations and admin preferences.</p>
            </motion.div>

            <div className="max-w-2xl space-y-6">
                {/* WhatsApp */}
                <motion.div
                    className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                            <MessageCircle size={18} className="text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white">WhatsApp Business</h3>
                            <p className="text-xs text-gray-500">Customer communication integration</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">Business Phone Number</label>
                            <input
                                type="text"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">API Key</label>
                            <input
                                type="password"
                                placeholder="Enter WhatsApp Business API key"
                                className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Analytics */}
                <motion.div
                    className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Bell size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white">Analytics & Tracking</h3>
                            <p className="text-xs text-gray-500">Google Analytics and Meta Pixel</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">Google Analytics ID</label>
                            <input
                                type="text"
                                value={gaId}
                                onChange={(e) => setGaId(e.target.value)}
                                placeholder="G-XXXXXXXXXX"
                                className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">Meta Pixel ID</label>
                            <input
                                type="text"
                                value={metaPixel}
                                onChange={(e) => setMetaPixel(e.target.value)}
                                placeholder="Enter Meta Pixel ID"
                                className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Role-Based Access */}
                <motion.div
                    className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Shield size={18} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white">Access Control</h3>
                            <p className="text-xs text-gray-500">Role-based permissions</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[
                            { role: "Admin", desc: "Full access to all features", users: 1 },
                            { role: "Manager", desc: "Products, orders, and analytics", users: 0 },
                            { role: "Support", desc: "Orders and customer management", users: 0 },
                        ].map((role) => (
                            <div key={role.role} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg">
                                <div>
                                    <p className="text-sm text-white">{role.role}</p>
                                    <p className="text-xs text-gray-500">{role.desc}</p>
                                </div>
                                <span className="text-xs text-gray-500">{role.users} user{role.users !== 1 ? "s" : ""}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Save */}
                <button
                    onClick={handleSave}
                    className="bg-luxury-gold text-luxury-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-luxury-sand transition-colors rounded-lg"
                >
                    {saved ? "Saved!" : "Save Settings"}
                </button>
            </div>
        </div>
    );
}
