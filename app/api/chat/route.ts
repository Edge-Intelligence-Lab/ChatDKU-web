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

// Receive the user message and return the chatId and sessionId
export async function POST(request: NextRequest) {
  const body = await request.json();
  const useMock = process.env.NODE_ENV === 'development' && process.env.MOCK_API !== 'false';

if (!useMock) {
    try {
      console.log('Proxying chat request to backend...');
      
      const backendResponse = await fetch('http://10.200.14.82:8996/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify(body),
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend error:', backendResponse.status, errorText);
        return NextResponse.json(
          { error: `Backend error: ${errorText}` },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Backend connection error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  // Mock mode
  const mockChatId = `mock-chat-${Date.now()}`;
  const mockSessionId = body?.chatHistoryId || `mock-session-${Date.now()}`;

  console.log('Mock POST /api/chat → returning chatId:', mockChatId);

  return NextResponse.json({
    chatId: mockChatId,
    sessionId: mockSessionId,
  });
}