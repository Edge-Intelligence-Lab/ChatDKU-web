import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const useMock = process.env.NODE_ENV === 'development' && process.env.MOCK_API !== 'false';

  if (!useMock) {
    try {
      const backendResponse = await fetch('http://10.200.14.82:8996/api/c/create_session/', {
        method: 'GET',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend create_session error:', backendResponse.status, errorText);
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: backendResponse.status }
        );
      }

      const data = await backendResponse.json();
      console.log('Session created:', data);
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
  const useMock = process.env.NODE_ENV === 'development' && process.env.MOCK_API !== 'false';

  if (!useMock) {
    try {
      const backendResponse = await fetch('http://10.200.14.82:8996/api/c/create_session/', {
        method: 'POST',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      });

      if (!backendResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: backendResponse.status }
        );
      }

      return NextResponse.json(await backendResponse.json());
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

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