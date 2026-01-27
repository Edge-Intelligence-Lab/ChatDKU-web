import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock session data for development
  const mockSession = {
    session_id: 'dev-session-' + Date.now(),
    user: {
      eppn: 'dev-user@dukekunshan.edu.cn',
      displayName: 'Development User',
    },
    csrf_token: 'dev-csrf-token',
  };

  return NextResponse.json(mockSession);
}

export async function POST(request: NextRequest) {
  // Handle session creation/update
  const mockSession = {
    session_id: 'dev-session-' + Date.now(),
    user: {
      eppn: 'dev-user@dukekunshan.edu.cn',
      displayName: 'Development User',
    },
    csrf_token: 'dev-csrf-token',
  };

  return NextResponse.json(mockSession);
}