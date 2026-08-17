import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Proxy onto Django's core.login.LoginView. Apache reaches Django directly in
// production, so this only runs in development — but the two have to agree,
// because a mismatch here is a login loop rather than a visible error.

const BACKEND = 'http://127.0.0.1:8009';
const mockFetch = vi.fn();

const get = (query = '', headers: Record<string, string> = {}) =>
  GET(new NextRequest(`http://localhost:3000/api/login${query}`, { headers }));

const djangoRedirect = (location: string, cookie = 'sessionid=abc; Path=/; HttpOnly') =>
  new Response(null, { status: 302, headers: { location, 'set-cookie': cookie } });

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
  mockFetch.mockResolvedValue(djangoRedirect('/'));
  vi.stubEnv('NODE_ENV', 'production');
});

describe('GET /api/login', () => {
  it('forwards the Shibboleth headers Django authenticates on', async () => {
    await get('', {
      uid: 'ab123',
      'x-displayname': 'Ada Lovelace',
      affiliation: 'student@duke.edu',
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${BACKEND}/api/login?next=%2F`);
    expect(init.headers.get('uid')).toBe('ab123');
    expect(init.headers.get('x-displayname')).toBe('Ada Lovelace');
    expect(init.headers.get('affiliation')).toBe('student@duke.edu');
  });

  it('does not follow the redirect, so the browser sees it', async () => {
    await get();

    expect(mockFetch.mock.calls[0][1].redirect).toBe('manual');
  });

  it('relays the session cookie Django just issued', async () => {
    const response = await get();

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/');
    expect(response.headers.get('set-cookie')).toContain('sessionid=abc');
  });

  it('passes a relative next through', async () => {
    mockFetch.mockResolvedValue(djangoRedirect('/c/abc123'));

    const response = await get('?next=%2Fc%2Fabc123');

    expect(mockFetch.mock.calls[0][0]).toBe(`${BACKEND}/api/login?next=%2Fc%2Fabc123`);
    expect(response.headers.get('location')).toBe('/c/abc123');
  });

  it('refuses an absolute next rather than proxying an open redirect', async () => {
    await get('?next=https%3A%2F%2Fevil.example');

    expect(mockFetch.mock.calls[0][0]).toBe(`${BACKEND}/api/login?next=%2F`);
  });

  it('refuses a protocol-relative next', async () => {
    await get('?next=%2F%2Fevil.example');

    expect(mockFetch.mock.calls[0][0]).toBe(`${BACKEND}/api/login?next=%2F`);
  });

  it('relays Django refusing a request that carried no Shibboleth identity', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ message: 'No Shibboleth identity on this request' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const response = await get();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: 'No Shibboleth identity on this request',
    });
  });

  it('reports an unreachable backend instead of looping', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await get();

    expect(response.status).toBe(502);
  });
});
