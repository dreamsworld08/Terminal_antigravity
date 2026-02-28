"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, ShoppingBag, Sparkles, Ruler, Palette, Layers, Check, View, Image as ImageIcon, ScanLine } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";

declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                'model-viewer': any;
            }
        }
    }
}

interface VariantImage {
    name: string;
    hex: string;
    image: string;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    material: string;
    color: string;
    dimensions: string;
    image: string;
    images: string; // JSON string of VariantImage[]
    modelUrl?: string; // 3D Object URL
    featured: boolean;
}

// Finish descriptions mapped by material → finish name
const finishDescriptions: Record<string, Record<string, string>> = {
    "Velvet": {
        "Charcoal": "Upholstered in deep charcoal velvet with a rich, smoky tone that anchors any living space. The dark finish adds dramatic presence while remaining effortlessly sophisticated.",
        "Midnight Blue": "Draped in midnight blue velvet with an inky depth that shifts subtly under different lighting. A bold yet refined choice that evokes quiet luxury.",
        "Emerald": "Finished in emerald green velvet with a jewel-toned richness. This statement finish brings organic warmth and an air of vintage opulence.",
        "Blush": "Covered in soft blush velvet with a warm, rosy undertone. This gentle finish creates a serene, inviting atmosphere with modern romance.",
    },
    "Travertine": {
        "Natural Stone": "Crafted from natural travertine with warm, honeyed veining. Each piece is one-of-a-kind — the organic patterns tell millions of years of geological artistry.",
        "Honed White": "Finished in honed white travertine with a silky matte surface. The light, airy tone creates a clean, contemporary feel.",
        "Fossil Grey": "Featuring fossil grey travertine with cool, silvered veining. This sophisticated finish adds a modern, architectural quality.",
    },
    "Bouclé": {
        "Cream": "Upholstered in cream bouclé with a cloud-like texture. The warm ivory tone creates an inviting softness, perfect for layering with natural materials.",
        "Oat": "Wrapped in oat-toned bouclé with an earthy, grounding warmth. This neutral finish pairs beautifully with contemporary and mid-century interiors.",
        "Sand": "Finished in sand-colored bouclé with a sun-warmed, coastal feel. The golden neutral adds natural warmth while maintaining a clean profile.",
        "Charcoal": "Covered in charcoal bouclé with a rich, textured depth. The dark tone adds dramatic weight while the bouclé keeps it approachable.",
    },
    "White Oak": {
        "Natural Oak": "Finished in natural white oak with a clear matte seal. The warm, golden grain pattern celebrates the wood's organic beauty.",
        "Bleached": "Treated with a bleached white oak finish that lightens the grain to a pale, Scandinavian tone. Bright and airy.",
        "Smoked": "Fumed with ammonia to achieve a deep, smoked oak finish. Rich tonal depth with natural wood character beautifully intact.",
        "Ebony": "Stained in deep ebony that adds commanding darkness. The oak grain subtly shows through for visual depth.",
    },
    "Walnut": {
        "Dark Walnut": "Finished in dark walnut with hand-rubbed oil that deepens the chocolate tones. Develops a beautiful patina over time.",
        "Natural Walnut": "Sealed in natural walnut preserving warm amber hues and distinctive swirling grain. A timeless classic.",
        "Honey": "Treated with a honey-toned stain that brings out the walnut's golden warmth. Sun-kissed quality with natural character.",
        "Ebonized": "Ebonized walnut with a near-black finish retaining subtle grain visibility. Dramatic architectural presence.",
    },
    "Maple": {
        "Matte White": "Lacquered in matte white with a smooth, porcelain-like surface. Gallery-quality appearance with seamless lines.",
        "Natural Maple": "Finished in natural maple with a clear satin seal. Light, creamy tone with Scandinavian-inspired warmth.",
        "Grey Wash": "Treated with a grey wash lending weathered, coastal elegance. Pairs beautifully with warm and cool palettes.",
        "Espresso": "Stained in deep espresso transforming the maple with rich, coffee-dark tones. Bold modern sophistication.",
    },
    "Ash Wood": {
        "Natural Ash": "Finished in natural ash with a clear matte coat. Light, straight grain creates a clean Scandinavian aesthetic.",
        "White Wash": "White-washed finish softening the ash grain to a pale, sun-bleached tone. Relaxed coastal lightness.",
        "Smoke": "Fumed to a smoke-grey tone with contemporary edge. Reveals the ash's beautiful grain pattern.",
        "Ebony": "Deep ebony stain creating a dramatic, almost black finish. Ash grain adds subtle texture beneath.",
    },
    "Oak": {
        "Smoked Oak": "Fumed to a deep, smoky finish with rich brown-black tones. Centuries-old technique creates unmatched depth.",
        "Natural Oak": "Sealed in natural golden oak with a satin finish. Warm, honey-toned grain for any workspace.",
        "Cerused": "Hand-cerused with lime-washed grain creating distinctive textured contrast. Old World craft meets modern form.",
        "Charcoal": "Deep charcoal stain with oak grain subtly visible beneath. Bold architectural presence.",
    },
    "Leather": {
        "Cognac": "Upholstered in full-grain cognac leather that develops a rich, caramel patina over time. Timeless sophistication.",
        "Black": "Finished in premium black leather with a smooth, semi-matte surface. Powerful executive presence.",
        "Tan": "Crafted in natural tan leather with a soft, butter-like feel. Ages gracefully with unique character.",
        "Navy": "Upholstered in deep navy leather with an inky, midnight richness. Professional with subtle color depth.",
    },
    "Steel & Oak": {
        "Black & Oak": "Blackened steel with natural oak shelves. High-contrast pairing blending industrial strength with organic warmth.",
        "Bronze & Oak": "Antiqued bronze-patina steel with golden oak. Refined, gallery-worthy look with vintage character.",
        "White & Oak": "Powder-coated white steel with bleached oak. Scandinavian minimalism and visual lightness.",
    },
    "Concrete": {
        "Gray": "Cast in natural gray concrete with micro-finished edges. Classic industrial tone with raw, tactile appeal.",
        "Light": "Light concrete with smoothed, polished surface. Ethereal, gallery-like quality with architectural minimalism.",
        "Dark": "Dark concrete with charcoal-toned pigments. Dramatic weight and monolithic modern sophistication.",
        "Warm": "Warm mineral pigments for a sandstone-inspired tone. Bridges industrial and organic aesthetics.",
    },
};

export default function ProductDetailPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isArMode, setIsArMode] = useState(false);
    const [arModelUrl, setArModelUrl] = useState<string | null>(null);
    const modelViewerRef = useRef<any>(null);

    useEffect(() => {
        fetch(`/api/products/${params.slug}`)
            .then((r) => r.json())
            .then((data) => {
                setProduct(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.slug]);

    // Parse variant images from the product's images JSON field
    const variants: VariantImage[] = useMemo(() => {
        if (!product) return [];
        try {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch { }
        // Fallback: single variant from product data
        return [{ name: product.color, hex: "#999", image: product.image }];
    }, [product]);

    // Auto-select default variant matching product.color
    useEffect(() => {
        if (product && variants.length > 0) {
            const idx = variants.findIndex((v) => v.name === product.color);
            if (idx >= 0) setSelectedVariant(idx);
        }
    }, [product, variants]);

    const { addToCart } = useCart();

    const currentVariant = variants[selectedVariant] || variants[0];

    // Force color application on the 3D model materials and bake a GLB for AR
    useEffect(() => {
        const mv = modelViewerRef.current;
        if (!mv) return;

        const applyMaterialColor = async () => {
            if (!currentVariant || !mv.model || !mv.model.materials) return;
            try {
                const hex = currentVariant.hex || "#999999";
                // Convert #RRGGBB to [R, G, B, A] where 0.0-1.0
                const r = parseInt(hex.slice(1, 3), 16) / 255;
                const g = parseInt(hex.slice(3, 5), 16) / 255;
                const b = parseInt(hex.slice(5, 7), 16) / 255;

                // Loop through all materials and apply the PBR color payload
                mv.model.materials.forEach((mat: any) => {
                    if (mat.pbrMetallicRoughness) {
                        mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
                        mat.pbrMetallicRoughness.setMetallicFactor(0.15);
                        mat.pbrMetallicRoughness.setRoughnessFactor(0.6);
                    }
                });

                // Export the scene with baked materials as a GLB blob for AR
                // This ensures Scene Viewer / Quick Look receives the colored model
                try {
                    const glbBlob = await mv.exportScene({ binary: true });
                    const blobUrl = URL.createObjectURL(glbBlob);
                    // Revoke previous blob URL to prevent memory leaks
                    setArModelUrl((prev: string | null) => {
                        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                        return blobUrl;
                    });
                } catch (exportErr) {
                    console.warn("Could not export baked GLB for AR", exportErr);
                }
            } catch (err) {
                console.warn("Could not selectively color the model materials", err);
            }
        };

        mv.addEventListener("load", applyMaterialColor);
        // If it's already loaded right now, apply immediately:
        if (mv.model) applyMaterialColor();

        return () => {
            mv.removeEventListener("load", applyMaterialColor);
        };
    }, [currentVariant]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            id: `${product.id}-${currentVariant.name}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: currentVariant.image,
            quantity: 1,
            options: `${currentVariant.name} — ${product.material}`
        });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="pt-28 pb-20 px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
                    <div className="grid md:grid-cols-2 gap-16 animate-pulse">
                        <div className="aspect-square bg-luxury-cream" />
                        <div className="space-y-4 pt-8">
                            <div className="h-8 bg-luxury-cream w-3/4" />
                            <div className="h-4 bg-luxury-cream w-1/2" />
                            <div className="h-20 bg-luxury-cream w-full mt-8" />
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Navbar />
                <main className="pt-28 pb-20 px-6 lg:px-8 max-w-7xl mx-auto min-h-screen text-center">
                    <h1 className="font-display text-4xl text-luxury-black mb-4">Product Not Found</h1>
                    <Link href="/products" className="text-luxury-brown underline">Back to Collections</Link>
                </main>
                <Footer />
            </>
        );
    }

    const baseDescription = product.description.split('. ').slice(0, 1).join('. ') + '.';
    const finishDesc = finishDescriptions[product.material]?.[currentVariant.name] || "";

    return (
        <>
            <Navbar />
            <main className="pt-28 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
                    <Link href="/products" className="inline-flex items-center gap-2 text-sm text-luxury-stone hover:text-luxury-black transition-colors">
                        <ArrowLeft size={16} />
                        Back to Collections
                    </Link>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-16">
                    {/* Product Image — swaps to the actual variant image */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                        <div className="sticky top-28 space-y-4">
                            <div className="aspect-square overflow-hidden bg-luxury-cream relative group">
                                <AnimatePresence mode="wait">
                                    {isArMode ? (
                                        <motion.div
                                            key="ar-viewer"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="w-full h-full relative bg-black"
                                        >
                                            {product.modelUrl ? (
                                                <>
                                                    <Script
                                                        type="module"
                                                        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
                                                    />
                                                    {/* @ts-ignore */}
                                                    <model-viewer
                                                        ref={modelViewerRef}
                                                        src={product.modelUrl}
                                                        alt={`3D model of ${product.name}`}
                                                        ar
                                                        ar-modes="webxr scene-viewer quick-look"
                                                        ar-scale="auto"
                                                        camera-controls
                                                        auto-rotate
                                                        shadow-intensity="1.5"
                                                        shadow-softness="0.5"
                                                        exposure="1.2"
                                                        environment-image="legacy"
                                                        tone-mapping="neutral"
                                                        {...(arModelUrl ? { "ar-src": arModelUrl } : {})}
                                                        style={{ width: "100%", height: "100%", backgroundColor: "#1a1a1a" }}
                                                    >
                                                        <button
                                                            slot="ar-button"
                                                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-luxury-gold text-luxury-black px-6 py-3 text-xs tracking-widest uppercase shadow-xl rounded-sm flex items-center gap-2 hover:bg-luxury-sand transition-colors"
                                                        >
                                                            <ScanLine size={16} />
                                                            View in your space
                                                        </button>
                                                        {/* @ts-ignore */}
                                                    </model-viewer>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center px-8">
                                                    <View size={40} className="text-gray-600" />
                                                    <p className="text-gray-400 text-sm">No 3D model is available for this product yet.</p>
                                                    <p className="text-gray-600 text-xs">Ask the store admin to upload a .glb or .obj model file.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.img
                                            key={currentVariant.image}
                                            src={currentVariant.image}
                                            alt={`${product.name} in ${currentVariant.name}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </AnimatePresence>

                                {/* AR / 3D Toggle Button */}
                                <button
                                    onClick={() => setIsArMode(!isArMode)}
                                    className={`absolute top-4 right-4 backdrop-blur shadow-md px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all z-10 ${isArMode
                                        ? "bg-luxury-black text-luxury-gold border border-luxury-gold/30"
                                        : "bg-white/90 text-luxury-black hover:bg-luxury-gold hover:text-luxury-black"
                                        }`}
                                    title={isArMode ? "Back to Photos" : "View 3D & AR"}
                                >
                                    {isArMode ? <ImageIcon size={16} /> : <ScanLine size={16} />}
                                    {isArMode ? "Photos" : "View in AR"}
                                </button>

                                {/* Finish badge */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentVariant.name}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2.5 flex items-center gap-2.5 shadow-md rounded-sm"
                                    >
                                        <div
                                            className="w-5 h-5 rounded-full border-2 shadow-inner"
                                            style={{ backgroundColor: currentVariant.hex, borderColor: `${currentVariant.hex}40` }}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-luxury-black leading-tight">{currentVariant.name}</span>
                                            <span className="text-[10px] text-luxury-stone leading-tight">{product.material}</span>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Thumbnail strip — small variant previews */}
                            {variants.length > 1 && (
                                <div className="flex gap-2">
                                    {variants.map((v, i) => (
                                        <button
                                            key={v.name}
                                            onClick={() => setSelectedVariant(i)}
                                            data-variant-index={i}
                                            data-variant-name={v.name}
                                            data-variant-hex={v.hex}
                                            data-variant-image={v.image}
                                            data-active={selectedVariant === i ? "true" : "false"}
                                            className={`relative flex-1 aspect-square overflow-hidden rounded-sm transition-all duration-200 ${selectedVariant === i
                                                ? "ring-2 ring-luxury-black ring-offset-2"
                                                : "opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                                                <span className="text-[9px] text-white font-medium flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: v.hex }} />
                                                    {v.name}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Details */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="pt-4">
                        <p className="text-luxury-stone text-xs tracking-[0.3em] uppercase mb-3">{product.category}</p>
                        <h1 className="font-display text-4xl md:text-5xl text-luxury-black mb-2">{product.name}</h1>

                        {/* Dynamic finish subtitle */}
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={currentVariant.name}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm mb-4 flex items-center gap-2"
                                style={{ color: currentVariant.hex }}
                            >
                                <span className="w-3 h-3 rounded-full inline-block border border-black/10 shadow-sm" style={{ backgroundColor: currentVariant.hex }} />
                                {currentVariant.name} — {product.material}
                            </motion.p>
                        </AnimatePresence>

                        {/* Price */}
                        <p className="text-2xl text-luxury-black mb-8">₹{product.price.toLocaleString('en-IN')}</p>

                        {/* Dynamic description */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentVariant.name}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.25 }}
                                className="mb-10"
                            >
                                <p className="text-luxury-gray leading-relaxed">
                                    {baseDescription}{" "}
                                    {finishDesc && <span className="text-luxury-black/80">{finishDesc}</span>}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Specs */}
                        <div className="grid grid-cols-3 gap-6 mb-10">
                            <div className="flex flex-col items-center text-center p-4 bg-luxury-cream/50 rounded">
                                <Layers size={20} className="text-luxury-brown mb-2" />
                                <span className="text-[10px] tracking-widest uppercase text-luxury-stone mb-1">Material</span>
                                <span className="text-sm text-luxury-black">{product.material}</span>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 bg-luxury-cream/50 rounded overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentVariant.name}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col items-center"
                                    >
                                        <Palette size={20} style={{ color: currentVariant.hex }} className="mb-2" />
                                        <span className="text-[10px] tracking-widest uppercase text-luxury-stone mb-1">Finish</span>
                                        <span className="text-sm text-luxury-black flex items-center gap-1.5">
                                            <span className="inline-block w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: currentVariant.hex }} />
                                            {currentVariant.name}
                                        </span>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 bg-luxury-cream/50 rounded">
                                <Ruler size={20} className="text-luxury-brown mb-2" />
                                <span className="text-[10px] tracking-widest uppercase text-luxury-stone mb-1">Dimensions</span>
                                <span className="text-sm text-luxury-black">{product.dimensions || "Custom"}</span>
                            </div>
                        </div>

                        {/* Color Swatches — each switches the actual image */}
                        <div className="mb-10" data-finish-selector data-product-material={product.material}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs tracking-widest uppercase text-luxury-stone">Finish</span>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={currentVariant.name}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs font-medium"
                                        style={{ color: currentVariant.hex }}
                                    >
                                        {currentVariant.name}
                                    </motion.span>
                                </AnimatePresence>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {variants.map((v, i) => (
                                    <button
                                        key={v.name}
                                        onClick={() => setSelectedVariant(i)}
                                        data-variant-index={i}
                                        data-variant-name={v.name}
                                        data-variant-hex={v.hex}
                                        data-variant-image={v.image}
                                        data-active={selectedVariant === i ? "true" : "false"}
                                        className={`group relative flex items-center gap-2.5 px-4 py-2.5 text-xs border-2 transition-all duration-300 rounded-sm ${selectedVariant === i
                                            ? "text-white shadow-md"
                                            : "border-luxury-sand/40 text-luxury-gray hover:border-luxury-black hover:shadow-sm"
                                            }`}
                                        style={selectedVariant === i ? {
                                            backgroundColor: v.hex,
                                            borderColor: v.hex,
                                            color: isLightColor(v.hex) ? '#1a1a1a' : '#ffffff',
                                        } : undefined}
                                    >
                                        <span
                                            className={`w-5 h-5 rounded-full shrink-0 border-2 transition-all ${selectedVariant === i ? "scale-110" : ""}`}
                                            style={{
                                                backgroundColor: v.hex,
                                                borderColor: selectedVariant === i ? (isLightColor(v.hex) ? '#00000030' : '#ffffff40') : '#00000015',
                                                boxShadow: selectedVariant === i ? `0 0 8px ${v.hex}60` : 'none',
                                            }}
                                        />
                                        {v.name}
                                        {selectedVariant === i && <Check size={13} className="ml-1" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mb-8">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 py-4 text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 rounded-sm"
                                style={addedToCart ? {
                                    backgroundColor: '#15803d', color: 'white',
                                } : {
                                    backgroundColor: currentVariant.hex,
                                    color: isLightColor(currentVariant.hex) ? '#1a1a1a' : '#ffffff',
                                }}
                            >
                                {addedToCart ? (<><Check size={16} />Added to Cart</>) : (<><ShoppingBag size={16} />Add to Cart — {currentVariant.name}</>)}
                            </button>
                            <button className="w-14 border border-luxury-sand/40 flex items-center justify-center hover:border-luxury-black transition-colors rounded-sm">
                                <Heart size={18} className="text-luxury-gray" />
                            </button>
                        </div>

                        {/* Customize CTA */}
                        <Link href="/admin/studio" className="flex items-center justify-center gap-2 w-full py-4 border-2 text-sm tracking-widest uppercase transition-all rounded-sm hover:shadow-md"
                            style={{ borderColor: currentVariant.hex, color: currentVariant.hex }}
                        >
                            <Sparkles size={16} />
                            Customize in Studio
                        </Link>

                        {/* Delivery Info */}
                        <div className="mt-10 p-6 bg-luxury-cream/50 border border-luxury-sand/20 rounded-sm">
                            <h4 className="text-xs tracking-widest uppercase text-luxury-stone mb-4">Delivery & Care</h4>
                            <ul className="space-y-2 text-sm text-luxury-gray">
                                <li>• Made to order — 6–8 weeks delivery</li>
                                <li>• White-glove delivery and assembly included</li>
                                <li>• 5-year structural warranty</li>
                                <li>• Complimentary care kit with every purchase</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </>
    );
}

function isLightColor(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}
