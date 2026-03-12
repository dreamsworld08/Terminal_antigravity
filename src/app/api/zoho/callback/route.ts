export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    const error = searchParams.get("error");
    return NextResponse.redirect(
      new URL(`/admin?error=${error || "no_code"}`, request.url)
    );
  }

  const clientId = process.env.ZOHO_CLIENT_ID!;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
  const redirectUri = process.env.ZOHO_REDIRECT_URI!;

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://accounts.zoho.in/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("Zoho token error:", tokenData);
      return NextResponse.redirect(
        new URL(`/admin?error=${tokenData.error}`, request.url)
      );
    }

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Try to get organization ID
    let organizationId: string | null = null;
    try {
      const orgRes = await fetch(
        "https://www.zohoapis.in/inventory/v1/organizations",
        {
          headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` },
        }
      );
      const orgData = await orgRes.json();
      if (orgData.organizations && orgData.organizations.length > 0) {
        organizationId = orgData.organizations[0].organization_id;
      }
    } catch (e) {
      console.warn("Could not fetch Zoho organization ID:", e);
    }

    // Delete any existing tokens and store the new one
    await prisma.zohoToken.deleteMany();
    await prisma.zohoToken.create({
      data: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        organizationId,
      },
    });

    return NextResponse.redirect(
      new URL("/admin?zoho=connected", request.url)
    );
  } catch (error) {
    console.error("Zoho callback error:", error);
    return NextResponse.redirect(
      new URL("/admin?error=token_exchange_failed", request.url)
    );
  }
}
