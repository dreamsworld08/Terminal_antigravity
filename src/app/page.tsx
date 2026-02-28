"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ArrowRight, ChevronDown,
  Sparkles, Truck, ShieldCheck, RotateCcw,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/* ─── Data ──────────────────────────────────────────────── */

const categories = [
  { slug: "living", label: "Living Room", image: "/images/ui/ui-1586023492125-27b2c045efd7.jpg", desc: "Sofas, chairs & accent pieces" },
  { slug: "bedroom", label: "Bedroom", image: "/images/ui/ui-1616594039964-ae9021a400a0.jpg", desc: "Beds, nightstands & dressers" },
  { slug: "dining", label: "Dining", image: "/images/ui/ui-1617806118233-18e1de247200.jpg", desc: "Tables, chairs & barware" },
  { slug: "office", label: "Office", image: "/images/ui/ui-1600210492486-724fe5c67fb0.jpg", desc: "Desks, shelving & storage" },
];

const bannerSlides = [
  {
    image: "/images/ui/ui-1618221195710-dd6b41faaea6.jpg",
    tag: "New Arrivals",
    headline: "The Living Collection",
    sub: "Handcrafted luxury sofas & lounge chairs",
    cta: { label: "Shop Living", href: "/products?category=living" },
  },
  {
    image: "/images/ui/ui-1616594039964-ae9021a400a0.jpg",
    tag: "Best Sellers",
    headline: "The Sanctuary",
    sub: "Serene beds designed as your personal retreat",
    cta: { label: "Shop Bedroom", href: "/products?category=bedroom" },
  },
  {
    image: "/images/ui/ui-1617806118233-18e1de247200.jpg",
    tag: "Editor's Pick",
    headline: "Dining Rituals",
    sub: "Elegant tables where every meal becomes memorable",
    cta: { label: "Shop Dining", href: "/products?category=dining" },
  },
  {
    image: "/images/ui/ui-1631679706909-1844bbd07221.jpg",
    tag: "Craftsmanship",
    headline: "Made by Hand",
    sub: "Sustainably crafted furniture for modern living",
    cta: { label: "Explore All", href: "/products" },
  },
];

const promoCards = [
  {
    image: "/images/ui/ui-1618219908412-a29a1bb7b86e.jpg",
    tag: "Premium Range",
    headline: "Solid Wood Beds",
    sub: "Starting from ₹45,000",
    href: "/products?category=bedroom",
  },
  {
    image: "/images/ui/ui-1555041469-a586c61ea9bc.jpg",
    tag: "Handcrafted",
    headline: "Artisan Dining",
    sub: "Explore the collection",
    href: "/products?category=dining",
  },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-az", label: "Name: A to Z" },
  { value: "newest", label: "Newest First" },
];

const usps = [
  { icon: Truck, text: "Free Shipping" },
  { icon: ShieldCheck, text: "5-Year Warranty" },
  { icon: RotateCcw, text: "Easy Returns" },
  { icon: Sparkles, text: "AI Design Studio" },
];

/* ─── Types ─────────────────────────────────────────────── */

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
  createdAt: string;
}

interface VariantImage {
  name: string;
  hex: string;
  image: string;
}

/* ─── Hero Carousel ─────────────────────────────────────── */

function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % bannerSlides.length);
    }, 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const go = (dir: number) => {
    setCurrent((p) => (p + dir + bannerSlides.length) % bannerSlides.length);
    resetTimer();
  };

  const slide = bannerSlides[current];

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[2/1] lg:aspect-[2.2/1] overflow-hidden rounded-xl group bg-luxury-black">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.headline}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="px-8 md:px-12 lg:px-16 max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block bg-luxury-gold text-luxury-black px-3 py-1 text-[10px] tracking-widest uppercase font-bold mb-4 rounded-sm">
                {slide.tag}
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-3">
                {slide.headline}
              </h2>
              <p className="text-white/80 text-sm md:text-base mb-6">
                {slide.sub}
              </p>
              <Link
                href={slide.cta.href}
                className="inline-flex items-center gap-2 bg-white text-luxury-black px-6 py-3 text-xs tracking-widest uppercase font-semibold hover:bg-luxury-gold transition-colors duration-300 rounded-sm"
              >
                {slide.cta.label}
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {bannerSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Promo Card ────────────────────────────────────────── */

function PromoCard({ card }: { card: typeof promoCards[0] }) {
  return (
    <Link href={card.href} className="group relative block overflow-hidden rounded-xl h-full">
      <img
        src={card.image}
        alt={card.headline}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <span className="text-luxury-gold text-[10px] tracking-widest uppercase font-bold">
          {card.tag}
        </span>
        <h3 className="font-display text-xl text-white mt-1">
          {card.headline}
        </h3>
        <p className="text-white/70 text-xs mt-1">{card.sub}</p>
        <span className="inline-flex items-center gap-1 text-xs text-white mt-3 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
          Shop Now <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

/* ─── Product Card ──────────────────────────────────────── */

function ProductCard({ product }: { product: Product }) {
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

  return (
    <div className="min-w-[260px] max-w-[300px] flex-shrink-0 snap-start">
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-luxury-cream mb-3">
          <img
            src={activeVariant.image}
            alt={`${product.name} in ${activeVariant.name}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.featured && (
            <span className="absolute top-3 left-3 bg-luxury-black text-luxury-ivory text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-sm">
              Featured
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
        </div>

        <h3 className="font-medium text-sm text-luxury-black group-hover:text-luxury-brown transition-colors truncate">
          {product.name}
        </h3>
        <p className="text-xs text-luxury-stone mt-0.5 flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-black/10"
            style={{ backgroundColor: activeVariant.hex }}
          />
          {product.material} · {activeVariant.name}
        </p>
        <p className="text-sm font-semibold text-luxury-black mt-1">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </Link>

      {/* Swatches */}
      {variants.length > 1 && (
        <div className="flex items-center gap-1.5 mt-2">
          {variants.map((v, i) => (
            <button
              key={v.name}
              onClick={() => setActiveIdx(i)}
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
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sorted, setSorted] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch products
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Sort products
  useEffect(() => {
    let arr = [...products];
    switch (sortBy) {
      case "price-low":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        arr.sort((a, b) => b.price - a.price);
        break;
      case "name-az":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default: // featured first
        arr.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    setSorted(arr);
  }, [products, sortBy]);

  const scrollProducts = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-luxury-ivory">
      <Navbar />
      <main className="min-h-screen">
        {/* ─── Category Navigation Bar ─── */}
        <div className="pt-20 bg-white border-b border-luxury-sand/20 sticky top-20 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-3">
              <Link
                href="/products"
                className="flex-shrink-0 px-5 py-2 text-xs tracking-widest uppercase text-luxury-gray hover:text-luxury-black hover:bg-luxury-cream rounded-full transition-all font-medium"
              >
                All Furniture
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="flex-shrink-0 px-5 py-2 text-xs tracking-widest uppercase text-luxury-gray hover:text-luxury-black hover:bg-luxury-cream rounded-full transition-all"
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                href="/about"
                className="flex-shrink-0 px-5 py-2 text-xs tracking-widest uppercase text-luxury-brown font-bold hover:bg-luxury-cream rounded-full transition-all ml-auto"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* ─── USP Strip ─── */}
        <div className="bg-luxury-black text-white py-2.5">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 md:gap-16 overflow-x-auto hide-scrollbar">
            {usps.map((usp) => (
              <div key={usp.text} className="flex items-center gap-2 flex-shrink-0">
                <usp.icon size={14} className="text-luxury-gold" />
                <span className="text-[11px] tracking-wider uppercase">{usp.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Hero: Carousel + Promo Cards ─── */}
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Carousel (2/3) */}
            <div className="lg:col-span-2">
              <HeroBanner />
            </div>

            {/* Promo cards (1/3) */}
            <div className="grid grid-rows-2 gap-4">
              {promoCards.map((card) => (
                <PromoCard key={card.headline} card={card} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── Trending Products ─── */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          {/* Header with Sort */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-luxury-black">
                Trending Now
              </h2>
              <p className="text-luxury-stone text-xs mt-1">
                Our most loved pieces, curated for you
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-xs tracking-wider border border-luxury-sand/40 rounded-lg hover:border-luxury-black transition-colors bg-white"
                >
                  Sort: {sortOptions.find((o) => o.value === sortBy)?.label}
                  <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-48 bg-white border border-luxury-sand/30 rounded-lg shadow-xl z-50 overflow-hidden"
                      >
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs tracking-wider transition-colors ${sortBy === opt.value
                              ? "bg-luxury-cream text-luxury-black font-semibold"
                              : "text-luxury-gray hover:bg-luxury-cream/50"
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Scroll arrows (desktop) */}
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => scrollProducts(-1)}
                  className="w-9 h-9 border border-luxury-sand/40 rounded-full flex items-center justify-center text-luxury-gray hover:border-luxury-black hover:text-luxury-black transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollProducts(1)}
                  className="w-9 h-9 border border-luxury-sand/40 rounded-full flex items-center justify-center text-luxury-gray hover:border-luxury-black hover:text-luxury-black transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Product Scroll Row */}
          {loading ? (
            <div className="flex gap-5 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[260px] animate-pulse">
                  <div className="aspect-[4/5] bg-luxury-cream rounded-lg mb-3" />
                  <div className="h-4 bg-luxury-cream w-2/3 mb-2 rounded" />
                  <div className="h-3 bg-luxury-cream w-1/3 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4"
            >
              {sorted.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* View All link */}
          <div className="text-center mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-luxury-black text-luxury-black text-xs tracking-widest uppercase font-semibold hover:bg-luxury-black hover:text-white transition-all duration-300 rounded-sm"
            >
              View All Products
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ─── Category Showcase Grid ─── */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl text-luxury-black">
              Shop by Category
            </h2>
            <p className="text-luxury-stone text-xs mt-1">
              Find the perfect piece for every room
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-xl"
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display text-xl md:text-2xl text-white mb-1">
                      {cat.label}
                    </h3>
                    <p className="text-white/60 text-xs">{cat.desc}</p>
                    <span className="inline-flex items-center gap-1 text-luxury-gold text-xs tracking-wider uppercase mt-3 font-semibold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Explore <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Brand Promise Banner ─── */}
        <section className="max-w-7xl mx-auto px-4 py-6 mb-6">
          <div className="relative overflow-hidden rounded-xl bg-luxury-black p-10 md:p-16">
            <img
              src="/images/ui/ui-1616486338812-3dadae4b4ace.jpg"
              alt="Craftsmanship"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="relative z-10 max-w-xl">
              <Sparkles className="text-luxury-gold mb-4" size={32} />
              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
                Furniture, Crafted to<br />
                <span className="italic text-luxury-gold">Your Vision</span>
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Every Terminal piece is made to order by master craftspeople using sustainably sourced materials. Personalize materials, dimensions, and finishes to create something uniquely yours.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-luxury-gold text-luxury-black px-6 py-3 text-xs tracking-widest uppercase font-bold hover:bg-white transition-colors rounded-sm"
              >
                Our Craft <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
