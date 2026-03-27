const isDevMode = process.env.NODE_ENV === "development";
const apiBaseUrl = isDevMode
	? "http://localhost:3000"
	: "https://chatdku.dukekunshan.edu.cn/public"; // Port is for the public-facing server.

export const API_ENDPOINTS = {
	USER: `${apiBaseUrl}/user`,
	CHAT_DEFAULT: `${apiBaseUrl}/chat`,
	CHAT_DEV1: `${apiBaseUrl}/dev/ant/chat`,
	CHAT_DEV2: `${apiBaseUrl}/dev/qwen/chat`,
	FILE_UPLOAD: `${apiBaseUrl}/user_files`,
	DICTATION_WS: isDevMode
		? "ws://localhost:8007"
		: "wss://chatdku.dukekunshan.edu.cn:8007",
	NEW_SESSION: `${apiBaseUrl}/api/get_session`,
	CONVERSATIONS: `${apiBaseUrl}/api/c/`,
	SESSION_MESSAGES: (sessionId: string) =>
		`${apiBaseUrl}/api/c/${sessionId}/messages`,
} as const;

export const CHAT_MODELS = [
	{
		id: "default",
		name: "Default Model",
		endpoint: API_ENDPOINTS.CHAT_DEFAULT,
	},
	{ id: "ant", name: "Ant Model", endpoint: API_ENDPOINTS.CHAT_DEV1 },
	{ id: "qwen", name: "Qwen Model", endpoint: API_ENDPOINTS.CHAT_DEV2 },
] as const;
