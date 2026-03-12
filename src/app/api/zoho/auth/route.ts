export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = process.env.ZOHO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Zoho credentials not configured" },
      { status: 500 }
    );
  }

  const scope = "ZohoInventory.FullAccess.all";
  const authUrl = new URL("https://accounts.zoho.in/oauth/v2/auth");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(authUrl.toString());
}
