import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - List stock movements
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const inventoryId = searchParams.get("inventoryId");
        const type = searchParams.get("type");
        const limit = parseInt(searchParams.get("limit") || "50");

        const where: Record<string, unknown> = {};
        if (inventoryId) where.inventoryId = inventoryId;
        if (type) where.type = type;

        const movements = await prisma.stockMovement.findMany({
            where,
            include: {
                inventory: {
                    include: { product: { select: { name: true, category: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json(movements);
    } catch (error) {
        console.error("Stock movements fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch stock movements" }, { status: 500 });
    }
}

// POST - Record stock movement
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { inventoryId, type, quantity, reason, reference } = data;

        if (!inventoryId || !type || !quantity) {
            return NextResponse.json({ error: "inventoryId, type, and quantity are required" }, { status: 400 });
        }

        const inventory = await prisma.inventory.findUnique({ where: { id: inventoryId } });
        if (!inventory) {
            return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
        }

        // Calculate new quantity
        let newQty = inventory.quantity;
        if (type === "in" || type === "return") {
            newQty += quantity;
        } else if (type === "out") {
            newQty = Math.max(0, newQty - quantity);
        } else if (type === "adjustment") {
            newQty = quantity; // Direct set
        }

        // Create movement and update inventory in a transaction
        const [movement] = await prisma.$transaction([
            prisma.stockMovement.create({
                data: { inventoryId, type, quantity, reason, reference },
            }),
            prisma.inventory.update({
                where: { id: inventoryId },
                data: {
                    quantity: newQty,
                    lastRestocked: type === "in" ? new Date() : undefined,
                },
            }),
        ]);

        // Check for alerts
        if (newQty <= inventory.reorderPoint) {
            await prisma.stockAlert.create({
                data: {
                    inventoryId,
                    type: newQty === 0 ? "out_of_stock" : "low_stock",
                    message: `Stock for ${inventory.sku} is ${newQty === 0 ? "depleted" : "low"} (${newQty}/${inventory.reorderPoint})`,
                    severity: newQty === 0 ? "critical" : "warning",
                },
            });
        }

        return NextResponse.json(movement, { status: 201 });
    } catch (error) {
        console.error("Stock movement error:", error);
        return NextResponse.json({ error: "Failed to record stock movement" }, { status: 500 });
    }
}
