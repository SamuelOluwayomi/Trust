// app/api/verify-worldid/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const proof = await req.json();
    const rp_id = process.env.NEXT_PUBLIC_WORLDCOIN_RP_ID;

    const response = await fetch(
      `https://developer.world.org/api/v4/verify/${rp_id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proof),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true, ...data });
    } else {
      return NextResponse.json({ success: false, error: data }, { status: response.status || 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
