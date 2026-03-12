import { prisma } from "@/lib/db";

/**
 * Get a valid Zoho access token, auto-refreshing if expired.
 * Returns null if no token is stored (user hasn't connected yet).
 */
export async function getZohoAccessToken(): Promise<string | null> {
  const token = await prisma.zohoToken.findFirst();

  if (!token) return null;

  // If token is still valid (with 2-minute buffer), return it
  if (token.expiresAt > new Date(Date.now() + 2 * 60 * 1000)) {
    return token.accessToken;
  }

  // Token expired — refresh it
  try {
    const res = await fetch("https://accounts.zoho.in/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: token.refreshToken,
        client_id: process.env.ZOHO_CLIENT_ID!,
        client_secret: process.env.ZOHO_CLIENT_SECRET!,
        grant_type: "refresh_token",
      }),
    });

    const data = await res.json();

    if (data.error) {
      console.error("Zoho token refresh failed:", data);
      return null;
    }

    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    await prisma.zohoToken.update({
      where: { id: token.id },
      data: {
        accessToken: data.access_token,
        expiresAt,
      },
    });

    return data.access_token;
  } catch (error) {
    console.error("Zoho token refresh error:", error);
    return null;
  }
}

/**
 * Get the stored Zoho organization ID.
 */
export async function getZohoOrganizationId(): Promise<string | null> {
  const token = await prisma.zohoToken.findFirst();
  return token?.organizationId || null;
}

/**
 * Check if Zoho is connected (token exists in DB).
 */
export async function isZohoConnected(): Promise<boolean> {
  const count = await prisma.zohoToken.count();
  return count > 0;
}

/**
 * Make an authenticated request to the Zoho Inventory API.
 */
export async function zohoFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = await getZohoAccessToken();

  if (!accessToken) {
    throw new Error("Zoho not connected. Please connect your Zoho account first.");
  }

  const orgId = await getZohoOrganizationId();
  const baseUrl = "https://www.zohoapis.in/inventory/v1";

  const url = new URL(`${baseUrl}${endpoint}`);
  if (orgId) {
    url.searchParams.set("organization_id", orgId);
  }

  const res = await fetch(url.toString(), {
    ...options,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return res;
}
