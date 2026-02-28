import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - List suppliers
export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            include: {
                _count: { select: { purchaseOrders: true } },
            },
            orderBy: { name: "asc" },
        });
        return NextResponse.json(suppliers);
    } catch (error) {
        console.error("Suppliers fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
    }
}

// POST - Create supplier
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const supplier = await prisma.supplier.create({ data });
        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        console.error("Supplier create error:", error);
        return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
    }
}

// PUT - Update supplier
export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;
        if (!id) return NextResponse.json({ error: "Supplier ID required" }, { status: 400 });

        const supplier = await prisma.supplier.update({
            where: { id },
            data: updateData,
        });
        return NextResponse.json(supplier);
    } catch (error) {
        console.error("Supplier update error:", error);
        return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
    }
}
