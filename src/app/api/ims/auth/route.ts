import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// POST - IMS Login
export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        const user = await prisma.iMSUser.findUnique({ where: { email } });

        if (!user || !user.isActive) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Update last login
        await prisma.iMSUser.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        // Return user info (in production, use JWT)
        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token: Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role, exp: Date.now() + 86400000 })).toString("base64"),
        });
    } catch (error) {
        console.error("IMS Auth error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}

// GET - Verify token / get session
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = JSON.parse(Buffer.from(token, "base64").toString());

        if (decoded.exp < Date.now()) {
            return NextResponse.json({ error: "Token expired" }, { status: 401 });
        }

        const user = await prisma.iMSUser.findUnique({ where: { id: decoded.id } });
        if (!user || !user.isActive) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        return NextResponse.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}
