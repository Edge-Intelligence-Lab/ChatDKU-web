import { API_ENDPOINTS } from "./constants";
import { handleUnauthorized } from "./auth";

// Session + conversation client for Django's SessionViewSet.
// Wire shapes (chat/serializer.py):
//   session -> { id, title, created_at }
//   message -> { id, role: "user" | "bot", message, created_at }

const SESSION_STORAGE_KEY = "chatdku_session_id";
const ENDPOINT_STORAGE_KEY = "chatdku_api_endpoint";

export interface SessionResponse {
	session_id: string;
}

export interface Message {
	role: "user" | "assistant";
	content: string;
	timestamp?: string;
}

export interface Convo {
	id: string;
	title: string;
	created_at: Date;
}

interface RawSession {
	id: string;
	title?: string;
	created_at: string;
}

interface RawMessage {
	id?: number;
	role?: string;
	message?: string;
	created_at?: string;
}

const jsonRequest: RequestInit = {
	credentials: "include",
	headers: { "Content-Type": "application/json" },
};

/**
 * The session cookie now lasts a week rather than until Apache next challenged
 * the request, so a tab can outlive it. Every call below routes through here so
 * that expiry sends the user back through NetID instead of quietly returning
 * empty conversation lists.
 */
async function authedFetch(input: RequestInfo | URL, init?: RequestInit) {
	const response = await fetch(input, init);
	handleUnauthorized(response);
	return response;
}

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

/**
 * Creates a session row for the authenticated user and remembers its id.
 * The id has to come from the backend — POST /api/chat rejects any
 * chatHistoryId that does not already belong to the caller.
 */
export async function getNewSession(): Promise<string | null> {
	try {
		const response = await authedFetch(API_ENDPOINTS.NEW_SESSION, {
			method: "GET",
			...jsonRequest,
		});

		if (!response.ok) {
			console.error(
				"Failed to create session:",
				response.status,
				response.statusText,
			);
			return null;
		}

		const data: SessionResponse = await response.json();
		const sessionId = data.session_id;

		if (sessionId) {
			setCookie(SESSION_STORAGE_KEY, sessionId);
		}

		return sessionId ?? null;
	} catch (error) {
		console.error("Error creating session:", error);
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
 * Get the transcript of a session, oldest message first.
 */
export async function getSessionMessages(
	sessionId: string,
): Promise<Message[]> {
	try {
		const response = await authedFetch(API_ENDPOINTS.SESSION_MESSAGES(sessionId), {
			method: "GET",
			...jsonRequest,
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

		return (data as RawMessage[]).map((msg) => ({
			// Django stores "user" | "bot"; the UI speaks "user" | "assistant".
			role: (msg?.role ?? "").toLowerCase() === "bot" ? "assistant" : "user",
			content: msg?.message ?? "",
			timestamp: msg?.created_at,
		}));
	} catch (error) {
		console.error("Error getting session messages:", error);
		return [];
	}
}

/**
 * List the current user's titled sessions, newest first.
 */
export async function getConversations(): Promise<Convo[]> {
	try {
		const response = await authedFetch(API_ENDPOINTS.CONVERSATIONS, {
			method: "GET",
			...jsonRequest,
		});

		if (!response.ok) {
			console.error(
				"Failed to get conversations:",
				response.status,
				response.statusText,
			);
			return [];
		}

		const data: unknown = await response.json();
		if (!Array.isArray(data)) return [];

		return (data as RawSession[]).map((conv) => ({
			id: conv.id,
			title: conv.title || "New Chat",
			created_at: new Date(conv.created_at),
		}));
	} catch (error) {
		console.error("Error getting conversations:", error);
		return [];
	}
}

/**
 * Rename a session.
 */
export async function renameConversation(
	id: string,
	title: string,
): Promise<boolean> {
	try {
		const response = await authedFetch(API_ENDPOINTS.RENAME_SESSION(id), {
			method: "PATCH",
			...jsonRequest,
			body: JSON.stringify({ title }),
		});
		return response.ok;
	} catch (error) {
		console.error("Error renaming conversation:", error);
		return false;
	}
}

/**
 * Delete a session and its messages.
 */
export async function deleteConversation(id: string): Promise<boolean> {
	try {
		const response = await authedFetch(API_ENDPOINTS.DELETE_SESSION(id), {
			method: "DELETE",
			...jsonRequest,
		});

		if (!response.ok) {
			console.error("Failed to delete conversation:", response.status);
		}
		return response.ok;
	} catch (error) {
		console.error("Error deleting conversation:", error);
		return false;
	}
}

/**
 * Endpoint management utilities (dev-only model switcher).
 */
export function getStoredEndpoint(): string {
	if (typeof window === "undefined" || typeof localStorage === "undefined")
		return API_ENDPOINTS.CHAT;
	return localStorage.getItem(ENDPOINT_STORAGE_KEY) || API_ENDPOINTS.CHAT;
}

export function setStoredEndpoint(endpoint: string): void {
	if (typeof window === "undefined" || typeof localStorage === "undefined")
		return;
	localStorage.setItem(ENDPOINT_STORAGE_KEY, endpoint);
}

export function clearStoredEndpoint(): void {
	if (typeof window === "undefined" || typeof localStorage === "undefined")
		return;
	localStorage.removeItem(ENDPOINT_STORAGE_KEY);
}
