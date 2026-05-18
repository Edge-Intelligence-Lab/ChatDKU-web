import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const MOCK_STREAM_EVENTS = [
  { id: "mock-1", data: { type: "reasoning", stage: "start", content: "Agent started" } },
  { id: "mock-2", data: { type: "reasoning", stage: "Planner", content: "1. Analyze the user's issue and determine if it is necessary to inquire about the relevant policies and procedures for DKU course registration. \n2. Search for information such as the registration window, credit requirements, and course selection process in the knowledge base. 3. Organize the answers and quote relevant official policies." } },
  { id: "mock-3", data: { type: "reasoning", stage: "Executor", content: "VectorQuery: DKU course registration policy deadline requirements credit hours" } },
  { id: "mock-4", data: { type: "reasoning", stage: "Executor", content: "VectorQuery: DKU student portal registration window shopping cart prerequisites" } },
  { id: "mock-5", data: { type: "chunk", stage: "generation", content: "To register for courses at Duke Kunshan University, log in to the DKU student portal during your designated registration window. " } },
  { id: "mock-6", data: { type: "chunk", stage: "generation", content: "Priority is determined by academic standing and credit hours completed.\n\n" } },
  { id: "mock-7", data: { type: "chunk", stage: "generation", content: "**Key steps:**\n\n" } },
  { id: "mock-8", data: { type: "chunk", stage: "generation", content: "1. **Check your registration time** — Your specific window is listed in the Registrar's portal. Seniors register first, followed by juniors, sophomores, and freshmen.\n\n" } },
  { id: "mock-9", data: { type: "chunk", stage: "generation", content: "2. **Review prerequisites** — Make sure you satisfy all prerequisites for your desired courses. The system will block enrollment if requirements are unmet.\n\n" } },
  { id: "mock-10", data: { type: "chunk", stage: "generation", content: "3. **Add courses to your shopping cart** — During the browsing period before registration opens, you can stage your selections in your cart.\n\n" } },
  { id: "mock-11", data: { type: "chunk", stage: "generation", content: "4. **Submit your registration** — When your window opens, confirm your course selections promptly. High-demand courses fill quickly.\n\n" } },
  { id: "mock-12", data: { type: "chunk", stage: "generation", content: "If you encounter a registration hold or need an instructor override, contact the Office of the Registrar at registrar@dukekunshan.edu.cn with your student ID and a brief explanation." } },
  { id: "mock-13", data: { type: "end", stage: "end", content: "" } },
];

// GET /api/chat/[chatId]?sessionId=xxx
// SSE stream endpoint: Real-time push of Agent responses

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  const useMock = process.env.NODE_ENV === 'development' && process.env.MOCK_API !== 'false';

  console.log(`GET /api/chat/${chatId}?sessionId=${sessionId}`);

if (!useMock) {
    try {
      const cleanChatId = chatId.replace(/\/$/, '');
      const backendUrl = `http://10.200.14.82:8996/api/chat/${cleanChatId}?sessionId=${sessionId}`;
      console.log('Proxying SSE from:', backendUrl);

      const backendResponse = await fetch(backendUrl, {
        headers: { 
          'Accept': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
      });

      if (!backendResponse.ok || !backendResponse.body) {
        const errorText = await backendResponse.text();
        console.error('Backend SSE error:', backendResponse.status, errorText);
        return NextResponse.json(
          { error: `Backend error: ${backendResponse.status}` },
          { status: backendResponse.status }
        );
      }

      return new Response(backendResponse.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      console.error('SSE proxy error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  // Mock mode
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const event of MOCK_STREAM_EVENTS) {
        const sseData = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(sseData));

        if (event.data.type === 'reasoning') {
          await new Promise((resolve) => setTimeout(resolve, 600));  
        } else if (event.data.type === 'chunk') {
          await new Promise((resolve) => setTimeout(resolve, 120));  
        }
      }
      controller.close();
      console.log('Mock SSE stream ended');
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}