import { NextResponse } from "next/server";

const BACKEND_BASE = "https://chatdku.dukekunshan.edu.cn/public";
const AUTH_URL = `${BACKEND_BASE}/auth/get-token`;
const CHAT_URL = `${BACKEND_BASE}/api/chat`;

// Cached JWT token
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getJwt(): Promise<string> {
	// Return cached token if still valid (with 30s buffer)
	if (cachedToken && Date.now() < tokenExpiresAt - 30_000) {
		return cachedToken;
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET environment variable is not set");
	}

	const response = await fetch(AUTH_URL, {
		method: "POST",
		headers: {
			"X-Secret": secret,
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to get JWT token: ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	const token = data.token || data.access_token;

	if (!token) {
		throw new Error("No token returned from auth endpoint");
	}

	cachedToken = token;

	// Try to extract expiry from JWT payload; default to 55 minutes
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (payload.exp) {
			tokenExpiresAt = payload.exp * 1000;
		} else {
			tokenExpiresAt = Date.now() + 55 * 60 * 1000;
		}
	} catch {
		tokenExpiresAt = Date.now() + 55 * 60 * 1000;
	}

	return token;
}

// Mock responses for dev mode
const MOCK_RESPONSES = [
	(msg: string) =>
		`**Mock response** to: *"${msg}"*\n\nThis is the ChatDKU development mock API. Set \`MOCK_API=false\` in \`.env.local\` to proxy to the backend.`,
	(msg: string) =>
		`You asked: *"${msg}"*\n\n**This is a mock response** — the chat UI and streaming animation are working correctly.`,
	(_msg: string) =>
		`## Mock API Response\n\nThe ChatDKU interface is functioning correctly in local development mode.\n\n- Session management: ✓\n- Chat submission: ✓\n- Response rendering: ✓\n- Feedback buttons: ✓`,
];

export async function POST(request: Request) {
	const body = await request.json();

	// Mock by default in dev; set MOCK_API=false in .env.local to proxy to the backend
	const useMock =
		process.env.NODE_ENV === "development" && process.env.MOCK_API !== "false";
	if (useMock) {
		const userMessage = body?.messages?.[0]?.content ?? "your question";
		const pick =
			MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
		const fullText = pick(userMessage);
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				const words = fullText.split(/(\s+)/);
				for (const word of words) {
					controller.enqueue(encoder.encode(word));
					await new Promise((resolve) => setTimeout(resolve, 30));
				}
				controller.close();
			},
		});
		return new NextResponse(stream, {
			headers: { "Content-Type": "text/plain; charset=utf-8" },
		});
	}

	// Production: proxy to backend with JWT auth
	try {
		const token = await getJwt();

		// Transform request to match backend ChatRequest schema:
		// { messages: List[dict], history: List[tuple] }
		const messages = body.messages || [];
		const history: [string, string][] = (body.history || []).map(
			(entry: { role?: string; content?: string } | [string, string]) => {
				if (Array.isArray(entry)) return entry;
				return [entry.role || "user", entry.content || ""];
			},
		);

		const backendResponse = await fetch(CHAT_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				messages,
				history,
			}),
		});

		if (backendResponse.status === 401 || backendResponse.status === 403) {
			// Token expired or invalid — clear cache and retry once
			cachedToken = null;
			tokenExpiresAt = 0;
			const freshToken = await getJwt();

			const retryResponse = await fetch(CHAT_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${freshToken}`,
				},
				body: JSON.stringify({
					messages,
					history,
				}),
			});

			if (!retryResponse.ok) {
				return new NextResponse(`Backend error: ${retryResponse.statusText}`, {
					status: retryResponse.status,
				});
			}

			return new NextResponse(retryResponse.body, {
				headers: { "Content-Type": "text/plain; charset=utf-8" },
			});
		}

		if (!backendResponse.ok) {
			return new NextResponse(`Backend error: ${backendResponse.statusText}`, {
				status: backendResponse.status,
			});
		}

		return new NextResponse(backendResponse.body, {
			headers: { "Content-Type": "text/plain; charset=utf-8" },
		});
	} catch (error) {
		console.error("Chat proxy error:", error);
		return new NextResponse(
			`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			{ status: 500 },
		);
	}
}
