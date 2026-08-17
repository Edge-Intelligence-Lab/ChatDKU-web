"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/constants";
import { clearLoginRedirectGuard, loginUrl, redirectToLogin } from "@/lib/auth";

type Status = "checking" | "authenticated" | "redirecting" | "stuck";

/**
 * Apache no longer refuses anonymous requests at the edge, so this page now
 * loads for signed-out visitors. `/user` is the cheapest probe for "do I have a
 * session" — it is the same endpoint the welcome banner already reads, and it
 * 401s when Django has no netid on the session.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    fetch(API_ENDPOINTS.USER, { credentials: "include" })
      .then((response) => {
        if (cancelled) return;
        if (response.ok) {
          clearLoginRedirectGuard();
          setStatus("authenticated");
          return;
        }
        if (response.status === 401) {
          setStatus(redirectToLogin() ? "redirecting" : "stuck");
          return;
        }
        // A 5xx is the backend being down, not the user being signed out.
        // Redirecting through Duke would not fix it, so render the app and let
        // the normal error paths speak.
        setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) setStatus("authenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "authenticated") return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      {status === "stuck" ? (
        <>
          <p className="text-lg">Could not complete sign-in.</p>
          <p className="text-sm text-muted-foreground">
            Your browser came back from Duke without a valid ChatDKU session.
          </p>
          <a className="text-sm underline" href={loginUrl("/")}>
            Try signing in again
          </a>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {status === "redirecting" ? "Redirecting to NetID sign-in…" : "Signing in…"}
        </p>
      )}
    </div>
  );
}
