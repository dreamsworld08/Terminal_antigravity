import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// GET - Generate demand forecast using AI
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get("refresh") === "true";

        // Check for existing recent forecasts (less than 24 hours old)
        if (!forceRefresh) {
            const recentForecasts = await prisma.demandForecast.findMany({
                where: {
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
                orderBy: { createdAt: "desc" },
            });
            if (recentForecasts.length > 0) {
                return NextResponse.json({ forecasts: recentForecasts, cached: true });
            }
        }

        // Gather data for AI analysis
        const inventory = await prisma.inventory.findMany({
            include: { product: true, stockMovements: { orderBy: { createdAt: "desc" }, take: 20 } },
        });

        const recentOrders = await prisma.order.findMany({
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" },
            take: 200,
        });

        // Build sales history per product
        const salesHistory: Record<string, { name: string; sku: string; category: string; totalSold: number; orderCount: number; avgOrderQty: number; currentStock: number; reorderPoint: number }> = {};

        inventory.forEach((inv) => {
            salesHistory[inv.product.id] = {
                name: inv.product.name,
                sku: inv.sku,
                category: inv.product.category,
                totalSold: 0,
                orderCount: 0,
                avgOrderQty: 0,
                currentStock: inv.quantity,
                reorderPoint: inv.reorderPoint,
            };
        });

        recentOrders.forEach((order) => {
            order.items.forEach((item) => {
                if (salesHistory[item.productId]) {
                    salesHistory[item.productId].totalSold += item.quantity;
                    salesHistory[item.productId].orderCount += 1;
                }
            });
        });

        Object.values(salesHistory).forEach((item) => {
            item.avgOrderQty = item.orderCount > 0 ? Math.round(item.totalSold / item.orderCount) : 0;
        });

        const currentMonth = new Date().toLocaleString("default", { month: "long" });
        const currentYear = new Date().getFullYear();

        // AI Prompt
        const prompt = `You are an inventory demand forecasting AI for a furniture store. Analyze the following sales and inventory data, then predict demand for the next 30 days.

Current Date: ${currentMonth} ${currentYear}
Product Sales Data: ${JSON.stringify(Object.values(salesHistory), null, 2)}

For each product, provide:
1. Predicted demand (units) for next 30 days
2. Confidence score (0-1)
3. Seasonality level (high/medium/low)
4. Trend direction (up/down/stable)
5. Key factors influencing the prediction

Respond in this exact JSON format:
{
  "forecasts": [
    {
      "productName": "...",
      "sku": "...",
      "predictedQty": 0,
      "confidence": 0.0,
      "seasonality": "medium",
      "trend": "stable",
      "factors": "explanation of factors"
    }
  ],
  "summary": "brief overall market analysis",
  "recommendations": ["actionable recommendation 1", "recommendation 2"]
}`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse AI response
        let aiData;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch {
            aiData = null;
        }

        if (!aiData || !aiData.forecasts) {
            // Fallback: generate simple statistical forecasts
            const forecasts = Object.values(salesHistory).map((item) => ({
                productName: item.name,
                sku: item.sku,
                predictedQty: Math.max(item.avgOrderQty * 4, item.reorderPoint),
                confidence: 0.6,
                seasonality: "medium" as const,
                trend: "stable" as const,
                factors: "Based on historical average sales",
            }));
            aiData = {
                forecasts,
                summary: "Statistical forecast based on sales averages (AI analysis unavailable)",
                recommendations: ["Monitor stock levels closely", "Consider seasonal trends"],
            };
        }

        // Save forecasts to database
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + 30);

        for (const f of aiData.forecasts) {
            await prisma.demandForecast.create({
                data: {
                    productName: f.productName,
                    sku: f.sku,
                    forecastDate,
                    predictedQty: f.predictedQty,
                    confidence: f.confidence,
                    seasonality: f.seasonality,
                    trend: f.trend,
                    factors: f.factors,
                },
            });
        }

        return NextResponse.json({
            forecasts: aiData.forecasts,
            summary: aiData.summary,
            recommendations: aiData.recommendations,
            cached: false,
        });
    } catch (error) {
        console.error("Forecast error:", error);
        return NextResponse.json({ error: "Failed to generate forecast" }, { status: 500 });
    }
}
