"use client";

import { useState, useEffect } from "react";
import { Search, Filter, AlertTriangle, Plus, PenSquare } from "lucide-react";

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    useEffect(() => {
        fetchInventory();
    }, [search, categoryFilter]);

    const fetchInventory = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (categoryFilter) params.append("category", categoryFilter);

            const res = await fetch(`/api/ims/inventory?${params.toString()}`);
            const data = await res.json();
            setInventory(data.inventory || []);
        } catch (err) {
            console.error("Failed to fetch inventory", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage stock levels, locations, and reorder points.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stock Entry
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by SKU, product name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm rounded-lg"
                    >
                        <option value="">All Categories</option>
                        <option value="sofa">Sofa</option>
                        <option value="table">Table</option>
                        <option value="bed">Bed</option>
                        <option value="chair">Chair</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/80 text-gray-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Product / SKU</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Reorder Pt.</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading inventory...</td></tr>
                            ) : inventory.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No inventory items found.</td></tr>
                            ) : (
                                inventory.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.product.image} className="w-10 h-10 rounded-lg object-cover mr-3 border border-gray-200" alt={item.product.name} />
                                                <div>
                                                    <div className="font-semibold text-gray-900">{item.product.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono mt-0.5">{item.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{item.location || "Unassigned"}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-lg">{item.quantity}</span>
                                            {item.reservedQty > 0 && <span className="text-xs text-gray-500 ml-1">({item.reservedQty} res)</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.quantity === 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <AlertTriangle className="w-3 h-3 mr-1" /> Out of Stock
                                                </span>
                                            ) : item.quantity <= item.reorderPoint ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-500">{item.reorderPoint}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors">
                                                <PenSquare className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
