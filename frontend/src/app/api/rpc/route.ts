import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Add a timeout to the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch('https://testnet.hsk.xyz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If the upstream RPC returns an error (like 500, 504, etc)
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upstream RPC Error:', response.status, errorText);
      return NextResponse.json(
        { error: `RPC node returned ${response.status}`, details: errorText.slice(0, 100) },
        { status: response.status }
      );
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('RPC JSON Parse Error. Received:', text.slice(0, 200));
      return NextResponse.json(
        { error: 'Invalid JSON from RPC node', details: text.slice(0, 100) },
        { status: 502 } // Bad Gateway
      );
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'RPC request timed out' }, { status: 504 });
    }
    console.error('RPC Proxy Handler Error:', error);
    return NextResponse.json({ error: 'Internal Proxy Error' }, { status: 500 });
  }
}
