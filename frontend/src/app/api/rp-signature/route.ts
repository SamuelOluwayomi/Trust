import { NextResponse } from "next/server";
import { signRequest } from "@worldcoin/idkit/signing";

export async function POST(request: Request): Promise<Response> {
  try {
    const { action } = await request.json();
    const signingKey = process.env.WORLDCOIN_RP_SIGNING_KEY;

    if (!signingKey) {
      return NextResponse.json({ error: "Missing WORLDCOIN_RP_SIGNING_KEY" }, { status: 500 });
    }

    if (!action) {
      return NextResponse.json({ error: "Missing action in request body" }, { status: 400 });
    }

    const { sig, nonce, createdAt, expiresAt } = signRequest(action, signingKey);

    return NextResponse.json({
      sig,
      nonce,
      created_at: createdAt,
      expires_at: expiresAt,
    });
  } catch (err: any) {
    console.error("RP Signature error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate signature" }, { status: 500 });
  }
}
