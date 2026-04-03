// app/api/verify-worldid/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const proof = await req.json();

  const response = await fetch(
    `https://developer.worldcoin.org/api/v2/verify/${process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...proof,
        action: process.env.NEXT_PUBLIC_WORLDCOIN_ACTION,
      }),
    }
  );

  if (response.ok) {
    const data = await response.json();
    return NextResponse.json({ success: true, ...data });
  } else {
    const data = await response.json();
    return NextResponse.json({ success: false, error: data }, { status: 400 });
  }
}
