import { useSyncExternalStore } from "react";

// Subscribes to a media query and returns whether it currently matches.
// SSR returns false; on the client, updates on viewport changes.
export function useMediaQuery(query: string): boolean {
	return useSyncExternalStore(
		(onChange) => {
			const mql = window.matchMedia(query);
			mql.addEventListener("change", onChange);
			return () => mql.removeEventListener("change", onChange);
		},
		() => window.matchMedia(query).matches,
		() => false,
	);
}
