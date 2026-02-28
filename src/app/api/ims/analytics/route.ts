import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Dashboard analytics
export async function GET() {
    try {
        // Inventory stats
        const inventory = await prisma.inventory.findMany({
            include: { product: true },
        });

        const totalProducts = inventory.length;
        const totalStockValue = inventory.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
        const totalUnits = inventory.reduce((sum, i) => sum + i.quantity, 0);
        const lowStockItems = inventory.filter((i) => i.quantity <= i.reorderPoint && i.quantity > 0);
        const outOfStockItems = inventory.filter((i) => i.quantity === 0);
        const healthyItems = inventory.filter((i) => i.quantity > i.reorderPoint);

        // Recent orders for sales trend
        const recentOrders = await prisma.order.findMany({
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" },
            take: 100,
        });

        // Sales by category
        const categoryMap: Record<string, { revenue: number; units: number }> = {};
        recentOrders.forEach((order) => {
            order.items.forEach((item) => {
                const cat = item.product.category;
                if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, units: 0 };
                categoryMap[cat].revenue += item.price * item.quantity;
                categoryMap[cat].units += item.quantity;
            });
        });

        const salesByCategory = Object.entries(categoryMap).map(([category, data]) => ({
            category,
            ...data,
        }));

        // Stock level distribution
        const stockDistribution = inventory.map((i) => ({
            name: i.product.name,
            sku: i.sku,
            quantity: i.quantity,
            reorderPoint: i.reorderPoint,
            category: i.product.category,
            status: i.quantity === 0 ? "out_of_stock" : i.quantity <= i.reorderPoint ? "low" : "healthy",
        }));

        // Unread alerts
        const alerts = await prisma.stockAlert.findMany({
            where: { isRead: false },
            include: { inventory: { include: { product: { select: { name: true } } } } },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        // Pending purchase orders
        const pendingPOs = await prisma.purchaseOrder.count({
            where: { status: { in: ["draft", "ordered"] } },
        });

        // Monthly sales trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlySalesOrders = await prisma.order.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true, total: true },
        });

        const monthlyTrend: Record<string, number> = {};
        monthlySalesOrders.forEach((order) => {
            const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
            monthlyTrend[key] = (monthlyTrend[key] || 0) + order.total;
        });

        // Recent stock movements
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
            salesByCategory,
            stockDistribution,
            alerts,
            monthlyTrend: Object.entries(monthlyTrend).map(([month, revenue]) => ({ month, revenue })),
            recentMovements,
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
