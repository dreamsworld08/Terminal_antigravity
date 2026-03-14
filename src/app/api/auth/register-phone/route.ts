import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone } = body;

        if (!name || !phone) {
            return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
        }

        // Try to find an existing user with this phone
        let user = await prisma.user.findFirst({
            where: { phone },
        });

        if (user) {
            // Update the existing user's name
            user = await prisma.user.update({
                where: { id: user.id },
                data: { name },
            });
        } else {
            // Create a new user with name and phone
            user = await prisma.user.create({
                data: {
                    name,
                    phone,
                    role: "customer",
                    email: `phone-${Date.now()}@terminal.app`, // Dummy email
                },
            });
        }

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone } });
    } catch (error: any) {
        console.error("Error in /api/auth/register-phone:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
