import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const product = await prisma.product.create({ data: body });
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
