import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - List alerts
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get("unread") === "true";

        const where: Record<string, unknown> = {};
        if (unreadOnly) where.isRead = false;

        const alerts = await prisma.stockAlert.findMany({
            where,
            include: {
                inventory: { include: { product: { select: { name: true, category: true } } } },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return NextResponse.json(alerts);
    } catch (error) {
        console.error("Alerts fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }
}

// PUT - Mark alerts as read
export async function PUT(request: Request) {
    try {
        const { ids } = await request.json();

        if (ids === "all") {
            await prisma.stockAlert.updateMany({
                where: { isRead: false },
                data: { isRead: true },
            });
        } else if (Array.isArray(ids)) {
            await prisma.stockAlert.updateMany({
                where: { id: { in: ids } },
                data: { isRead: true },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Alert update error:", error);
        return NextResponse.json({ error: "Failed to update alerts" }, { status: 500 });
    }
}

// POST - Auto-check and generate reorder suggestions
export async function POST() {
    try {
        const inventory = await prisma.inventory.findMany({
            include: { product: true },
        });

        const rules = await prisma.reorderRule.findMany({
            where: { isActive: true },
        });

        const suggestions = [];

        for (const item of inventory) {
            const applicableRule = rules.find((r) => r.category === item.product.category) || rules.find((r) => !r.category);

            if (!applicableRule) continue;

            if (item.quantity <= (applicableRule.minStockLevel || item.reorderPoint)) {
                const reorderQty = applicableRule.reorderQuantity || item.reorderQty;
                suggestions.push({
                    product: item.product.name,
                    sku: item.sku,
                    currentStock: item.quantity,
                    reorderPoint: applicableRule.minStockLevel,
                    suggestedQty: reorderQty,
                    estimatedCost: reorderQty * item.unitCost,
                    urgency: item.quantity === 0 ? "critical" : "warning",
                });

                // Create alert if not exists
                const existingAlert = await prisma.stockAlert.findFirst({
                    where: { inventoryId: item.id, type: "low_stock", resolvedAt: null },
                });
                if (!existingAlert) {
                    await prisma.stockAlert.create({
                        data: {
                            inventoryId: item.id,
                            type: item.quantity === 0 ? "out_of_stock" : "low_stock",
                            message: `Reorder needed: ${item.product.name} (${item.sku}) - Stock: ${item.quantity}/${applicableRule.minStockLevel}`,
                            severity: item.quantity === 0 ? "critical" : "warning",
                        },
                    });
                }
            }
        }

        return NextResponse.json({
            suggestions,
            totalItems: suggestions.length,
            totalEstimatedCost: suggestions.reduce((sum, s) => sum + s.estimatedCost, 0),
        });
    } catch (error) {
        console.error("Reorder check error:", error);
        return NextResponse.json({ error: "Failed to check reorder" }, { status: 500 });
    }
}
