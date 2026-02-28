"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Save, Eye, Image, AlertCircle, CheckCircle, ChevronDown, UploadCloud } from "lucide-react";

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
    images: string;
    modelUrl?: string;
    inStock: boolean;
    featured: boolean;
}

interface VariantImage {
    name: string;
    hex: string;
    image: string;
}

const emptyProduct: Omit<Product, "id"> = {
    name: "",
    slug: "",
    description: "",
    price: 0,
    category: "living",
    material: "Velvet",
    color: "",
    dimensions: "",
    image: "",
    images: "[]",
    modelUrl: "",
    inStock: true,
    featured: false,
};

const categoryOptions = [
    { value: "living", label: "Living Room" },
    { value: "bedroom", label: "Bedroom" },
    { value: "dining", label: "Dining" },
    { value: "office", label: "Office" },
];

const materialOptions = [
    "Velvet", "Travertine", "Bouclé", "White Oak", "Walnut",
    "Maple", "Ash Wood", "Oak", "Leather", "Steel & Oak", "Concrete",
];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Form state
    const [form, setForm] = useState(emptyProduct);
    const [variants, setVariants] = useState<VariantImage[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
        setLoading(false);
    };

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setForm({ ...emptyProduct });
        setVariants([]);
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        let parsedVariants: VariantImage[] = [];
        try { parsedVariants = JSON.parse(product.images); } catch { }
        setForm({
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            category: product.category,
            material: product.material,
            color: product.color,
            dimensions: product.dimensions || "",
            image: product.image,
            images: product.images,
            modelUrl: product.modelUrl || "",
            inStock: product.inStock,
            featured: product.featured,
        });
        setVariants(Array.isArray(parsedVariants) ? parsedVariants : []);
        setShowModal(true);
    };

    const updateForm = (field: string, value: string | number | boolean) => {
        setForm((prev) => {
            const updated = { ...prev, [field]: value };
            // Auto-generate slug from name
            if (field === "name") {
                updated.slug = generateSlug(value as string);
            }
            return updated;
        });
    };

    // Variant management
    const addVariant = () => {
        setVariants((prev) => [...prev, { name: "", hex: "#808080", image: "" }]);
    };

    const updateVariant = (index: number, field: keyof VariantImage, value: string) => {
        setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
    };

    const removeVariant = (index: number) => {
        setVariants((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string = "image", isVariant: boolean = false, variantIndex: number = -1) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();

            if (isVariant && variantIndex >= 0) {
                updateVariant(variantIndex, field as keyof VariantImage, data.url);
            } else {
                updateForm(field, data.url);
            }
            showToast("File uploaded successfully!", "success");
        } catch (err) {
            showToast("Failed to upload file. Try again.", "error");
        } finally {
            setIsUploading(false);
            // Reset input so same file can be chosen again if needed
            e.target.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.slug || !form.price || !form.image) {
            showToast("Please fill in all required fields (Name, Price, Image URL)", "error");
            return;
        }

        setSaving(true);

        // If first variant's image matches the main image, set color from first variant
        const productData = {
            name: form.name,
            slug: form.slug,
            description: form.description,
            price: Number(form.price),
            category: form.category,
            material: form.material,
            color: variants.length > 0 ? variants[0].name : form.color,
            dimensions: form.dimensions,
            image: variants.length > 0 ? variants[0].image : form.image,
            images: JSON.stringify(variants.length > 0 ? variants : []),
            modelUrl: form.modelUrl || null,
            inStock: form.inStock,
            featured: form.featured,
        };

        try {
            if (editingProduct) {
                // Update existing product
                const res = await fetch(`/api/products/${editingProduct.slug}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData),
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Server returned ${res.status}: ${errorText}`);
                }
                showToast(`"${form.name}" updated successfully!`, "success");
            } else {
                // Create new product
                const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData),
                });
                if (!res.ok) throw new Error("Failed to create");
                showToast(`"${form.name}" created successfully!`, "success");
            }

            setShowModal(false);
            fetchProducts();
        } catch (err: any) {
            showToast(`Failed to ${editingProduct ? "update" : "create"} product: ${err.message}`, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (product: Product) => {
        try {
            const res = await fetch(`/api/products/${product.slug}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
            setDeleteConfirm(null);
            showToast(`"${product.name}" deleted.`, "success");
        } catch {
            showToast("Failed to delete product.", "error");
        }
    };

    return (
        <div>
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-sm ${toast.type === "success" ? "bg-green-900 text-green-100 border border-green-700" : "bg-red-900 text-red-100 border border-red-700"
                            }`}
                    >
                        {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                className="flex items-center justify-between mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="font-display text-3xl text-white mb-1">Products</h1>
                    <p className="text-gray-500 text-sm">Manage your product catalog — {products.length} products</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-luxury-gold text-luxury-black px-5 py-2.5 text-xs tracking-widest uppercase hover:bg-luxury-sand transition-colors flex items-center gap-2 rounded-lg"
                >
                    <Plus size={14} />
                    Add Product
                </button>
            </motion.div>

            {/* Products Table */}
            <motion.div
                className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Product</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Category</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Material</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Variants</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Price</th>
                                <th className="text-left px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Status</th>
                                <th className="text-right px-6 py-4 text-[11px] tracking-wider uppercase text-gray-500 font-normal">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        <td colSpan={7} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : (
                                products.map((product) => {
                                    let variantCount = 0;
                                    let variantColors: string[] = [];
                                    try {
                                        const parsed = JSON.parse(product.images);
                                        if (Array.isArray(parsed)) {
                                            variantCount = parsed.length;
                                            variantColors = parsed.map((v: VariantImage) => v.hex);
                                        }
                                    } catch { }

                                    return (
                                        <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                                                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-gray-200 block">{product.name}</span>
                                                        <span className="text-[11px] text-gray-500">{product.slug}</span>
                                                    </div>
                                                    {product.featured && (
                                                        <span className="text-[10px] bg-luxury-gold/20 text-luxury-gold px-1.5 py-0.5 rounded">Featured</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 capitalize">{product.category}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{product.material}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {variantColors.slice(0, 5).map((hex, i) => (
                                                        <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: hex }} />
                                                    ))}
                                                    {variantCount > 0 && (
                                                        <span className="text-[11px] text-gray-500 ml-1">{variantCount}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-200">₹{product.price.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-[11px] rounded-full ${product.inStock ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                                                    {product.inStock ? "In Stock" : "Out of Stock"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <a href={`/products/${product.slug}`} target="_blank" className="p-2 text-gray-500 hover:text-blue-400 transition-colors" title="Preview">
                                                        <Eye size={14} />
                                                    </a>
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="p-2 text-gray-500 hover:text-white transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    {deleteConfirm === product.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleDelete(product)}
                                                                className="px-2 py-1 text-[11px] bg-red-600 text-white rounded hover:bg-red-500"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="px-2 py-1 text-[11px] text-gray-400 hover:text-white"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(product.id)}
                                                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-2xl mb-12"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
                                <h3 className="font-display text-xl text-white">
                                    {editingProduct ? "Edit Product" : "Add New Product"}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white p-1">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Name & Slug */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => updateForm("name", e.target.value)}
                                            className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg focus:border-luxury-gold focus:outline-none"
                                            placeholder="e.g. Luna Accent Chair"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">
                                            Slug <span className="text-gray-600">(auto-generated)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.slug}
                                            onChange={(e) => updateForm("slug", e.target.value)}
                                            className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-gray-400 rounded-lg focus:border-luxury-gold focus:outline-none"
                                            placeholder="luna-accent-chair"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => updateForm("description", e.target.value)}
                                        rows={3}
                                        className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg resize-none focus:border-luxury-gold focus:outline-none"
                                        placeholder="Detailed product description..."
                                        required
                                    />
                                </div>

                                {/* Price, Category, Material */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">
                                            Price (₹) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={form.price || ""}
                                            onChange={(e) => updateForm("price", Number(e.target.value))}
                                            className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg focus:border-luxury-gold focus:outline-none"
                                            placeholder="149000"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">Category</label>
                                        <select
                                            value={form.category}
                                            onChange={(e) => updateForm("category", e.target.value)}
                                            className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg focus:border-luxury-gold focus:outline-none appearance-none"
                                        >
                                            {categoryOptions.map((c) => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">Material</label>
                                        <select
                                            value={form.material}
                                            onChange={(e) => updateForm("material", e.target.value)}
                                            className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg focus:border-luxury-gold focus:outline-none appearance-none"
                                        >
                                            {materialOptions.map((m) => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Color, Dimensions */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">Default Color</label>
                                        <input
                                            type="text"
                                            value={form.color}
                                            onChange={(e) => updateForm("color", e.target.value)}
                                            className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg focus:border-luxury-gold focus:outline-none"
                                            placeholder="e.g. Natural Oak"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">Dimensions</label>
                                        <input
                                            type="text"
                                            value={form.dimensions}
                                            onChange={(e) => updateForm("dimensions", e.target.value)}
                                            className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 text-sm text-white rounded-lg focus:border-luxury-gold focus:outline-none"
                                            placeholder="e.g. 120 × 60 × 40 cm"
                                        />
                                    </div>
                                </div>

                                {/* Main Image URL */}
                                <div>
                                    <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">
                                        Main Image <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-3">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={form.image}
                                                onChange={(e) => updateForm("image", e.target.value)}
                                                className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 pr-12 text-sm text-white rounded-lg focus:border-luxury-gold focus:outline-none"
                                                placeholder="Upload an image or paste URL..."
                                                required
                                            />
                                            <label className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-colors text-gray-400 hover:text-luxury-gold" title="Upload Image">
                                                {isUploading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <UploadCloud size={16} />}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "image")} disabled={isUploading} />
                                            </label>
                                        </div>
                                        {form.image && (
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                                                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 3D Model URL */}
                                <div>
                                    <label className="text-[11px] tracking-wider uppercase text-gray-500 mb-1.5 block">
                                        3D Model (.glb, .gltf, .obj)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.modelUrl || ""}
                                            onChange={(e) => updateForm("modelUrl", e.target.value)}
                                            className="w-full bg-[#0f0f0f] border border-white/10 px-4 py-2.5 pr-12 text-sm text-white rounded-lg focus:border-luxury-gold focus:outline-none"
                                            placeholder="Upload a 3D model or paste URL..."
                                        />
                                        <label className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-1.5 bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-colors text-gray-400 hover:text-luxury-gold" title="Upload 3D Model">
                                            {isUploading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <UploadCloud size={16} />}
                                            <input type="file" accept=".obj,.glb,.gltf" className="hidden" onChange={(e) => handleFileUpload(e, "modelUrl")} disabled={isUploading} />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1.5">
                                        Upload a GLB/GLTF model for the 3D \u0026 AR viewer. OBJ files are auto-converted to GLB.
                                    </p>
                                </div>

                                {/* Flags */}
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.featured}
                                            onChange={(e) => updateForm("featured", e.target.checked)}
                                            className="w-4 h-4 rounded bg-[#0f0f0f] border-white/10 text-luxury-gold focus:ring-luxury-gold"
                                        />
                                        <span className="text-sm text-gray-300">Featured Product</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.inStock}
                                            onChange={(e) => updateForm("inStock", e.target.checked)}
                                            className="w-4 h-4 rounded bg-[#0f0f0f] border-white/10 text-luxury-gold focus:ring-luxury-gold"
                                        />
                                        <span className="text-sm text-gray-300">In Stock</span>
                                    </label>
                                </div>

                                {/* Variant Images Section */}
                                <div className="border-t border-white/5 pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-sm text-white font-medium flex items-center gap-2">
                                                <Image size={16} className="text-luxury-gold" />
                                                Color / Finish Variants
                                            </h4>
                                            <p className="text-[11px] text-gray-500 mt-1">Add different color/finish options with their own images</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="text-xs text-luxury-gold hover:text-luxury-sand flex items-center gap-1 transition-colors"
                                        >
                                            <Plus size={14} />
                                            Add Variant
                                        </button>
                                    </div>

                                    {variants.length === 0 ? (
                                        <div className="text-center py-6 bg-[#0f0f0f] rounded-lg border border-dashed border-white/10">
                                            <Image size={24} className="mx-auto text-gray-600 mb-2" />
                                            <p className="text-xs text-gray-500">No variants added yet.</p>
                                            <button
                                                type="button"
                                                onClick={addVariant}
                                                className="text-xs text-luxury-gold hover:underline mt-1"
                                            >
                                                Add your first variant
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {variants.map((variant, i) => (
                                                <div key={i} className="bg-[#0f0f0f] border border-white/10 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        {/* Color preview */}
                                                        <div
                                                            className="w-8 h-8 rounded-full border-2 border-white/10 shrink-0 mt-1"
                                                            style={{ backgroundColor: variant.hex }}
                                                        />

                                                        {/* Fields */}
                                                        <div className="flex-1 grid grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="text-[10px] tracking-wider uppercase text-gray-600 mb-1 block">Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={variant.name}
                                                                    onChange={(e) => updateVariant(i, "name", e.target.value)}
                                                                    className="w-full bg-[#1a1a1a] border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-luxury-gold focus:outline-none"
                                                                    placeholder="e.g. Charcoal"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] tracking-wider uppercase text-gray-600 mb-1 block">Hex Color</label>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="color"
                                                                        value={variant.hex}
                                                                        onChange={(e) => updateVariant(i, "hex", e.target.value)}
                                                                        className="w-8 h-[30px] rounded cursor-pointer bg-transparent border-0"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={variant.hex}
                                                                        onChange={(e) => updateVariant(i, "hex", e.target.value)}
                                                                        className="flex-1 bg-[#1a1a1a] border border-white/10 px-3 py-1.5 text-xs text-white rounded focus:border-luxury-gold focus:outline-none"
                                                                        placeholder="#808080"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] tracking-wider uppercase text-gray-600 mb-1 block">Image</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="text"
                                                                        value={variant.image}
                                                                        onChange={(e) => updateVariant(i, "image", e.target.value)}
                                                                        className="w-full bg-[#1a1a1a] border border-white/10 px-3 py-1.5 pr-8 text-xs text-white rounded focus:border-luxury-gold focus:outline-none"
                                                                        placeholder="Upload or paste URL..."
                                                                    />
                                                                    <label className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 bg-white/5 hover:bg-white/10 rounded cursor-pointer transition-colors text-gray-400 hover:text-luxury-gold" title="Upload Image">
                                                                        <UploadCloud size={12} />
                                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "image", true, i)} disabled={isUploading} />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Image preview & delete */}
                                                        <div className="flex items-center gap-2 shrink-0 mt-1">
                                                            {variant.image && (
                                                                <div className="w-8 h-8 rounded overflow-hidden bg-white/5">
                                                                    <img src={variant.image} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeVariant(i)}
                                                                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                                                title="Remove variant"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-white/5">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-luxury-gold text-luxury-black py-3 text-xs tracking-widest uppercase hover:bg-luxury-sand transition-colors rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-luxury-black/30 border-t-luxury-black rounded-full animate-spin" />
                                                {editingProduct ? "Updating..." : "Creating..."}
                                            </span>
                                        ) : (
                                            <>
                                                <Save size={14} />
                                                {editingProduct ? "Update Product" : "Create Product"}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 border border-white/10 text-gray-400 text-xs tracking-widest uppercase hover:text-white rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
