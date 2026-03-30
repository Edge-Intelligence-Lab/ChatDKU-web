import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Import the main components
import ChatPage from "@/components/ChatPage";

// Mock all external dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock("@/lib/convosNew", () => ({
  getNewSession: jest.fn(),
  getCurrentSessionId: jest.fn(),
  getStoredEndpoint: jest.fn(),
  getSessionMessages: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe("End-to-End Chat Flow Integration Tests", () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (Cookies.get as jest.Mock).mockReturnValue("true"); // terms accepted

    // Mock successful session creation
    const { getNewSession } = require("@/lib/convosNew");
    getNewSession.mockResolvedValue("test-session-123");

    // Mock successful API responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(
          "# Test Response\n\nThis is a **markdown** response with formatting.",
        ),
    });

    // Setup DOM for chat interactions
    document.body.innerHTML = '<div id="chat-log"></div>';
  });

  it("completes full chat flow from session start to message exchange", async () => {
    const user = userEvent.setup();

    render(<ChatPage />);

    // 1. Wait for session to be ready
    await waitFor(() => {
      expect(screen.getByTestId("ai-input")).not.toBeDisabled();
    });

    // 2. Verify welcome elements are shown
    expect(screen.getByTestId("welcome-banner")).toBeInTheDocument();
    expect(screen.getByTestId("new-chat-button")).not.toBeDisabled();

    // 3. Type and send a message
    const textarea = screen.getByPlaceholderText(/Type your message/);
    await user.type(textarea, "What are the office hours?");

    // Submit the message
    const submitButton =
      screen.getByRole("button", { name: /submit/i }) ||
      Array.from(screen.getAllByRole("button")).find((btn: HTMLElement) =>
        btn.textContent?.includes(""),
      );
    await user.click(submitButton);

    // 4. Verify API call was made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/chat"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("What are the office hours?"),
        }),
      );
    });

    // 5. Verify response is processed and displayed
    await waitFor(() => {
      const chatLog = document.getElementById("chat-log");
      expect(chatLog?.innerHTML).toContain("Test Response");
      expect(chatLog?.innerHTML).toContain("markdown");
    });
  });

  it("handles feedback submission after response", async () => {
    const user = userEvent.setup();

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByTestId("ai-input")).not.toBeDisabled();
    });

    // Send a message
    const textarea = screen.getByPlaceholderText(/Type your message/);
    await user.type(textarea, "Test question");

    const submitButton = Array.from(screen.getAllByRole("button")).filter(
      (btn: HTMLElement) =>
        btn.textContent?.includes("") || btn.closest("form"),
    )[0];
    await user.click(submitButton);

    // Wait for response and feedback buttons
    await waitFor(() => {
      const chatLog = document.getElementById("chat-log");
      expect(chatLog?.innerHTML).toContain("Test Response");

      // Look for feedback buttons in the response
      const feedbackYes = chatLog?.querySelector(".feedback-yes");
      const feedbackNo = chatLog?.querySelector(".feedback-no");

      expect(feedbackYes || feedbackNo).toBeTruthy();
    });
  });

  it("handles new chat creation and conversation switching", async () => {
    const user = userEvent.setup();
    const { getNewSession, getSessionMessages } = require("@/lib/convosNew");

    // Mock conversation history
    getSessionMessages.mockResolvedValue([
      { role: "user", content: "Previous question", timestamp: "2024-01-01" },
      { role: "bot", content: "Previous answer", timestamp: "2024-01-01" },
    ]);

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByTestId("new-chat-button")).toBeInTheDocument();
    });

    // Create new chat
    const newChatButton = screen.getByTestId("new-chat-button");
    await user.click(newChatButton);

    // Verify new session was created
    await waitFor(() => {
      expect(getNewSession).toHaveBeenCalledTimes(2); // Initial + new chat
    });

    // Clear chat log for new session
    const chatLog = document.getElementById("chat-log");
    expect(chatLog?.innerHTML).toBe("");
  });

  it("handles error states and recovery", async () => {
    const user = userEvent.setup();
    const { getNewSession } = require("@/lib/convosNew");

    // Mock session failure
    getNewSession.mockResolvedValueOnce(null);

    render(<ChatPage />);

    // Should show error state
    await waitFor(() => {
      expect(
        screen.getByText(/We couldn't start a chat session/),
      ).toBeInTheDocument();
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    // Mock successful retry
    getNewSession.mockResolvedValueOnce("retry-session-456");

    // Click retry
    const retryButton = screen.getByText("Try again");
    await user.click(retryButton);

    // Should recover and show chat interface
    await waitFor(() => {
      expect(screen.getByTestId("ai-input")).not.toBeDisabled();
    });
  });

  it("handles dev mode vs production mode differences", async () => {
    const user = userEvent.setup();

    // Test dev mode
    render(<ChatPage isDev={true} />);

    await waitFor(() => {
      expect(screen.getByTestId("ai-input")).not.toBeDisabled();
    });

    const textarea = screen.getByPlaceholderText(/Type your message/);
    await user.type(textarea, "test"); // Special test command

    const submitButton = Array.from(screen.getAllByRole("button")).filter(
      (btn: HTMLElement) =>
        btn.textContent?.includes("") || btn.closest("form"),
    )[0];
    await user.click(submitButton);

    // In dev mode, should use test endpoint for "test" command
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/mdtest.md");
    });

    // Cleanup and test production mode
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("Production response"),
    });

    render(<ChatPage isDev={false} />);

    await waitFor(() => {
      expect(screen.getByTestId("ai-input")).not.toBeDisabled();
    });

    const prodTextarea = screen.getByPlaceholderText(/Type your message/);
    await user.type(prodTextarea, "Normal question");

    const prodSubmitButton = Array.from(screen.getAllByRole("button")).filter(
      (btn: HTMLElement) =>
        btn.textContent?.includes("") || btn.closest("form"),
    )[0];
    await user.click(prodSubmitButton);

    // In production, should use real API endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("https://chatdku.dukekunshan.edu.cn/api/chat"),
        expect.any(Object),
      );
    });
  });

  it("handles session persistence and restoration", async () => {
    const {
      getCurrentSessionId,
      getSessionMessages,
    } = require("@/lib/convosNew");

    // Mock existing session
    getCurrentSessionId.mockReturnValue("existing-session-789");
    getSessionMessages.mockResolvedValue([
      { role: "user", content: "Hello", timestamp: "2024-01-01" },
      { role: "bot", content: "Hi there!", timestamp: "2024-01-01" },
    ]);

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByTestId("ai-input")).not.toBeDisabled();
    });

    // Should load existing conversation
    await waitFor(() => {
      expect(getSessionMessages).toHaveBeenCalledWith("existing-session-789");
    });
  });

  it("handles accessibility throughout the chat flow", async () => {
    const user = userEvent.setup();

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByTestId("ai-input")).not.toBeDisabled();
    });

    // Test keyboard navigation
    const textarea = screen.getByPlaceholderText(/Type your message/);
    textarea.focus();
    expect(textarea).toHaveFocus();

    // Type and submit using keyboard
    await user.type(textarea, "Test message{Enter}");

    // Verify submission worked
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("handles concurrent user interactions gracefully", async () => {
    const user = userEvent.setup();

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByTestId("ai-input")).not.toBeDisabled();
    });

    // Simulate rapid typing and submission
    const textarea = screen.getByPlaceholderText(/Type your message/);
    await user.type(textarea, "Quick message");

    // Submit multiple times rapidly (should be handled gracefully)
    const submitButton = Array.from(screen.getAllByRole("button")).filter(
      (btn: HTMLElement) =>
        btn.textContent?.includes("") || btn.closest("form"),
    )[0];

    await user.click(submitButton);

    // Second click should be ignored or handled gracefully
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it("handles markdown rendering in responses", async () => {
    const user = userEvent.setup();

    // Mock response with complex markdown
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(`
# Complex Response

This includes **bold**, *italic*, and \`inline code\`.

## Lists
- Item 1
- Item 2

\`\`\`javascript
const example = "code block";
\`\`\`

[Link](https://example.com)
      `),
    });

    render(<ChatPage />);

    await waitFor(() => {
      expect(screen.getByTestId("ai-input")).not.toBeDisabled();
    });

    const textarea = screen.getByPlaceholderText(/Type your message/);
    await user.type(textarea, "Show me complex markdown");

    const submitButton = Array.from(screen.getAllByRole("button")).filter(
      (btn: HTMLElement) =>
        btn.textContent?.includes("") || btn.closest("form"),
    )[0];
    await user.click(submitButton);

    // Verify markdown is rendered correctly
    await waitFor(() => {
      const chatLog = document.getElementById("chat-log");
      expect(chatLog?.innerHTML).toContain("<h1");
      expect(chatLog?.innerHTML).toContain("<strong");
      expect(chatLog?.innerHTML).toContain("<em");
      expect(chatLog?.innerHTML).toContain("<code");
      expect(chatLog?.innerHTML).toContain("<ul");
      expect(chatLog?.innerHTML).toContain("<pre");
      expect(chatLog?.innerHTML).toContain("<a");
    });
  });
});
