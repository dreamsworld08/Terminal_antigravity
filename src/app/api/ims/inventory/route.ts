import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - List all inventory items with product details
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const stockStatus = searchParams.get("stockStatus") || "";
        const sortBy = searchParams.get("sortBy") || "updatedAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const inventory = await prisma.inventory.findMany({
            include: {
                product: true,
                stockAlerts: { where: { isRead: false } },
            },
            orderBy: { [sortBy]: sortOrder },
        });

        let filtered = inventory;

        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(
                (i) =>
                    i.sku.toLowerCase().includes(q) ||
                    i.product.name.toLowerCase().includes(q) ||
                    i.product.category.toLowerCase().includes(q)
            );
        }

        if (category) {
            filtered = filtered.filter((i) => i.product.category === category);
        }

        if (stockStatus === "low") {
            filtered = filtered.filter((i) => i.quantity <= i.reorderPoint && i.quantity > 0);
        } else if (stockStatus === "out") {
            filtered = filtered.filter((i) => i.quantity === 0);
        } else if (stockStatus === "ok") {
            filtered = filtered.filter((i) => i.quantity > i.reorderPoint);
        }

        // Calculate stats
        const totalItems = inventory.length;
        const totalValue = inventory.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
        const lowStockCount = inventory.filter((i) => i.quantity <= i.reorderPoint && i.quantity > 0).length;
        const outOfStockCount = inventory.filter((i) => i.quantity === 0).length;

        return NextResponse.json({
            inventory: filtered,
            stats: { totalItems, totalValue, lowStockCount, outOfStockCount },
        });
    } catch (error) {
        console.error("Inventory fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
    }
}

// POST - Create or update inventory item
export async function POST(request: Request) {
    try {
        const data = await request.json();

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

        // Create initial stock movement
        if (data.quantity > 0) {
            await prisma.stockMovement.create({
                data: {
                    inventoryId: inventory.id,
                    type: "in",
                    quantity: data.quantity,
                    reason: "Initial stock entry",
                },
            });
        }

        return NextResponse.json(inventory, { status: 201 });
    } catch (error) {
        console.error("Inventory create error:", error);
        return NextResponse.json({ error: "Failed to create inventory" }, { status: 500 });
    }
}

// PUT - Update inventory item
export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        if (!id) {
            return NextResponse.json({ error: "Inventory ID required" }, { status: 400 });
        }

        const existing = await prisma.inventory.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
        }

        // If quantity changed, create a stock movement
        if (updateData.quantity !== undefined && updateData.quantity !== existing.quantity) {
            const diff = updateData.quantity - existing.quantity;
            await prisma.stockMovement.create({
                data: {
                    inventoryId: id,
                    type: diff > 0 ? "in" : "out",
                    quantity: Math.abs(diff),
                    reason: "Manual adjustment",
                },
            });
        }

        const updated = await prisma.inventory.update({
            where: { id },
            data: updateData,
            include: { product: true },
        });

        // Check for low stock alert
        if (updated.quantity <= updated.reorderPoint) {
            const existingAlert = await prisma.stockAlert.findFirst({
                where: { inventoryId: id, type: "low_stock", resolvedAt: null },
            });
            if (!existingAlert) {
                await prisma.stockAlert.create({
                    data: {
                        inventoryId: id,
                        type: updated.quantity === 0 ? "out_of_stock" : "low_stock",
                        message: `Stock for ${updated.sku} is ${updated.quantity === 0 ? "depleted" : "low"} (${updated.quantity}/${updated.reorderPoint})`,
                        severity: updated.quantity === 0 ? "critical" : "warning",
                    },
                });
            }
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Inventory update error:", error);
        return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
    }
}
