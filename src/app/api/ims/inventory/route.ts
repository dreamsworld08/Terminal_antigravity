export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { zohoFetch, isZohoConnected } from "@/lib/zoho";
import { prisma } from "@/lib/db";

// GET - List inventory items (from Zoho or local fallback)
export async function GET(request: Request) {
    try {
        const connected = await isZohoConnected();

        if (connected) {
            // Fetch items from Zoho Inventory
            const res = await zohoFetch("/items");
            const data = await res.json();

            if (data.code !== 0 && data.code !== undefined) {
                throw new Error(data.message || "Zoho API error");
            }

            const items = data.items || [];

            // Map Zoho items to our format
            const inventory = items.map((item: any) => ({
                id: item.item_id,
                sku: item.sku || item.item_id,
                quantity: item.stock_on_hand || 0,
                reorderPoint: item.reorder_level || 0,
                reorderQty: 10,
                unitCost: item.purchase_rate || 0,
                location: item.warehouse_name || null,
                lastRestocked: null,
                product: {
                    id: item.item_id,
                    name: item.name,
                    category: item.category_name || "Uncategorized",
                    price: item.rate || 0,
                    image: item.image_document_id ? `https://www.zohoapis.in/inventory/v1/items/${item.item_id}/image` : "/images/placeholder.jpg",
                },
                stockAlerts: [],
            }));

            // Apply search/filter from query params
            const { searchParams } = new URL(request.url);
            const search = searchParams.get("search") || "";
            const category = searchParams.get("category") || "";
            const stockStatus = searchParams.get("stockStatus") || "";

            let filtered = inventory;

            if (search) {
                const q = search.toLowerCase();
                filtered = filtered.filter(
                    (i: any) =>
                        i.sku.toLowerCase().includes(q) ||
                        i.product.name.toLowerCase().includes(q) ||
                        i.product.category.toLowerCase().includes(q)
                );
            }

            if (category) {
                filtered = filtered.filter((i: any) => i.product.category === category);
            }

            if (stockStatus === "low") {
                filtered = filtered.filter((i: any) => i.quantity <= i.reorderPoint && i.quantity > 0);
            } else if (stockStatus === "out") {
                filtered = filtered.filter((i: any) => i.quantity === 0);
            } else if (stockStatus === "ok") {
                filtered = filtered.filter((i: any) => i.quantity > i.reorderPoint);
            }

            const totalItems = inventory.length;
            const totalValue = inventory.reduce((sum: number, i: any) => sum + i.quantity * i.unitCost, 0);
            const lowStockCount = inventory.filter((i: any) => i.quantity <= i.reorderPoint && i.quantity > 0).length;
            const outOfStockCount = inventory.filter((i: any) => i.quantity === 0).length;

            return NextResponse.json({
                inventory: filtered,
                stats: { totalItems, totalValue, lowStockCount, outOfStockCount },
                source: "zoho",
            });
        }

        // Fallback: local database
        const inventory = await prisma.inventory.findMany({
            include: {
                product: true,
                stockAlerts: { where: { isRead: false } },
            },
            orderBy: { updatedAt: "desc" },
        });

        const totalItems = inventory.length;
        const totalValue = inventory.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
        const lowStockCount = inventory.filter((i) => i.quantity <= i.reorderPoint && i.quantity > 0).length;
        const outOfStockCount = inventory.filter((i) => i.quantity === 0).length;

        return NextResponse.json({
            inventory,
            stats: { totalItems, totalValue, lowStockCount, outOfStockCount },
            source: "local",
        });
    } catch (error) {
        console.error("Inventory fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
    }
}

// POST - Create inventory item
export async function POST(request: Request) {
    try {
        const connected = await isZohoConnected();
        const data = await request.json();

        if (connected) {
            const res = await zohoFetch("/items", {
                method: "POST",
                body: JSON.stringify({
                    name: data.name,
                    sku: data.sku,
                    rate: data.price || 0,
                    purchase_rate: data.unitCost || 0,
                    initial_stock: data.quantity || 0,
                    reorder_level: data.reorderPoint || 5,
                }),
            });
            const result = await res.json();
            return NextResponse.json(result, { status: 201 });
        }

        // Fallback: local database
        const inventory = await prisma.inventory.create({
            data: {
                productId: data.productId,
                sku: data.sku,
                quantity: data.quantity || 0,
                reorderPoint: data.reorderPoint || 5,
                reorderQty: data.reorderQty || 10,
                unitCost: data.unitCost || 0,
                location: data.location,
            },
            include: { product: true },
        });

        return NextResponse.json(inventory, { status: 201 });
    } catch (error) {
        console.error("Inventory create error:", error);
        return NextResponse.json({ error: "Failed to create inventory" }, { status: 500 });
    }
}

// PUT - Update inventory item
export async function PUT(request: Request) {
    try {
        const connected = await isZohoConnected();
        const data = await request.json();

        if (connected) {
            const { id, ...updateData } = data;
            const res = await zohoFetch(`/items/${id}`, {
                method: "PUT",
                body: JSON.stringify(updateData),
            });
            const result = await res.json();
            return NextResponse.json(result);
        }

        // Fallback: local database
        const { id, ...updateData } = data;
        const updated = await prisma.inventory.update({
            where: { id },
            data: updateData,
            include: { product: true },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Inventory update error:", error);
        return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
    }
}
