import { NextRequest } from 'next/server';
import { backendFetch, backendUnreachable, isMockApi } from '@/lib/server/backend';

// GET /api/login -> Django core.login.LoginView.
//
// This is the one path Apache still protects with Shibboleth, and the only
// place mod_shib injects identity headers. Django reads them, writes the netid
// onto its own session and sets a cookie that lasts a week; every later request
// authenticates off that cookie alone.
//
// As with every route here, Apache proxies this straight to Django in
// production and this handler only runs in development — but it has to exist,
// because without it a missing ProxyPass rule would land the login redirect on
// the Next catch-all and 404 with no clue as to why.
//
// `relayResponse` is not reused: it drops `Location`, which is the whole point
// of this response.
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get('next'));

  if (isMockApi()) {
    return Response.redirect(new URL(next, request.nextUrl.origin), 302);
  }

  try {
    const response = await backendFetch(
      request,
      `/api/login?next=${encodeURIComponent(next)}`,
      { redirect: 'manual' },
    );

    const headers = new Headers();
    const location = response.headers.get('location');
    if (location) headers.set('location', location);
    const contentType = response.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    // Django's session cookie is the credential being issued here. Losing it
    // would send the user round the Shibboleth loop forever.
    for (const cookie of response.headers.getSetCookie?.() ?? []) {
      headers.append('set-cookie', cookie);
    }

    return new Response(response.status === 302 ? null : response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    return backendUnreachable('api/login', error);
  }
}

/** Same rule as Django's: relative, same-origin paths only. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}
