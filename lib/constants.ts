const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
const apiBaseUrl = isDevMode ? process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000' : 'https://chatdku.dukekunshan.edu.cn';

export const API_ENDPOINTS = {
    USER: `${apiBaseUrl}/user`,
    CHAT_DEFAULT: `${apiBaseUrl}/api/chat`,
    CHAT_DEV1: `${apiBaseUrl}/dev/ant/chat`,
    CHAT_DEV2: `${apiBaseUrl}/dev/qwen/chat`,
    FILE_UPLOAD: `${apiBaseUrl}/user_files`,
    DICTATION_WS: isDevMode ? 'ws://localhost:8007' : 'wss://chatdku.dukekunshan.edu.cn:8007',
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
  
  // TODO: Move all old sample questions here below:
  export const EXAMPLE_QUESTIONS = [
    { emoji: "🔬", question: "Explain quantum computing principles" },
    { emoji: "📚", question: "Summarize recent AI research papers" },
    { emoji: "💡", question: "Help me brainstorm research ideas" },
    { emoji: "📊", question: "Analyze this dataset for patterns" },
    { emoji: "🧮", question: "Solve complex mathematical problems" },
    { emoji: "🌍", question: "Discuss climate change impacts" },
  ] as const;
  