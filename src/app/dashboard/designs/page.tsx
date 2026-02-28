"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, Trash2, X } from "lucide-react";

const designs = [
    { id: 1, name: "Modern Living Room", type: "prompt-generated", date: "Feb 18, 2025", image: "/images/ui/ui-1600210492486-724fe5c67fb0.jpg" },
    { id: 2, name: "Apartment Floor Plan", type: "2d-to-3d", date: "Feb 12, 2025", image: "/images/ui/ui-1618219908412-a29a1bb7b86e.jpg" },
    { id: 3, name: "Scandinavian Office", type: "prompt-generated", date: "Feb 5, 2025", image: "/images/ui/ui-1616486338812-3dadae4b4ace.jpg" },
    { id: 4, name: "Bedroom Concept", type: "prompt-generated", date: "Jan 30, 2025", image: "/images/ui/ui-1616594039964-ae9021a400a0.jpg" },
    { id: 5, name: "Villa Layout", type: "2d-to-3d", date: "Jan 22, 2025", image: "/images/ui/ui-1631679706909-1844bbd07221.jpg" },
    { id: 6, name: "Dining Area Design", type: "prompt-generated", date: "Jan 15, 2025", image: "/images/ui/ui-1617806118233-18e1de247200.jpg" },
];

export default function DesignsPage() {
    const [savedDesigns, setSavedDesigns] = useState(designs);
    const [viewImage, setViewImage] = useState<string | null>(null);

    const handleDelete = (id: number) => {
        setSavedDesigns((prev) => prev.filter((d) => d.id !== id));
    };

    const handleDownload = async (url: string, name: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `${name.replace(/\s+/g, "-").toLowerCase()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            // Fallback if CORS prevents blob download
            window.open(url, "_blank");
        }
    };

    return (
        <div>
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="font-display text-3xl text-luxury-black mb-2">Saved Designs</h1>
                <p className="text-luxury-stone text-sm">Your 3D visualizations and generated models from the Design Studio.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedDesigns.length === 0 ? (
                    <div className="col-span-full py-12 text-center border border-dashed border-luxury-sand/30 bg-luxury-cream/20">
                        <p className="text-luxury-stone">No saved designs found.</p>
                    </div>
                ) : (
                    savedDesigns.map((design, i) => (
                        <motion.div
                            key={design.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="luxury-card overflow-hidden group"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={design.image}
                                    alt={design.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-luxury-black/0 group-hover:bg-luxury-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                                    <button
                                        onClick={() => setViewImage(design.image)}
                                        className="bg-luxury-ivory p-2 rounded-full hover:bg-luxury-gold transition-colors shadow-lg"
                                        title="View Design"
                                    >
                                        <Eye size={16} className="text-luxury-black" />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(design.image, design.name)}
                                        className="bg-luxury-ivory p-2 rounded-full hover:bg-luxury-gold transition-colors shadow-lg"
                                        title="Download Image"
                                    >
                                        <Download size={16} className="text-luxury-black" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(design.id)}
                                        className="bg-luxury-ivory p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-lg"
                                        title="Delete Design"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-luxury-black text-sm mb-1">{design.name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] tracking-widest uppercase text-luxury-stone">
                                        {design.type === "2d-to-3d" ? "2D → 3D" : "AI Generated"}
                                    </span>
                                    <span className="text-xs text-luxury-stone">{design.date}</span>
                                </div>
                            </div>
                        </motion.div>
                    )))}
            </div>

            {/* Full Screen Image Modal */}
            <AnimatePresence>
                {viewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-luxury-black/90 backdrop-blur-sm p-6"
                        onClick={() => setViewImage(null)}
                    >
                        <button
                            onClick={() => setViewImage(null)}
                            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/20 rounded-full hover:bg-black/50 transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            src={viewImage}
                            alt="Full screen design"
                            className="max-w-full max-h-full object-contain rounded shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
