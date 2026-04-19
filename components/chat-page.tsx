"use client";

import {
	useCallback,
	useEffect,
	useState,
	type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import { AIInput } from "@/components/ui/ai-input";
import { Navbar } from "@/components/navbar";
import { PromptRecs } from "@/components/prompt-recs";
import WelcomeBanner from "@/components/welcome-banner";
import Side from "@/components/side";
import CampusMap from "@/components/campus-map";
import { useLanguage } from "@/components/language-provider";

import { getStoredEndpoint } from "@/lib/convos";
import {
	getPipelineLoaderHTML,
	startPipelineLoader,
} from "@/lib/pipelineLoader";
import {
	buildPipelineSteps,
	configureMarked,
	parseMarkdown,
	streamFromReader,
	streamText,
} from "@/lib/chat-stream";

export interface ChatPageProps {
	/** Enables the artificial pipeline-loader delay and wider prompts. */
	isDev?: boolean;
	/** Delay before showing the response (dev only). */
	artificialDelayMs?: number;
	/** Delay between fake-stream chunks when real streaming fails. */
	chunkDelayMs?: number;
	/** If set, enables the campus-map side view. Only used in main app. */
	enableCampusMap?: boolean;
	/** Require chatdku_token cookie in addition to terms acceptance. */
	requireToken?: boolean;
	/** Text rendered under the input once the user starts chatting. */
	disclaimerKey?: "chat.disclaimer" | null;
	/** Literal disclaimer override (for the dev page). */
	disclaimerText?: string;
}

export function ChatPage({
	isDev = false,
	artificialDelayMs = 0,
	chunkDelayMs,
	enableCampusMap = false,
	requireToken = true,
	disclaimerKey = "chat.disclaimer",
	disclaimerText,
}: ChatPageProps) {
	const [showStarter, setShowStarter] = useState(true);
	const [isChatboxCentered, setIsChatboxCentered] = useState(true);
	const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
	const [thinkingMode, setThinkingMode] = useState(false);
	const [searchMode, setSearchMode] = useState("");
	const [inputValue, setInputValue] = useState("");
	const [apiEndpoint, setApiEndpoint] = useState(getStoredEndpoint());
	const [activeView, setActiveView] = useState<"chat" | "campus">("chat");
	const [activeReference, setActiveReference] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);

	const router = useRouter();
	const { t } = useLanguage();

	const resolvedChunkDelay = chunkDelayMs ?? (isDev ? 90 : 60);

	useEffect(() => {
		configureMarked();
		const termsAccepted = Cookies.get("terms_accepted");
		const token = Cookies.get("chatdku_token");
		if (
			!termsAccepted ||
			(requireToken && !token && process.env.NODE_ENV !== "development")
		) {
			router.push("/login");
		}
	}, [router, requireToken]);

	const handleFeedback = useCallback(
		async (userInput: string, answer: string, reason: string) => {
			try {
				await fetch("/api/feedback", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userInput,
						botAnswer: answer,
						feedbackReason: reason,
					}),
				});
			} catch (error) {
				console.error("Failed to save feedback:", error);
			}
		},
		[],
	);

	// NOTE: legacy imperative DOM rendering preserved from the original pages.
	// Chat messages are built via innerHTML rather than React because streaming
	// + markdown + feedback-modal wiring was written that way. A future refactor
	// should render these as proper React components.
	const addMessageToChat = useCallback(
		(
			role: "user" | "bot",
			content: string,
			className: string,
			shouldStream = false,
		) => {
			const chatLog = document.getElementById("chat-log");
			const messageElement = document.createElement("div");
			const isUser = role === "user";
			messageElement.className = `flex ${isUser ? "justify-end" : ""} w-full`;

			const userMaxWidth = isDev
				? "items-end max-w-[85%] sm:max-w-[80%]"
				: "items-end max-w-[95%] sm:max-w-[85%]";

			if (isUser || !shouldStream) {
				const isRawHtml =
					typeof content === "string" && content.startsWith("<");
				const sanitized = content
					? isRawHtml
						? content
						: parseMarkdown(content).trim()
					: "";

				messageElement.innerHTML = `
        <div class="flex flex-col ${isUser ? userMaxWidth : "items-start w-full sm:max-w-[85%]"}">
          <div class="flex flex-col ${isUser ? "lg:flex-row-reverse" : "lg:flex-row"} gap-3 px-4 py-2 ${className} rounded-3xl w-full overflow-hidden">
            ${
							isUser
								? ""
								: '<div class="flex-shrink-0"><div class="w-8 h-8 rounded-full bg-transparent flex items-center justify-center"><img src="/logos/new_logo.svg" class="block dark:hidden p-1.5" alt="Logo"/><img src="/logos/new_logo.svg" class="hidden dark:block p-1.5" alt="Logo"/></div></div>'
						}
            <div class="${isUser ? "text-right" : "text-left"} overflow-hidden">
              <div class="text-foreground break-words overflow-wrap-anywhere markdown-content ${!isUser ? "text-[0.9375rem]" : ""}">${sanitized}</div>
            </div>
          </div>
        </div>
      `;
				chatLog?.appendChild(messageElement);
				chatLog?.scrollTo(0, chatLog.scrollHeight);
				return messageElement.querySelector(".flex.flex-col");
			}

			messageElement.innerHTML = `
        <div class="flex flex-col items-start w-full sm:max-w-[85%]">
          <div class="flex flex-col lg:flex-row gap-3 px-4 py-2 ${className} rounded-3xl w-full overflow-hidden">
            <div class="flex-shrink-0"><div class="w-8 h-8 rounded-full bg-transparent flex items-center justify-center"><img src="/logos/new_logo.svg" class="block dark:hidden p-1.5" alt="Logo"/><img src="/logos/new_logo.svg" class="hidden dark:block p-1.5" alt="Logo"/></div></div>
            <div class="text-left overflow-hidden" id="stream-container">
            </div>
          </div>
        </div>
      `;
			chatLog?.appendChild(messageElement);
			chatLog?.scrollTo(0, chatLog.scrollHeight);

			const streamContainer = messageElement.querySelector(
				"#stream-container",
			) as HTMLElement | null;
			if (streamContainer) {
				streamText(content, streamContainer, resolvedChunkDelay);
			}

			return messageElement.querySelector(".flex.flex-col");
		},
		[isDev, resolvedChunkDelay],
	);

	const addBotPlaceholder = useCallback(
		(html: string, className: string) => {
			const chatLog = document.getElementById("chat-log");
			const messageElement = document.createElement("div");
			messageElement.className = "flex w-full";
			messageElement.innerHTML = `
        <div class="flex flex-col items-start w-full sm:max-w-[85%]">
          <div class="flex flex-col lg:flex-row gap-3 px-4 py-2 ${className} rounded-3xl w-full overflow-hidden">
            <div class="flex-shrink-0"><div class="w-8 h-8 rounded-full bg-transparent flex items-center justify-center"><img src="/logos/new_logo.svg" class="block dark:hidden p-1.5" alt="Logo"/><img src="/logos/new_logo.svg" class="hidden dark:block p-1.5" alt="Logo"/></div></div>
            <div class="text-left overflow-hidden">
              ${html}
            </div>
          </div>
        </div>
      `;
			chatLog?.appendChild(messageElement);
			chatLog?.scrollTo(0, chatLog.scrollHeight);
			return messageElement.querySelector(".flex.flex-col");
		},
		[],
	);

	const attachFeedbackPrompt = useCallback(
		(messageDiv: Element, userInput: string, botAnswer: string) => {
			const feedbackDiv = document.createElement("div");
			feedbackDiv.className = "ml-4 mb-2";
			feedbackDiv.innerHTML = `
        <div class="flex items-center gap-2 text-left">
          <span class="text-sm text-muted-foreground">${t("chat.feedbackQuestion")}</span>
          <button class="feedback-yes px-2 py-1 text-sm rounded-md bg-secondary/50 hover:bg-secondary">${t("chat.feedbackYes")}</button>
          <button class="feedback-no px-2 py-1 text-sm rounded-md bg-secondary/50 transition-all duration-300 hover:bg-red-600 hover:text-white">${t("chat.feedbackNo")}</button>
        </div>
      `;

			const yesButton = feedbackDiv.querySelector(".feedback-yes");
			const noButton = feedbackDiv.querySelector(".feedback-no");

			yesButton?.addEventListener("click", () => {
				handleFeedback(userInput, botAnswer, "helpful");
				feedbackDiv.innerHTML = `<span class="text-sm text-muted-foreground">${t("chat.feedbackThanks")}</span>`;
			});

			noButton?.addEventListener("click", () => {
				feedbackDiv.innerHTML = `
          <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
            <div class="fixed inset-0 flex items-center justify-center">
              <div class="dialog bg-background border shadow-lg rounded-lg w-[90%] max-w-md p-6">
                <h3 class="text-lg font-semibold mb-4">${t("chat.feedbackWhyTitle")}</h3>
                <div class="feedback-options space-y-2" id="reason-options">
                  <button class="reason-btn w-full text-left px-3 py-2 rounded-md border hover:bg-accent text-foreground" data-reason="not_correct">${t("chat.feedbackNotCorrect")}</button>
                  <button class="reason-btn w-full text-left px-3 py-2 rounded-md border hover:bg-accent text-foreground" data-reason="not_clear">${t("chat.feedbackNotClear")}</button>
                  <button class="reason-btn w-full text-left px-3 py-2 rounded-md border hover:bg-accent text-foreground" data-reason="not_relevant">${t("chat.feedbackNotRelevant")}</button>
                  <button class="reason-btn w-full text-left px-3 py-2 rounded-md border hover:bg-accent text-foreground" data-reason="other">${t("chat.feedbackOther")}</button>
                </div>
                <textarea id="custom-reason" class="w-full mt-4 p-2 rounded-md border bg-background text-foreground hidden" rows="5" placeholder="${t("chat.feedbackCustomPlaceholder")}"></textarea>
                <div class="flex justify-end mt-6 space-x-2">
                  <button id="submit-feedback" class="btn px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90">${t("chat.feedbackSubmit")}</button>
                  <button id="cancel-feedback" class="btn px-4 py-2 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground">${t("chat.feedbackCancel")}</button>
                </div>
              </div>
            </div>
          </div>
        `;

				const optionButtons = feedbackDiv.querySelectorAll(".reason-btn");
				const customReason = feedbackDiv.querySelector(
					"#custom-reason",
				) as HTMLTextAreaElement;
				const submitBtn = feedbackDiv.querySelector("#submit-feedback");
				const cancelBtn = feedbackDiv.querySelector("#cancel-feedback");

				let selectedReason: string | null = null;

				optionButtons.forEach((btn) => {
					btn.addEventListener("click", () => {
						selectedReason = (btn as HTMLElement).dataset.reason || null;
						optionButtons.forEach((b) =>
							b.classList.remove("bg-secondary", "text-white"),
						);
						btn.classList.add("bg-secondary", "text-black");

						if (selectedReason === "other") {
							customReason.classList.remove("hidden");
						} else {
							customReason.classList.add("hidden");
						}
					});
				});

				submitBtn?.addEventListener("click", () => {
					if (!selectedReason) return;
					const reasonToSend =
						selectedReason === "other"
							? customReason.value.trim()
							: selectedReason;

					if (selectedReason === "other" && !reasonToSend) {
						customReason.classList.add("border-destructive");
						customReason.placeholder = t("chat.feedbackCustomRequired");
						return;
					}

					handleFeedback(userInput, botAnswer, reasonToSend);
					feedbackDiv.innerHTML = `<span class="text-sm text-muted-foreground">${t("chat.feedbackThanks")}</span>`;
				});

				cancelBtn?.addEventListener("click", () => {
					feedbackDiv.innerHTML = `<span class="text-sm text-muted-foreground">${t("chat.feedbackCanceled")}</span>`;
				});
			});

			messageDiv.appendChild(feedbackDiv);
		},
		[t, handleFeedback],
	);

	const handleSubmit = useCallback(
		async (value: string) => {
			if (!value.trim() || isSending) return;
			setIsSending(true);

			let finalValue = value.trim();
			if (activeReference) {
				finalValue = `${activeReference}, ${finalValue}`;
				setActiveReference(null);
			}

			setShowStarter(false);
			setIsChatboxCentered(false);

			addMessageToChat(
				"user",
				finalValue,
				"bg-muted/50 dark:bg-muted/50 text-sm",
			);

			const pipelineSteps = buildPipelineSteps(t);
			const botMessage = addBotPlaceholder(
				getPipelineLoaderHTML(pipelineSteps[0].label),
				"text-sm",
			);
			const pipelineLoader = startPipelineLoader(botMessage, {
				steps: pipelineSteps,
			});

			try {
				const fetchChat = () => {
					if (finalValue.toLowerCase() === "test") {
						return fetch("/mdtest.md");
					}
					return fetch("/api/chat", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							messages: [{ role: "user", content: finalValue }],
							history: chatHistory,
						}),
					});
				};

				setChatHistory((prev) => [...prev, ["user", finalValue]]);

				// Dev: stall briefly so the pipeline loader is actually visible
				// against fast local mocks.
				const [response] = await Promise.all([
					fetchChat(),
					artificialDelayMs > 0
						? new Promise((r) => setTimeout(r, artificialDelayMs))
						: Promise.resolve(),
				]);

				if (!response.ok) throw new Error("Failed to fetch response");

				await pipelineLoader.dismiss();
				botMessage?.remove();

				const messageDiv = addMessageToChat("bot", "", "text-sm", true);
				const streamContainer =
					messageDiv?.querySelector("#stream-container");
				if (!streamContainer) {
					throw new Error("Failed to create stream container");
				}

				const streamResult = await streamFromReader(
					response,
					streamContainer as HTMLElement,
				);

				let data = streamResult.text;
				if (!streamResult.success) {
					if (!data) {
						try {
							data = await response.text();
						} catch {
							data = "Error: Failed to read response";
						}
					}
					(streamContainer as HTMLElement).innerHTML = "";
					await streamText(
						data,
						streamContainer as HTMLElement,
						resolvedChunkDelay,
					);
				}

				setChatHistory((prev) => [...prev, ["bot", data]]);

				if (messageDiv) {
					attachFeedbackPrompt(messageDiv, finalValue, data);
				}
			} catch (error) {
				await pipelineLoader.dismiss();
				botMessage?.remove();
				addMessageToChat(
					"bot",
					`Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`,
					"bg-destructive/10 dark:bg-destructive/20",
				);
			} finally {
				setIsSending(false);
			}
		},
		[
			isSending,
			activeReference,
			addMessageToChat,
			addBotPlaceholder,
			attachFeedbackPrompt,
			t,
			chatHistory,
			artificialDelayMs,
			resolvedChunkDelay,
		],
	);

	const resetChat = () => {
		setActiveView("chat");
		setShowStarter(true);
		setIsChatboxCentered(true);
		setChatHistory([]);
		setInputValue("");
		const chatLog = document.getElementById("chat-log");
		if (chatLog) chatLog.innerHTML = "";
		const aiInput = document.getElementById("ai-input") as HTMLTextAreaElement;
		if (aiInput) aiInput.value = "";
	};

	return (
		<>
			<Side
				onCampusMap={() => {
					if (!enableCampusMap) return;
					setActiveView("campus");
					setShowStarter(false);
					setIsChatboxCentered(false);
				}}
				onEndpointChange={setApiEndpoint}
				currentEndpoint={apiEndpoint}
				onNewChat={resetChat}
				onConversationSelect={() => {}}
			/>
			<div className="flex flex-col min-h-screen relative selection:bg-zinc-800 selection:text-white dark:selection:bg-white dark:selection:text-black">
				<header className="sticky top-0 z-20 w-full">
					<Navbar />
				</header>

				<main className="flex-1 w-full flex flex-col items-center pt-16 relative">
					{activeView === "chat" && (
						<div
							id="chat-log"
							className="w-full max-w-3xl mx-auto space-y-4 p-4 pb-42 overflow-y-auto"
						></div>
					)}
					{enableCampusMap && activeView === "campus" && (
						<CampusMap
							onAsk={(reference) => {
								setActiveReference(reference);
								setActiveView("chat");
								setIsChatboxCentered(false);
								setInputValue("");
							}}
						/>
					)}
				</main>

				{activeView === "chat" && (
					<div
						className={`w-full max-w-[95vw] p-2 pt-0 transition-all duration-300 ${
							isChatboxCentered
								? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
								: "fixed bottom-0 left-1/2 -translate-x-1/2 rounded-t-3xl backdrop-blur-md bg-gradient-to-b from-transparent to-background md:backdrop-blur-none z-10"
						}`}
					>
						{showStarter && (
							<div className="w-full flex justify-center">
								<div className="flex flex-col items-center p-4 w-4/5 md:max-w-1/2 sm:max-w-4/5">
									<WelcomeBanner />
								</div>
							</div>
						)}
						<div>
							<AIInput
								thinkingMode={thinkingMode}
								onThinkingModeChange={setThinkingMode}
								searchMode={searchMode}
								onSearchModeChange={(value: SetStateAction<string>) =>
									setSearchMode(value)
								}
								onInputChange={setInputValue}
								onEndpointChange={setApiEndpoint}
								activeReference={activeReference}
								onClearReference={() => setActiveReference(null)}
								loading={isSending}
								onSubmit={handleSubmit}
							/>
							{isChatboxCentered && (
								<div
									className={`transition-all duration-300 ${inputValue ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 max-h-96"}`}
								>
									<PromptRecs
										onPromptSelect={(prompt) => {
											const aiInput = document.getElementById(
												"ai-input",
											) as HTMLTextAreaElement | null;
											if (!aiInput) return;
											aiInput.value = prompt;
											aiInput.dispatchEvent(
												new Event("input", { bubbles: true }),
											);
											aiInput.dispatchEvent(
												new KeyboardEvent("keydown", {
													key: "Enter",
													code: "Enter",
													bubbles: true,
													cancelable: true,
													shiftKey: false,
												}),
											);
										}}
									/>
								</div>
							)}
						</div>
						{!isChatboxCentered && (disclaimerKey || disclaimerText) && (
							<p className="text-center text-[11px]/3 pb-1 sm:py-0 sm:leading-1 leading-3 tracking-tight text-muted-foreground drop-shadow-background drop-shadow-xl">
								{disclaimerText ?? (disclaimerKey ? t(disclaimerKey) : "")}
							</p>
						)}
					</div>
				)}
			</div>
		</>
	);
}

export default ChatPage;
