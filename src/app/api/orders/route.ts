import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const all = searchParams.get("all");

    // Admin: get all orders
    if (all === "true") {
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: { select: { name: true, image: true, slug: true } } } },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(orders);
    }

    // User: get orders by userId
    if (!userId) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
        where: { userId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, items, total, address, phone, notes } = body;

        const order = await prisma.order.create({
            data: {
                userId,
                total,
                address,
                phone,
                notes,
                items: {
                    create: items.map((item: { productId: string; quantity: number; price: number; options?: string }) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        options: item.options,
                    })),
                },
            },
            include: { items: true },
        });

        return NextResponse.json(order, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

// Admin: update order status
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { orderId, status } = body;

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
        });

        return NextResponse.json(order);
    } catch {
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
