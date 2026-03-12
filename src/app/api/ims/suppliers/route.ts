export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { zohoFetch, isZohoConnected } from "@/lib/zoho";
import { prisma } from "@/lib/db";

// GET - List suppliers (from Zoho or local fallback)
export async function GET() {
    try {
        const connected = await isZohoConnected();

        if (connected) {
            const res = await zohoFetch("/contacts?contact_type=vendor");
            const data = await res.json();
            const contacts = data.contacts || [];

            const suppliers = contacts.map((c: any) => ({
                id: c.contact_id,
                name: c.contact_name,
                email: c.email || null,
                phone: c.phone || null,
                address: c.billing_address ? `${c.billing_address.street || ""}, ${c.billing_address.city || ""}`.trim() : null,
                contactPerson: c.contact_persons?.[0]?.first_name || null,
                leadTimeDays: 7,
                rating: 0,
                isActive: c.status === "active",
                notes: null,
                createdAt: c.created_time,
                updatedAt: c.last_modified_time,
                _count: { purchaseOrders: 0 },
            }));

            return NextResponse.json({ suppliers, source: "zoho" });
        }

        // Fallback: local database
        const suppliers = await prisma.supplier.findMany({
            include: { _count: { select: { purchaseOrders: true } } },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ suppliers, source: "local" });
    } catch (error) {
        console.error("Suppliers fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
    }
}

// POST - Create supplier
export async function POST(request: Request) {
    try {
        const connected = await isZohoConnected();
        const data = await request.json();

        if (connected) {
            const res = await zohoFetch("/contacts", {
                method: "POST",
                body: JSON.stringify({
                    contact_name: data.name,
                    contact_type: "vendor",
                    email: data.email,
                    phone: data.phone,
                }),
            });
            const result = await res.json();
            return NextResponse.json(result, { status: 201 });
        }

        // Fallback: local database
        const supplier = await prisma.supplier.create({ data });
        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        console.error("Supplier create error:", error);
        return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
    }
}
