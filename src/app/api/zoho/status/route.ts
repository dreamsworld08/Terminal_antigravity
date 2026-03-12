export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { isZohoConnected, getZohoOrganizationId } from "@/lib/zoho";

export async function GET() {
  try {
    const connected = await isZohoConnected();
    const organizationId = connected ? await getZohoOrganizationId() : null;

    return NextResponse.json({
      connected,
      organizationId,
    });
  } catch (error) {
    console.error("Zoho status error:", error);
    return NextResponse.json({ connected: false, organizationId: null });
  }
}
