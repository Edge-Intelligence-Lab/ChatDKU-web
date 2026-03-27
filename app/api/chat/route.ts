import { NextResponse } from 'next/server';

const MOCK_RESPONSES = [
  (msg: string) =>
    `**Mock response** to: *"${msg}"*\n\nThis is the ChatDKU development mock API. The real backend would search DKU academic resources and provide a contextual AI-generated answer here.\n\nSet \`MOCK_API=false\` in \`.env.local\` to proxy to the internal backend instead.`,
  (msg: string) =>
    `You asked: *"${msg}"*\n\nIn production, ChatDKU uses RAG (Retrieval-Augmented Generation) to search through Duke Kunshan University's academic documents and return relevant answers.\n\n**This is a mock response** — the chat UI and streaming animation are working correctly.`,
  (_msg: string) =>
    `## Mock API Response\n\nThe ChatDKU interface is functioning correctly in local development mode.\n\n- Session management: ✓\n- Chat submission: ✓\n- Response rendering: ✓\n- Feedback buttons: ✓\n\nRemove \`MOCK_API=true\` from \`.env.local\` to connect to the real internal backend.`,
];

export async function POST(request: Request) {
  const body = await request.json();

  // Mock by default in dev; set MOCK_API=false in .env.local to proxy to the internal backend
  const useMock = process.env.NODE_ENV === 'development' && process.env.MOCK_API !== 'false';
  if (!useMock) {
    // Proxy to internal backend (requires access to internal network)
    try {
      console.log('Proxying request to chat backend service');
      const backendResponse = await fetch('https://10.200.14.82:9015/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!backendResponse.ok) {
        return new NextResponse(`Backend error: ${backendResponse.statusText}`, {
          status: backendResponse.status,
        });
      }
      // Stream the response body through instead of buffering
      return new NextResponse(backendResponse.body, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    } catch (error) {
      return new NextResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        status: 500,
      });
    }
  }

  // Mock: simulate streaming by sending word-by-word chunks
  const userMessage = body?.messages?.[0]?.content ?? body?.userInput ?? 'your question';
  const pick = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  const fullText = pick(userMessage);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = fullText.split(/(\s+)/);
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      controller.close();
    },
  });
  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
