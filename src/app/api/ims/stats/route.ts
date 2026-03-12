export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { zohoFetch, isZohoConnected } from "@/lib/zoho";
import { prisma } from "@/lib/db";

// GET - Dashboard stats (from Zoho or local fallback)
export async function GET() {
    try {
        const connected = await isZohoConnected();

        if (connected) {
            // Fetch items from Zoho for stats
            const itemsRes = await zohoFetch("/items");
            const itemsData = await itemsRes.json();
            const items = itemsData.items || [];

            const totalProducts = items.length;
            const totalUnits = items.reduce((sum: number, i: any) => sum + (i.stock_on_hand || 0), 0);
            const totalStockValue = items.reduce((sum: number, i: any) => sum + (i.stock_on_hand || 0) * (i.purchase_rate || 0), 0);
            const lowStockItems = items.filter((i: any) => (i.stock_on_hand || 0) <= (i.reorder_level || 0) && (i.stock_on_hand || 0) > 0);
            const outOfStockItems = items.filter((i: any) => (i.stock_on_hand || 0) === 0);
            const healthyItems = items.filter((i: any) => (i.stock_on_hand || 0) > (i.reorder_level || 0));

            // Fetch purchase orders from Zoho
            let pendingPOs = 0;
            try {
                const poRes = await zohoFetch("/purchaseorders?status=open");
                const poData = await poRes.json();
                pendingPOs = (poData.purchaseorders || []).length;
            } catch (e) {
                // PO fetch is optional
            }

            // Sales by category from Zoho items
            const categoryMap: Record<string, { revenue: number; units: number }> = {};
            items.forEach((item: any) => {
                const cat = item.category_name || "Uncategorized";
                if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, units: 0 };
                categoryMap[cat].revenue += (item.rate || 0) * (item.stock_on_hand || 0);
                categoryMap[cat].units += item.stock_on_hand || 0;
            });

            const salesByCategory = Object.entries(categoryMap).map(([category, data]) => ({
                category,
                ...data,
            }));

            const stockDistribution = items.map((i: any) => ({
                name: i.name,
                sku: i.sku || i.item_id,
                quantity: i.stock_on_hand || 0,
                reorderPoint: i.reorder_level || 0,
                category: i.category_name || "Uncategorized",
                status: (i.stock_on_hand || 0) === 0 ? "out_of_stock" : (i.stock_on_hand || 0) <= (i.reorder_level || 0) ? "low" : "healthy",
            }));

            return NextResponse.json({
                kpis: {
                    totalProducts,
                    totalStockValue,
                    totalUnits,
                    lowStockCount: lowStockItems.length,
                    outOfStockCount: outOfStockItems.length,
                    healthyCount: healthyItems.length,
                    pendingPOs,
                    stockHealth: totalProducts > 0 ? Math.round((healthyItems.length / totalProducts) * 100) : 0,
                },
                salesByCategory,
                stockDistribution,
                alerts: [],
                monthlyTrend: [],
                recentMovements: [],
                source: "zoho",
            });
        }

        // Fallback: local database
        const inventory = await prisma.inventory.findMany({
            include: { product: true },
        });

        const totalProducts = inventory.length;
        const totalStockValue = inventory.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
        const totalUnits = inventory.reduce((sum, i) => sum + i.quantity, 0);
        const lowStockItems = inventory.filter((i) => i.quantity <= i.reorderPoint && i.quantity > 0);
        const outOfStockItems = inventory.filter((i) => i.quantity === 0);
        const healthyItems = inventory.filter((i) => i.quantity > i.reorderPoint);

        const pendingPOs = await prisma.purchaseOrder.count({
            where: { status: { in: ["draft", "ordered"] } },
        });

        const stockDistribution = inventory.map((i) => ({
            name: i.product.name,
            sku: i.sku,
            quantity: i.quantity,
            reorderPoint: i.reorderPoint,
            category: i.product.category,
            status: i.quantity === 0 ? "out_of_stock" : i.quantity <= i.reorderPoint ? "low" : "healthy",
        }));

        const alerts = await prisma.stockAlert.findMany({
            where: { isRead: false },
            include: { inventory: { include: { product: { select: { name: true } } } } },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        const recentMovements = await prisma.stockMovement.findMany({
            include: { inventory: { include: { product: { select: { name: true } } } } },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        return NextResponse.json({
            kpis: {
                totalProducts,
                totalStockValue,
                totalUnits,
                lowStockCount: lowStockItems.length,
                outOfStockCount: outOfStockItems.length,
                healthyCount: healthyItems.length,
                pendingPOs,
                stockHealth: totalProducts > 0 ? Math.round((healthyItems.length / totalProducts) * 100) : 0,
            },
            salesByCategory: [],
            stockDistribution,
            alerts,
            monthlyTrend: [],
            recentMovements,
            source: "local",
        });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
