// src/app/api/genai/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, params } = await req.json();
    // server-side only — safe to use the secret here
    const KEY = process.env.GOOGLE_GENAI_API_KEY;
    if (!KEY) {
      return NextResponse.json({ error: 'Missing GOOGLE_GENAI_API_KEY on server' }, { status: 500 });
    }

    // Example: forward to local Genkit dev server (adjust endpoint to your flow)
    const res = await fetch('http://localhost:9002/your-genkit-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`,
      },
      body: JSON.stringify({ prompt, ...params }),
    });

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: t }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
