// Server-side helpers for talking to the Django backend.
//
// Deployment topology on GPU4 (verified against /etc/apache2/sites-enabled/chatdku.conf):
// Apache terminates TLS, enforces Shibboleth and fans out per prefix —
//
//   /api/chat, /api/c/, /api/feedback, /api/events  -> Django            127.0.0.1:8009
//   /api/get_session                                -> Django /api/c/create_session
//   /user, /admin                                   -> Django            127.0.0.1:8009
//   /public/chat, /public/auth/get-token            -> FastAPI "public"  127.0.0.1:8999
//   everything else                                 -> this Next server  127.0.0.1:3000
//
// So in production Apache reaches Django directly and the route handlers below
// are only exercised in development. They still mirror Django's URL structure
// 1:1, so behaviour is identical either way and a change to the Apache config
// cannot silently start serving mock data.
//
// The FastAPI service on :8999 is a *different product* — the unauthenticated
// public chat (JWT via /auth/get-token, single-step text/plain stream, no
// sessions) used by ChatDKU-web-public. Do not point this app at it. The agent
// itself is a third FastAPI service on :8123, reached by Django via Celery.
//
// Careful with `/user`: the vhost has `ProxyPass /user http://127.0.0.1:8009/user/`,
// whose two sides disagree about the trailing slash, so Apache appends the
// remainder of the request path to a target that already ends in one. `/user`
// itself is fine (empty remainder -> `/user/`), but `/user/upload` arrives as
// `/user//upload` and Django's resolver does not collapse repeated slashes, so
// it 404s. Balancing the rule (`ProxyPass /user/ http://127.0.0.1:8009/user/`)
// is the fix; until then uploads only work in development. The paths below are
// what this server sends to Django directly, with no Apache in between, so
// they are spelled the way Django expects.
//
// Backend reference (ChatDKU-backend, django_backend/):
//   GET    /user/                       -> { netid, username, role }
//   GET    /user/upload                 -> { netid, document: string[] }
//   POST   /user/upload                 -> multipart field `file_` (pdf, <=10MB)
//   GET    /api/c/create_session/       -> 201 { session_id }
//   GET    /api/c/                      -> [{ id, title, created_at }]
//   GET    /api/c/{id}/messages/        -> [{ id, role, message, created_at }]
//   PATCH  /api/c/{id}/rename/          -> { id, title }
//   DELETE /api/c/{id}/                 -> 204
//   POST   /api/chat                    -> 202 { chatId, sessionId }
//   GET    /api/chat/{chatId}?sessionId -> text/event-stream
//   POST   /api/feedback                -> 201 { message }
//
// Auth: core.auth.ShibbolethAuthentication reads the `UID` header (injected by
// Shibboleth at the edge) or `netid` off the Django session cookie, and
// core.middleware.GETNetIDMiddleware 401s anything with neither. So both the
// cookie and the Shibboleth headers have to be forwarded on every hop, and
// Django's Set-Cookie has to come back out, or each request would start a new
// session server-side.

export const BACKEND_BASE_URL = (
  process.env.BACKEND_BASE_URL ?? 'http://127.0.0.1:8009'
).replace(/\/$/, '');

/** Mock data is on by default in `npm run dev`; set MOCK_API=false to hit the real backend. */
export function isMockApi(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.MOCK_API !== 'false';
}

// `x-eppn` is the fallback core/login.py derives the netid from when mod_shib's
// attribute map does not release a bare `uid`.
const FORWARDED_REQUEST_HEADERS = ['cookie', 'uid', 'x-eppn', 'x-displayname', 'affiliation'];

function forwardedHeaders(request: Request, extra: Record<string, string> = {}): Headers {
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  for (const [name, value] of Object.entries(extra)) {
    headers.set(name, value);
  }
  return headers;
}

export interface BackendRequestInit {
  method?: string;
  /** Serialised as JSON unless it is already a BodyInit. */
  body?: unknown;
  headers?: Record<string, string>;
  /**
   * `/api/login` answers with a 302 that the browser has to see. The default
   * would follow it here and swallow the `Location`.
   */
  redirect?: RequestRedirect;
}

/** Calls `path` (e.g. "/api/c/") on the backend with this request's auth forwarded. */
export function backendFetch(
  request: Request,
  path: string,
  init: BackendRequestInit = {},
): Promise<Response> {
  const { method = 'GET', body, headers = {}, redirect } = init;

  const isRawBody =
    body instanceof FormData ||
    body instanceof ReadableStream ||
    body instanceof URLSearchParams ||
    typeof body === 'string';

  const extra = { ...headers };
  if (body !== undefined && !isRawBody) {
    extra['Content-Type'] = 'application/json';
  }

  return fetch(`${BACKEND_BASE_URL}${path}`, {
    method,
    ...(redirect ? { redirect } : {}),
    headers: forwardedHeaders(request, extra),
    body:
      body === undefined
        ? undefined
        : isRawBody
          ? (body as BodyInit)
          : JSON.stringify(body),
    // Multipart/stream uploads need this to send a request body without buffering it.
    ...(body instanceof ReadableStream ? { duplex: 'half' } : {}),
  } as RequestInit);
}

const FORWARDED_RESPONSE_HEADERS = ['content-type', 'cache-control'];

/**
 * Relays a backend response to the browser, preserving status, content type and
 * Set-Cookie. Streaming responses (SSE) are piped through unbuffered.
 */
export function relayResponse(backendResponse: Response, options: { stream?: boolean } = {}): Response {
  const headers = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = backendResponse.headers.get(name);
    if (value) headers.set(name, value);
  }

  // Django's session cookie has to reach the browser, otherwise every proxied
  // request creates a fresh server-side session.
  const setCookie = backendResponse.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookie) {
    headers.append('set-cookie', cookie);
  }

  if (options.stream) {
    headers.set('Cache-Control', 'no-cache, no-transform');
    headers.set('Connection', 'keep-alive');
    headers.set('X-Accel-Buffering', 'no');
  }

  // 204/304 must not carry a body.
  const body = backendResponse.status === 204 || backendResponse.status === 304
    ? null
    : backendResponse.body;

  return new Response(body, { status: backendResponse.status, headers });
}

/** Uniform 502 for an unreachable backend. */
export function backendUnreachable(context: string, error: unknown): Response {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${context}] backend request failed:`, message);
  return Response.json({ error: `Backend unreachable: ${message}` }, { status: 502 });
}
