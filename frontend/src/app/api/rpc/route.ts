import { NextResponse } from 'next/server';

const RPC_URLS = [
  'https://testnet.hsk.xyz',
  'https://rpc.testnet.hsk.xyz',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let lastError: any = null;

    // Try multiple RPC nodes for resilience
    for (const url of RPC_URLS) {
      // 3 Retries per node with exponential backoff
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s per attempt

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data);
          }
          
          const errorText = await response.text();
          console.warn(`RPC node ${url} failed (attempt ${attempt + 1}):`, response.status, errorText.slice(0, 50));
          lastError = { status: response.status, text: errorText };

        } catch (error: any) {
          console.warn(`RPC node ${url} error (attempt ${attempt + 1}):`, error.name === 'AbortError' ? 'Timeout' : error.message);
          lastError = error;
          
          // Exponential backoff between retries (500ms, 1000ms, 1500ms)
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          }
        }
      }
    }

    // If all nodes and all retries fail
    console.error('All RPC failover attempts exhausted.');
    return NextResponse.json(
      { error: 'All RPC nodes are currently timeout/unreachable. Please try again in a few seconds.', details: lastError?.message || 'Network Congestion' },
      { status: 504 }
    );

  } catch (error: any) {
    console.error('RPC Proxy Framework Error:', error);
    return NextResponse.json({ error: 'Internal Proxy Handler Error' }, { status: 500 });
  }
}
