import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { adminAuth } from "./firebase-admin";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "phone",
            credentials: {
                phone: { label: "Phone", type: "text" },
                idToken: { label: "Firebase ID Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.idToken) return null;

                const phoneStr = credentials.phone as string;
                const idTokenStr = credentials.idToken as string;

                console.log("[Auth] Authorizing phone:", phoneStr);

                try {
                    // Verify the Firebase ID token
                    const decodedToken = await adminAuth.verifyIdToken(idTokenStr);
                    const authenticatedPhone = decodedToken.phone_number;

                    if (!authenticatedPhone) {
                        console.error("[Auth] No phone number in verified token");
                        return null;
                    }

                    console.log("[Auth] Firebase token verified for:", authenticatedPhone);

                    // Atomic find or create using phone number as primary identifier
                    let user = await prisma.user.findUnique({
                        where: { phone: authenticatedPhone },
                    });

                    if (!user) {
                        console.log("[Auth] Creating new user for phone:", authenticatedPhone);
                        try {
                            user = await prisma.user.create({
                                data: {
                                    phone: authenticatedPhone,
                                    name: "New Customer",
                                    email: `phone-${Date.now()}@terminal.app`, // Dummy email
                                    role: "customer",
                                },
                            });
                        } catch (createError: any) {
                            // Handle race condition where user was created between findUnique and create
                            if (createError.code === 'P2002') { 
                                user = await prisma.user.findUnique({
                                    where: { phone: authenticatedPhone },
                                });
                            } else {
                                throw createError;
                            }
                        }
                    }

                    if (!user) {
                        console.error("[Auth] User creation or lookup failed unexpectedly");
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        phone: user.phone,
                    };
                } catch (error) {
                    console.error("[Auth] Token verification failed:", error);
                    return null;
                }
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser.id;
                    token.phone = dbUser.phone;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
});
