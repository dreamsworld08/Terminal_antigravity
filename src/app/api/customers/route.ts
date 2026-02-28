import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    const users = await prisma.user.findMany({
        where: { role: "customer" },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            orders: {
                select: {
                    id: true,
                    total: true,
                    status: true,
                    createdAt: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const customers = users.map((user) => ({
        ...user,
        orderCount: user.orders.length,
        totalSpent: user.orders.reduce((acc, o) => acc + o.total, 0),
        lastOrder: user.orders[0]?.createdAt || null,
    }));

    return NextResponse.json(customers);
}
