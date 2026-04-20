import { API_ENDPOINTS } from "./constants";

// Session management utilities
const SESSION_STORAGE_KEY = "chatdku_session_id";
const ENDPOINT_STORAGE_KEY = "chatdku_api_endpoint";

export interface SessionResponse {
	session_id: string;
}

export interface Message {
	role: "bot" | "user";
	content: string;
	timestamp?: string;
}

export interface Convo {
	id: string;
	title: string;
	created_at: Date;
}

interface RawConversation {
	id: string;
	title?: string;
	created_at: string;
}

/**
 * Get a new session from the backend
 */
function setCookie(name: string, value: string, days = 1) {
	if (typeof document === "undefined") return;
	const expires = new Date(Date.now() + days * 864e5).toUTCString();
	document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie
		.split("; ")
		.find((row) => row.startsWith(`${encodeURIComponent(name)}=`));
	if (!match) return null;
	return decodeURIComponent(match.split("=")[1] || "");
}

function deleteCookie(name: string) {
	if (typeof document === "undefined") return;
	document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export async function getNewSession(): Promise<string | null> {
	try {
		const response = await fetch(API_ENDPOINTS.NEW_SESSION, {
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			console.error(
				"Failed to get new session:",
				response.status,
				response.statusText,
			);
			return null;
		}

		const data: SessionResponse = await response.json();
		const sessionId = data.session_id;

		if (sessionId) {
			// Store session_id in localStorage
			setCookie(SESSION_STORAGE_KEY, sessionId);
			console.log("New session created and stored:", sessionId);
		}

		return sessionId;
	} catch (error) {
		console.error("Error getting new session:", error);
		return null;
	}
}

/**
 * Get the current session ID from storage
 */
export function getCurrentSessionId(): string | null {
	if (typeof window === "undefined") return null;
	return getCookie(SESSION_STORAGE_KEY);
}

/**
 * Set the current session ID in storage
 */
export function setCurrentSessionId(sessionId: string): void {
	if (typeof window === "undefined") return;
	setCookie(SESSION_STORAGE_KEY, sessionId);
}

/**
 * Clear the current session ID from storage
 */
export function clearSessionId(): void {
	if (typeof window === "undefined") return;
	deleteCookie(SESSION_STORAGE_KEY);
}

/**
 * Get session messages from the backend
 */
export async function getSessionMessages(
	sessionId: string,
): Promise<Message[]> {
	try {
		const response = await fetch(API_ENDPOINTS.SESSION_MESSAGES(sessionId), {
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			console.error(
				"Failed to get session messages:",
				response.status,
				response.statusText,
			);
			return [];
		}

		const data: unknown = await response.json();

		if (!Array.isArray(data)) return [];

		return data.map((msg: unknown) => {
			const m = msg as Record<string, unknown>;
			const rawRole = ((m?.role as string | undefined) ?? "").toLowerCase();
			const role = rawRole === "bot" ? "bot" : "user";

			// Prefer `content` if present; fall back to backend's `message` field
			let contentValue: unknown = m?.content ?? m?.message;
			if (Array.isArray(contentValue)) {
				contentValue = contentValue
					.map((part: unknown) => {
						if (typeof part === "string") return part;
						const p = part as Record<string, unknown> | null;
						return (p?.text as string) ?? (p?.content as string) ?? "";
					})
					.join("\n");
			} else if (typeof contentValue === "object" && contentValue !== null) {
				const c = contentValue as Record<string, unknown>;
				contentValue = c.text ?? c.content ?? c.message ?? "";
			}
			const content =
				typeof contentValue === "string"
					? contentValue
					: String(contentValue ?? "");

			return {
				role,
				content,
				timestamp: m?.timestamp as string | undefined,
			};
		});
	} catch (error) {
		console.error("Error getting session messages:", error);
		return [];
	}
}

/**
 * Get conversations list from the backend
 */
export async function getConversations(): Promise<Convo[]> {
	try {
		const response = await fetch(API_ENDPOINTS.CONVERSATIONS, {
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			console.error(
				"Failed to get conversations:",
				response.status,
				response.statusText,
			);
			return [];
		}

		const data: RawConversation[] = await response.json();

		return data.map((conv: RawConversation) => ({
			id: conv.id,
			title: conv.title || "New Chat", // Fallback title if none exists
			created_at: new Date(conv.created_at),
		}));
	} catch (error) {
		console.error("Error getting conversations:", error);
		return [];
	}
}

/**
 * Endpoint management utilities
 */

/**
 * Get the stored API endpoint from localStorage
 */
export function getStoredEndpoint(): string {
	if (typeof window === "undefined" || typeof localStorage === "undefined")
		return API_ENDPOINTS.CHAT_DEFAULT;
	return (
		localStorage.getItem(ENDPOINT_STORAGE_KEY) || API_ENDPOINTS.CHAT_DEFAULT
	);
}

/**
 * Store the API endpoint in localStorage
 */
export function setStoredEndpoint(endpoint: string): void {
	if (typeof window === "undefined" || typeof localStorage === "undefined")
		return;
	localStorage.setItem(ENDPOINT_STORAGE_KEY, endpoint);
}

/**
 * Clear the stored API endpoint from localStorage
 */
export function clearStoredEndpoint(): void {
	if (typeof window === "undefined" || typeof localStorage === "undefined")
		return;
	localStorage.removeItem(ENDPOINT_STORAGE_KEY);
}

/**
 * Delete a conversation session
 */
export async function deleteConversation(id: string): Promise<boolean> {
	try {
		const response = await fetch(`/api/c/${id}/`, {
			method: "DELETE",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (response.ok) {
			return true;
		} else {
			console.error("Failed to delete conversation:", response.status);
			return false;
		}
	} catch (error) {
		console.error("Error deleting conversation:", error);
		return false;
	}
}
