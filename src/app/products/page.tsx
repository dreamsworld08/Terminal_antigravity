"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
    image: string;
    images: string;
    featured: boolean;
}

const categories = [
    { value: "", label: "All Collections" },
    { value: "living", label: "Living Room" },
    { value: "bedroom", label: "Bedroom" },
    { value: "dining", label: "Dining" },
    { value: "office", label: "Office" },
];

const materials = ["All", "Velvet", "Travertine", "Bouclé", "White Oak", "Walnut", "Maple", "Ash Wood", "Oak", "Leather", "Steel & Oak", "Concrete"];

// Product card with actual variant images
function ProductCard({ product, index }: { product: Product; index: number }) {
    // Parse variant images from JSON
    let variants: VariantImage[] = [];
    try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) variants = parsed;
    } catch { }
    if (variants.length === 0) {
        variants = [{ name: product.color, hex: "#999", image: product.image }];
    }

    const defaultIdx = variants.findIndex((v) => v.name === product.color);
    const [activeIdx, setActiveIdx] = useState(defaultIdx >= 0 ? defaultIdx : 0);
    const activeVariant = variants[activeIdx];

    const handleSwatchClick = useCallback((e: React.MouseEvent, idx: number) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveIdx(idx);
    }, []);

    return (
        <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            data-product-id={product.id}
            data-product-material={product.material}
        >
            <Link href={`/products/${product.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden mb-4 bg-luxury-cream">
                    {/* Product image — actual variant photo */}
                    <img
                        src={activeVariant.image}
                        alt={`${product.name} in ${activeVariant.name}`}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    />

                    {product.featured && (
                        <span className="absolute top-4 left-4 bg-luxury-black text-luxury-ivory text-[10px] tracking-widest uppercase px-3 py-1 z-10">
                            Featured
                        </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-luxury-black/0 group-hover:bg-luxury-black/10 transition-colors duration-500 pointer-events-none" />

                    {/* On-hover color swatches */}
                    {variants.length > 1 && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2 justify-center">
                                {variants.map((v, i) => (
                                    <button
                                        key={v.name}
                                        onClick={(e) => handleSwatchClick(e, i)}
                                        data-variant-index={i}
                                        data-variant-name={v.name}
                                        data-variant-hex={v.hex}
                                        data-variant-image={v.image}
                                        data-active={activeIdx === i ? "true" : "false"}
                                        title={v.name}
                                        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-125 ${activeIdx === i
                                                ? "scale-125 border-white shadow-lg"
                                                : "border-white/50 hover:border-white"
                                            }`}
                                        style={{
                                            backgroundColor: v.hex,
                                            boxShadow: activeIdx === i ? `0 0 8px ${v.hex}80` : undefined,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Product info with updated color name */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-display text-lg text-luxury-black group-hover:text-luxury-brown transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-xs text-luxury-stone mt-1 flex items-center gap-1.5">
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-full border border-black/10 transition-colors duration-300"
                                style={{ backgroundColor: activeVariant.hex }}
                            />
                            {product.material} · {activeVariant.name}
                        </p>
                    </div>
                    <p className="text-sm text-luxury-black font-medium">
                        ₹{product.price.toLocaleString('en-IN')}
                    </p>
                </div>
            </Link>

            {/* Always-visible swatches below card (mobile-friendly) */}
            {variants.length > 1 && (
                <div className="flex items-center gap-1.5 mt-2">
                    {variants.map((v, i) => (
                        <button
                            key={v.name}
                            onClick={() => setActiveIdx(i)}
                            data-variant-index={i}
                            data-variant-name={v.name}
                            data-variant-hex={v.hex}
                            data-variant-image={v.image}
                            data-active={activeIdx === i ? "true" : "false"}
                            title={v.name}
                            className={`w-4 h-4 rounded-full border transition-all duration-200 ${activeIdx === i
                                    ? "ring-1 ring-offset-1 ring-luxury-black border-transparent scale-110"
                                    : "border-black/15 hover:scale-110"
                                }`}
                            style={{ backgroundColor: v.hex }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [category, setCategory] = useState("");
    const [material, setMaterial] = useState("All");
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/products")
            .then((r) => r.json())
            .then((data) => {
                setProducts(data);
                setFiltered(data);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let result = products;
        if (category) result = result.filter((p) => p.category === category);
        if (material !== "All") result = result.filter((p) => p.material === material);
        if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
        setFiltered(result);
    }, [category, material, search, products]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get("category");
        if (cat) setCategory(cat);
    }, []);

    return (
        <>
            <Navbar />
            <main className="pt-28 pb-20 px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
                {/* Header */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-luxury-stone text-xs tracking-[0.3em] uppercase mb-4">Explore</p>
                    <h1 className="font-display text-5xl md:text-6xl text-luxury-black mb-6">Collections</h1>
                    <p className="text-luxury-gray max-w-xl">
                        Each piece in our collection is a testament to meticulous craftsmanship
                        and timeless design. Click the color swatches to preview different finishes.
                    </p>
                </motion.div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-stone" />
                        <input
                            type="text"
                            placeholder="Search collections..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-luxury-sand/30 bg-luxury-white text-sm rounded-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`px-4 py-3 text-xs tracking-widest uppercase border transition-all hidden sm:block ${category === cat.value
                                    ? "bg-luxury-black text-luxury-ivory border-luxury-black"
                                    : "border-luxury-sand/30 text-luxury-gray hover:border-luxury-black"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="sm:hidden px-4 py-3 border border-luxury-sand/30 text-luxury-gray flex items-center gap-2"
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Mobile Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="sm:hidden mb-8 p-6 bg-luxury-cream border border-luxury-sand/20"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium">Filters</span>
                            <button onClick={() => setShowFilters(false)}><X size={18} /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-luxury-sand/30 p-2 text-sm bg-luxury-white">
                                    {categories.map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs tracking-widest uppercase text-luxury-stone mb-2 block">Material</label>
                                <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full border border-luxury-sand/30 p-2 text-sm bg-luxury-white">
                                    {materials.map((m) => (<option key={m} value={m}>{m}</option>))}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Material Filter (Desktop) */}
                <div className="hidden sm:flex gap-2 mb-10 flex-wrap">
                    {materials.map((m) => (
                        <button
                            key={m}
                            onClick={() => setMaterial(m)}
                            className={`px-3 py-1.5 text-xs border rounded-full transition-all ${material === m
                                ? "bg-luxury-charcoal text-luxury-ivory border-luxury-charcoal"
                                : "border-luxury-sand/40 text-luxury-gray hover:border-luxury-gray"
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[4/5] bg-luxury-cream mb-4" />
                                <div className="h-4 bg-luxury-cream w-2/3 mb-2" />
                                <div className="h-3 bg-luxury-cream w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-luxury-stone text-lg">No products match your filters.</p>
                        <button
                            onClick={() => { setCategory(""); setMaterial("All"); setSearch(""); }}
                            className="mt-4 text-sm underline text-luxury-brown"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((product, i) => (
                            <ProductCard key={product.id} product={product} index={i} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}
