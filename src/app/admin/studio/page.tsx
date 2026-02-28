"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, Sparkles, Wand2, Image, RotateCcw, Download,
    ChevronRight, AlertCircle, CheckCircle, Loader2,
} from "lucide-react";

export default function AdminStudioPage() {
    const [activeTab, setActiveTab] = useState<"2d-to-3d" | "prompt">("2d-to-3d");
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{ image: string; description?: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError("File size exceeds 10MB limit");
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                setUploadedImage(ev.target?.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConvert = async () => {
        if (!uploadedImage) return;
        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/ai/convert-2d-3d", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageData: uploadedImage }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Conversion failed");
            }

            setResult({ image: data.image, description: data.description });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Conversion failed. Please try again.";
            setError(message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/ai/generate-3d", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Generation failed");
            }

            setResult({ image: data.image, description: data.description });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Generation failed. Please try again.";
            setError(message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!result?.image) return;
        const link = document.createElement("a");
        link.href = result.image;
        link.download = `terminal-design-${Date.now()}.png`;
        link.click();
    };

    const reset = () => {
        setUploadedImage(null);
        setPrompt("");
        setResult(null);
        setError(null);
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-2 bg-white/5 text-luxury-gold px-4 py-2 text-xs tracking-widest uppercase mb-6 rounded-lg">
                    <Sparkles size={14} />
                    Powered by AI
                </div>
                <h1 className="font-display text-4xl md:text-5xl text-white mb-4">
                    Design Studio
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-sm">
                    Transform your product photos into stunning isometric 3D renders,
                    or describe a furniture piece and let our AI visualize it.
                </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 p-1 mb-10 max-w-md mx-auto rounded-lg">
                <button
                    onClick={() => { setActiveTab("2d-to-3d"); reset(); }}
                    className={`flex-1 py-3 text-xs tracking-widest uppercase transition-all rounded-md ${activeTab === "2d-to-3d"
                        ? "bg-white text-black font-medium"
                        : "text-gray-400 hover:text-white"
                        }`}
                >
                    2D → 3D
                </button>
                <button
                    onClick={() => { setActiveTab("prompt"); reset(); }}
                    className={`flex-1 py-3 text-xs tracking-widest uppercase transition-all rounded-md ${activeTab === "prompt"
                        ? "bg-white text-black font-medium"
                        : "text-gray-400 hover:text-white"
                        }`}
                >
                    Prompt → 3D
                </button>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4 mb-6 text-sm text-red-300 max-w-3xl mx-auto rounded-lg"
                    >
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Error</p>
                            <p className="text-red-400 text-xs mt-1">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">×</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === "2d-to-3d" ? (
                    <motion.div
                        key="2d-to-3d"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid md:grid-cols-2 gap-8"
                    >
                        {/* Upload Panel */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8">
                            <h3 className="font-display text-xl text-white mb-2">
                                Upload Product Image
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Upload a furniture photo, sketch, or 2D design to convert.
                            </p>

                            {!uploadedImage ? (
                                <label className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-white/10 cursor-pointer hover:border-white/30 transition-colors bg-white/5 rounded-lg">
                                    <Upload size={32} className="text-gray-500 mb-3" />
                                    <span className="text-sm text-gray-400">Drop product image or click to upload</span>
                                    <span className="text-xs text-gray-600 mt-1">PNG, JPG up to 10MB</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="relative aspect-[4/3] bg-[#0f0f0f] rounded-lg overflow-hidden">
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded plan"
                                        className="w-full h-full object-contain"
                                    />
                                    <button
                                        onClick={() => { setUploadedImage(null); setResult(null); }}
                                        className="absolute top-3 right-3 bg-black/70 text-white p-2 hover:bg-black rounded-md"
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleConvert}
                                disabled={!uploadedImage || isProcessing}
                                className="w-full mt-6 bg-white text-black py-4 text-sm tracking-widest uppercase hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Converting...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={16} />
                                        Convert to 3D
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Result Panel */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8">
                            <h3 className="font-display text-xl text-white mb-2">
                                Isometric 3D Result
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Your AI-generated isometric product render will appear here.
                            </p>

                            {result ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="aspect-[4/3] bg-[#0f0f0f] mb-4 overflow-hidden rounded-lg">
                                        <img
                                            src={result.image}
                                            alt="3D result"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {result.description && (
                                        <p className="text-xs text-gray-500 mb-4 line-clamp-3">
                                            {result.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-green-400 mb-4">
                                        <CheckCircle size={14} />
                                        Generated by AI
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleDownload}
                                            className="flex-1 border border-white/10 py-3 text-xs tracking-widest uppercase text-gray-400 hover:border-white hover:text-white flex items-center justify-center gap-2 rounded-lg"
                                        >
                                            <Download size={14} />
                                            Download
                                        </button>
                                        <button className="flex-1 bg-luxury-gold text-black py-3 text-xs tracking-widest uppercase hover:bg-yellow-400 flex items-center justify-center gap-2 rounded-lg">
                                            Save to Dashboard
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center aspect-[4/3] bg-white/5 border border-white/5 rounded-lg">
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={40} className="text-luxury-gold mb-3 animate-spin" />
                                            <span className="text-sm text-gray-400">Creating your isometric 3D render...</span>
                                            <span className="text-xs text-gray-600 mt-1">This may take 15-30 seconds</span>
                                        </>
                                    ) : (
                                        <>
                                            <Image size={40} className="text-gray-600 mb-3" />
                                            <span className="text-sm text-gray-500">No result yet</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="prompt"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {/* Prompt Input */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-8 max-w-3xl mx-auto">
                            <h3 className="font-display text-xl text-white mb-2">
                                Describe Your Product
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Describe a furniture piece in detail and our AI will generate
                                a professional isometric 3D product render.
                            </p>

                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A modern minimalist living room with floor-to-ceiling windows, a low-profile walnut sofa, marble coffee table, and warm ambient lighting..."
                                rows={4}
                                className="w-full border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-gray-600 resize-none mb-4 focus:outline-none focus:border-white/30 rounded-lg"
                            />

                            {/* Example Prompts */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {[
                                    "Modern minimalist bedroom with oak floating bed and linen sheets",
                                    "Japanese-inspired dining room with low table and floor cushions",
                                    "Scandinavian home office with standing desk and warm wood tones",
                                    "Luxury penthouse living room with panoramic city view and velvet sofa",
                                ].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPrompt(p)}
                                        className="px-3 py-1.5 text-xs border border-white/10 text-gray-400 hover:border-white/30 hover:text-white transition-colors rounded-md"
                                    >
                                        {p.length > 40 ? p.substring(0, 40) + "..." : p}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || isProcessing}
                                className="w-full bg-white text-black py-4 text-sm tracking-widest uppercase hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        Generate 3D Visualization
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Processing State */}
                        {isProcessing && !result && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center py-16"
                            >
                                <Loader2 size={48} className="text-luxury-gold animate-spin mb-4" />
                                <p className="text-gray-400 text-sm">Generating your visualization...</p>
                                <p className="text-gray-600 text-xs mt-1">This may take 15-30 seconds</p>
                            </motion.div>
                        )}

                        {/* Result */}
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 max-w-3xl mx-auto"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-display text-xl text-white">
                                        Generated Result
                                    </h3>
                                    <span className="flex items-center gap-1.5 text-xs text-green-400">
                                        <CheckCircle size={14} />
                                        Powered by AI
                                    </span>
                                </div>
                                <div className="aspect-video bg-[#0f0f0f] overflow-hidden mb-4 rounded-lg">
                                    <img
                                        src={result.image}
                                        alt="Generated 3D space"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {result.description && (
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-3">
                                        {result.description}
                                    </p>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        onClick={reset}
                                        className="flex-1 border border-white/10 py-3 text-xs tracking-widest uppercase text-gray-400 hover:border-white hover:text-white flex items-center justify-center gap-2 rounded-lg"
                                    >
                                        <RotateCcw size={14} />
                                        New Generation
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 border border-white/10 py-3 text-xs tracking-widest uppercase text-gray-400 hover:border-white hover:text-white flex items-center justify-center gap-2 rounded-lg"
                                    >
                                        <Download size={14} />
                                        Download
                                    </button>
                                    <button className="flex-1 bg-luxury-gold text-black py-3 text-xs tracking-widest uppercase hover:bg-yellow-400 flex items-center justify-center gap-2 rounded-lg">
                                        Save Design
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
