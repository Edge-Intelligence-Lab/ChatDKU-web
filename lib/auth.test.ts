import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearLoginRedirectGuard,
  handleUnauthorized,
  loginUrl,
  redirectToLogin,
} from './auth';

// Shibboleth now guards /api/login only, so the app is served to signed-out
// visitors and has to route them there itself.

const setLocation = (pathname: string, search = '') => {
  vi.stubGlobal('window', {
    location: { pathname, search, href: '' },
    sessionStorage: window.sessionStorage,
  });
};

beforeEach(() => {
  window.sessionStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('loginUrl', () => {
  it('sends the user back to where they were', () => {
    setLocation('/c/abc123', '?q=1');

    expect(loginUrl()).toBe('/api/login?next=%2Fc%2Fabc123%3Fq%3D1');
  });

  it('takes an explicit destination', () => {
    setLocation('/');

    expect(loginUrl('/about')).toBe('/api/login?next=%2Fabout');
  });
});

describe('redirectToLogin', () => {
  it('navigates to the Shibboleth-protected endpoint', () => {
    setLocation('/');

    expect(redirectToLogin()).toBe(true);
    expect(window.location.href).toBe('/api/login?next=%2F');
  });

  it('refuses to bounce twice in a row', () => {
    // Login succeeded but the session still is not accepted; redirecting again
    // would ping-pong between us and Duke forever.
    setLocation('/');
    redirectToLogin();
    window.location.href = '';

    expect(redirectToLogin()).toBe(false);
    expect(window.location.href).toBe('');
  });

  it('allows another attempt once the guard has aged out', () => {
    setLocation('/');
    redirectToLogin();
    window.location.href = '';
    vi.advanceTimersByTime(20_000);

    expect(redirectToLogin()).toBe(true);
  });

  it('allows another attempt once a session has been established', () => {
    setLocation('/');
    redirectToLogin();
    window.location.href = '';
    clearLoginRedirectGuard();

    expect(redirectToLogin()).toBe(true);
  });
});

describe('handleUnauthorized', () => {
  it('redirects on a 401 and says it did', () => {
    setLocation('/');

    expect(handleUnauthorized(new Response(null, { status: 401 }))).toBe(true);
    expect(window.location.href).toBe('/api/login?next=%2F');
  });

  it('leaves other statuses alone', () => {
    setLocation('/');

    expect(handleUnauthorized(new Response(null, { status: 200 }))).toBe(false);
    expect(handleUnauthorized(new Response(null, { status: 500 }))).toBe(false);
    expect(window.location.href).toBe('');
  });
});
