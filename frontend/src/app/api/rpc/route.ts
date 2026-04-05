import { NextResponse } from 'next/server';

const RPC_URLS = [
  'https://testnet.hsk.xyz',
  'https://rpc.testnet.hsk.xyz',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // RACE MODE: Try multiple RPC nodes at once and return the first one that succeeds.
    // This is the fastest way to handle network congestion during a demo.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s total timeout

    const fetchFromNode = async (url: string) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          // Successfully got data, cancel other requests
          clearTimeout(timeoutId);
          return data;
        }
        throw new Error(`Node ${url} returned ${response.status}`);
      } catch (err) {
        throw err;
      }
    };

    try {
      // Promise.any returns the FIRST successful promise.
      const firstSucceededData = await Promise.any(RPC_URLS.map(fetchFromNode));
      return NextResponse.json(firstSucceededData);
    } catch (aggregateError) {
      // If all nodes fail, return 504
      console.error('All RPC nodes failed or timed out.');
      return NextResponse.json(
        { error: 'HashKey network is currently congested/unreachable. Please refresh in 5 seconds.' },
        { status: 504 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Network request timed out' }, { status: 504 });
    }
    console.error('RPC Proxy Framework Error:', error);
    return NextResponse.json({ error: 'Internal Proxy Error' }, { status: 500 });
  }
}
