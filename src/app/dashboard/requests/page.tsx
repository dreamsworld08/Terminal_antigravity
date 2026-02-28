"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MessageCircle } from "lucide-react";

const existingRequests = [
    { id: 1, title: "Custom L-shaped Sofa", status: "In Review", budget: "$6,000 - $8,000", date: "Feb 18, 2025", description: "Looking for a custom L-shaped sofa in dark green velvet with solid brass legs." },
    { id: 2, title: "Built-in Bookshelf Unit", status: "Approved", budget: "$4,000 - $5,500", date: "Feb 5, 2025", description: "Floor-to-ceiling bookshelf in natural oak to fit a 3m × 2.8m wall." },
];

const statusColors: Record<string, string> = {
    "In Review": "bg-amber-100 text-amber-700",
    "Approved": "bg-green-100 text-green-700",
    "In Production": "bg-blue-100 text-blue-700",
    "Completed": "bg-luxury-cream text-luxury-black",
};

export default function RequestsPage() {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, POST to /api/requests
        alert("Request submitted! Our design team will reach out shortly.");
        setShowForm(false);
        setTitle("");
        setDescription("");
        setBudget("");
    };

    return (
        <div>
            <motion.div
                className="flex items-start justify-between mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="font-display text-3xl text-luxury-black mb-2">Custom Requests</h1>
                    <p className="text-luxury-stone text-sm">Submit and track bespoke furniture requests.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-luxury-black text-luxury-ivory px-5 py-2.5 text-xs tracking-widest uppercase hover:bg-luxury-charcoal transition-colors flex items-center gap-2"
                >
                    <Plus size={14} />
                    New Request
                </button>
            </motion.div>

            {/* New Request Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="luxury-card p-8 mb-8"
                >
                    <h3 className="font-display text-lg text-luxury-black mb-6">New Custom Request</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Custom Dining Table"
                                required
                                className="w-full border border-luxury-sand/30 bg-luxury-white px-4 py-3 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your vision in detail..."
                                rows={4}
                                required
                                className="w-full border border-luxury-sand/30 bg-luxury-white px-4 py-3 text-sm resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">Budget Range</label>
                            <input
                                type="text"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="e.g., $3,000 - $5,000"
                                className="w-full border border-luxury-sand/30 bg-luxury-white px-4 py-3 text-sm"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="bg-luxury-black text-luxury-ivory px-6 py-3 text-xs tracking-widest uppercase hover:bg-luxury-charcoal transition-colors"
                            >
                                Submit Request
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="border border-luxury-sand/40 px-6 py-3 text-xs tracking-widest uppercase text-luxury-gray hover:border-luxury-black"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Existing Requests */}
            <div className="space-y-4">
                {existingRequests.map((req, i) => (
                    <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="luxury-card p-6"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-medium text-luxury-black">{req.title}</h3>
                                <p className="text-xs text-luxury-stone mt-1">{req.date}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-[11px] tracking-wider uppercase rounded-full ${statusColors[req.status]}`}>
                                {req.status}
                            </span>
                        </div>
                        <p className="text-sm text-luxury-gray mb-4">{req.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-luxury-stone">Budget: {req.budget}</span>
                            <a
                                href="https://wa.me/1234567890"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700"
                            >
                                <MessageCircle size={14} />
                                Chat on WhatsApp
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
