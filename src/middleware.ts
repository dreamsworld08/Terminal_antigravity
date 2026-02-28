import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // For now, we'll do basic route protection
    // In production, this would verify NextAuth session tokens
    const { pathname } = request.nextUrl;

    // Admin routes check
    if (pathname.startsWith("/admin")) {
        // Placeholder: In production, check for admin role in session
        // const session = await auth();
        // if (!session || session.user.role !== "admin") {
        //   return NextResponse.redirect(new URL("/login", request.url));
        // }
    }

    // Dashboard routes check
    if (pathname.startsWith("/dashboard")) {
        // Placeholder: In production, check for authenticated session
        // const session = await auth();
        // if (!session) {
        //   return NextResponse.redirect(new URL("/login", request.url));
        // }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
