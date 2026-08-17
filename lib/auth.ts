// Shibboleth used to run on every request (`<Location />` in the vhost), so the
// app never had to think about being signed out — Apache had already redirected
// anyone who wasn't. It now guards `/api/login` alone, and Django hands back a
// session cookie that lasts a week. The consequence for this app: it is served
// to anonymous visitors, so it has to notice the 401 and go get a session.
//
// Django's 401 body carries the destination (`{ message, login_url }`), but the
// path is pinned here too so a request that fails before parsing still has one.

export const LOGIN_PATH = "/api/login";
export const LOGOUT_PATH = "/api/logout";

/** Stops a broken login from becoming a redirect loop between us and Duke. */
const REDIRECT_GUARD_KEY = "chatdku_login_redirect_at";
const REDIRECT_GUARD_MS = 15_000;

export function loginUrl(next?: string): string {
  const target =
    next ??
    (typeof window === "undefined"
      ? "/"
      : window.location.pathname + window.location.search);
  return `${LOGIN_PATH}?next=${encodeURIComponent(target)}`;
}

/**
 * Sends the browser to Shibboleth. Returns false if we already tried moments
 * ago — that means login succeeded but the session still isn't being accepted,
 * and bouncing again would just spin.
 */
export function redirectToLogin(next?: string): boolean {
  if (typeof window === "undefined") return false;

  const last = Number(window.sessionStorage.getItem(REDIRECT_GUARD_KEY) ?? 0);
  if (Date.now() - last < REDIRECT_GUARD_MS) return false;

  window.sessionStorage.setItem(REDIRECT_GUARD_KEY, String(Date.now()));
  window.location.href = loginUrl(next);
  return true;
}

/** Called once the app has a working session, so the next 401 can redirect. */
export function clearLoginRedirectGuard(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(REDIRECT_GUARD_KEY);
}

/**
 * Sends the user to Shibboleth if `response` is a 401, and reports whether it
 * was one. Call it at fetch sites that can outlive the session — a tab left
 * open past the week is the case that matters.
 */
export function handleUnauthorized(response: Response): boolean {
  if (response.status !== 401) return false;
  redirectToLogin();
  return true;
}
