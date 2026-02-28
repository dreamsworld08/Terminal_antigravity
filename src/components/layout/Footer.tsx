import Link from "next/link";
import { Instagram, Twitter, Linkedin, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const footerLinks = {
    collections: [
        { href: "/products?category=living", label: "Living Room" },
        { href: "/products?category=bedroom", label: "Bedroom" },
        { href: "/products?category=dining", label: "Dining" },
        { href: "/products?category=office", label: "Office" },
    ],
    company: [
        { href: "/about", label: "Our Story" },
        { href: "/about", label: "Design Philosophy" },
        { href: "/about#craftsmanship", label: "Craftsmanship" },
        { href: "/about#contact", label: "Contact" },
    ],
    support: [
        { href: "/dashboard", label: "My Account" },
        { href: "/dashboard/orders", label: "Order Tracking" },
        { href: "/dashboard/requests", label: "Custom Requests" },
        { href: "#", label: "Shipping & Returns" },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-luxury-black text-luxury-stone">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Newsletter */}
                <div className="py-16 border-b border-luxury-charcoal flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                        <h3 className="font-display text-3xl text-luxury-ivory mb-2">
                            Stay Inspired
                        </h3>
                        <p className="text-luxury-stone text-sm">
                            Receive curated collections and design insights.
                        </p>
                    </div>
                    <div className="flex w-full md:w-auto">
                        <input
                            type="email"
                            placeholder="Your email"
                            className="bg-luxury-charcoal border border-luxury-dark px-5 py-3 text-sm text-luxury-ivory placeholder-luxury-gray flex-1 md:w-72 focus:border-luxury-gold"
                        />
                        <button className="bg-luxury-ivory text-luxury-black px-6 py-3 text-sm tracking-widest uppercase hover:bg-luxury-gold hover:text-luxury-black transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>

                {/* Links */}
                <div className="py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
                    <div>
                        <Link href="/" className="flex items-center gap-3 mb-8 group">
                            <Logo className="w-10 h-10 group-hover:scale-105 transition-transform duration-500 delay-75" />
                            <div className="flex flex-col items-center justify-center pt-1">
                                <span className="font-display text-2xl tracking-[0.1em] text-luxury-ivory uppercase leading-none">
                                    TERMINAL
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm text-luxury-stone leading-relaxed">
                            Handcrafted luxury furniture for modern living. Founded 2024.
                        </p>
                    </div>

                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="text-xs tracking-widest uppercase text-luxury-ivory mb-6">
                                {title}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-luxury-stone hover:text-luxury-ivory transition-colors flex items-center gap-1 group"
                                        >
                                            {link.label}
                                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="py-8 border-t border-luxury-charcoal flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-luxury-gray">
                        &copy; {new Date().getFullYear()} Terminal. All rights reserved.
                    </p>
                    <div className="flex items-center gap-5">
                        <a href="#" className="text-luxury-gray hover:text-luxury-ivory transition-colors">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="text-luxury-gray hover:text-luxury-ivory transition-colors">
                            <Twitter size={18} />
                        </a>
                        <a href="#" className="text-luxury-gray hover:text-luxury-ivory transition-colors">
                            <Linkedin size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
