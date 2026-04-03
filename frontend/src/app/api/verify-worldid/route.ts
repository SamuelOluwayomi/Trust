import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
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

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: data }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
