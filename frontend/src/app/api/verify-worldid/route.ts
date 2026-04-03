// app/api/verify-worldid/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const idkitResponse = await req.json();

    // In World ID v4, we use the v4 verify endpoint
    // The identifier in the URL is typically your app_id (unless you have a custom rp_id)
    const appId = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID;
    
    const response = await fetch(
      `https://developer.world.org/api/v4/verify/${appId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(idkitResponse),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, ...data });
    } else {
      return NextResponse.json({ success: false, error: data }, { status: response.status });
    }
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
