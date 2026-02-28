"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const timeline = [
    { year: "2024", title: "Founded", description: "Terminal was born from a passion for merging technology with artisanal craftsmanship." },
    { year: "2024", title: "First Collection", description: "Launched our inaugural Living Room collection — 12 handcrafted pieces." },
    { year: "2025", title: "Design Studio", description: "Introduced our AI-powered 3D Customization Studio for personalized furniture design." },
    { year: "2025", title: "Expansion", description: "Expanded to 4 complete collections covering every room in your home." },
];

const values = [
    { title: "Timeless Design", description: "We create pieces that transcend trends, built to be cherished for generations." },
    { title: "Sustainable Craft", description: "Every material is responsibly sourced. Every process respects our planet." },
    { title: "Innovation", description: "We harness AI and 3D technology to reimagine how furniture is designed and experienced." },
    { title: "Accessibility", description: "Luxury should not be exclusionary. We make premium craftsmanship attainable." },
];

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main>
                {/* Hero */}
                <section className="pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto">
                    <motion.div
                        className="max-w-3xl"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-luxury-stone text-xs tracking-[0.3em] uppercase mb-4">
                            Our Story
                        </p>
                        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-luxury-black leading-tight mb-8">
                            Where Craft Meets
                            <br />
                            <span className="italic text-luxury-brown">Innovation</span>
                        </h1>
                        <p className="text-luxury-gray text-lg leading-relaxed max-w-2xl">
                            Terminal was founded in 2024 with a singular vision: to redefine luxury furniture
                            through the marriage of artisanal craftsmanship and cutting-edge technology.
                            We believe your space should tell your story.
                        </p>
                    </motion.div>
                </section>

                {/* Full-width Image */}
                <motion.section
                    className="px-6 lg:px-8 max-w-7xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <img
                        src="/images/ui/ui-1631679706909-1844bbd07221.jpg"
                        alt="Terminal workshop"
                        className="w-full aspect-[21/9] object-cover"
                    />
                </motion.section>

                {/* Vision */}
                <section className="py-24 lg:py-32 px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-display text-4xl text-luxury-black mb-6" id="craftsmanship">
                                Craftsmanship
                            </h2>
                            <p className="text-luxury-gray leading-relaxed mb-4">
                                Every Terminal piece begins as a sketch in our design studio and evolves through
                                the hands of master craftspeople. We work with sustainably harvested hardwoods, full-grain
                                leathers, and hand-finished metals — materials chosen for their character and longevity.
                            </p>
                            <p className="text-luxury-gray leading-relaxed">
                                Our furniture is not mass-produced. Each piece is made to order, ensuring the highest
                                quality standards and allowing for personalized customization at every step.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                        >
                            <h2 className="font-display text-4xl text-luxury-black mb-6">
                                Technology
                            </h2>
                            <p className="text-luxury-gray leading-relaxed mb-4">
                                We&apos;re not just a furniture brand — we&apos;re a technology company at heart.
                                Our AI-powered Design Studio allows you to upload your floor plans and see
                                Terminal furniture in your actual space before you buy.
                            </p>
                            <p className="text-luxury-gray leading-relaxed">
                                From 2D-to-3D model conversion to natural language room generation, we&apos;re
                                pioneering the way people interact with and purchase luxury furniture.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Values */}
                <section className="luxury-gradient py-24 lg:py-32">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="text-luxury-stone text-xs tracking-[0.3em] uppercase mb-4">
                                What Drives Us
                            </p>
                            <h2 className="font-display text-4xl md:text-5xl text-luxury-black">
                                Our Values
                            </h2>
                        </motion.div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, i) => (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="luxury-card p-8"
                                >
                                    <h3 className="font-display text-lg text-luxury-black mb-3">
                                        {value.title}
                                    </h3>
                                    <p className="text-luxury-stone text-sm leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section className="py-24 lg:py-32 px-6 lg:px-8 max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-luxury-stone text-xs tracking-[0.3em] uppercase mb-4">
                            Milestones
                        </p>
                        <h2 className="font-display text-4xl md:text-5xl text-luxury-black">
                            Our Journey
                        </h2>
                    </motion.div>

                    <div className="space-y-12">
                        {timeline.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="flex gap-8 items-start"
                            >
                                <div className="text-luxury-gold font-display text-2xl w-20 shrink-0">
                                    {item.year}
                                </div>
                                <div className="border-l-2 border-luxury-sand/40 pl-8 pb-4">
                                    <h3 className="font-display text-xl text-luxury-black mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-luxury-stone text-sm leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Contact CTA */}
                <section
                    className="bg-luxury-black py-24 text-center"
                    id="contact"
                >
                    <motion.div
                        className="max-w-2xl mx-auto px-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="font-display text-4xl text-luxury-ivory mb-6">
                            Let&apos;s Create Together
                        </h2>
                        <p className="text-luxury-stone mb-10 leading-relaxed">
                            Have a vision for your space? Our design team is ready to bring it to life.
                            Reach out to start your bespoke furniture journey.
                        </p>
                        <Link
                            href="/admin/studio"
                            className="inline-flex items-center gap-2 bg-luxury-gold text-luxury-black px-10 py-4 text-sm tracking-widest uppercase hover:bg-luxury-ivory transition-all duration-300"
                        >
                            Start Designing
                            <ArrowRight size={16} />
                        </Link>
                    </motion.div>
                </section>
            </main>
            <Footer />
        </>
    );
}
