import { marked } from "marked";
import {
	DEFAULT_PIPELINE_STEP_IDS,
	type PipelineStep,
} from "@/lib/pipelineLoader";
import type { DictionaryKey } from "@/lib/i18n";

export const configureMarked = () => {
	marked.setOptions({ breaks: true, gfm: true });
};

export const parseMarkdown = (content: string): string => {
	if (!content) return "";
	const cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "");
	const parsed = marked.parse(cleaned) as unknown;
	if (typeof (parsed as { then?: unknown })?.then === "function") {
		return cleaned;
	}
	return typeof parsed === "string" && parsed.trim().length > 0
		? parsed
		: cleaned;
};

export const buildPipelineSteps = (
	t: (key: DictionaryKey) => string,
): PipelineStep[] =>
	DEFAULT_PIPELINE_STEP_IDS.map((id) => ({
		id,
		label: t(`chat.step.${id}` as DictionaryKey),
	}));

export interface StreamResult {
	success: boolean;
	text: string;
}

// Reads a streaming Response body and re-renders markdown into `container` on
// every chunk. Returns accumulated text plus whether streaming succeeded; on
// failure the caller is expected to fall back to `streamText` using the
// response text.
export const streamFromReader = async (
	response: Response,
	container: HTMLElement,
	chatLogId = "chat-log",
): Promise<StreamResult> => {
	if (!response.body) return { success: false, text: "" };

	let accumulated = "";
	try {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		container.innerHTML = "";
		const contentDiv = document.createElement("div");
		contentDiv.className =
			"text-foreground break-words overflow-wrap-anywhere markdown-content text-[0.9375rem]";
		container.appendChild(contentDiv);

		let firstChunk = true;
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			if (firstChunk) {
				console.log("begin response stream");
				firstChunk = false;
			}

			accumulated += decoder.decode(value, { stream: true });
			contentDiv.innerHTML = parseMarkdown(accumulated);

			const chatLog = document.getElementById(chatLogId);
			chatLog?.scrollTo(0, chatLog.scrollHeight);
		}

		accumulated += decoder.decode();
		contentDiv.innerHTML = parseMarkdown(accumulated);
		return { success: true, text: accumulated };
	} catch (error) {
		console.warn("Stream reading failed, reverting to simulated stream", error);
		return { success: false, text: accumulated };
	}
};

const STREAM_STYLE_ID = "stream-style";

const ensureStreamStyles = () => {
	if (typeof document === "undefined") return;
	if (document.getElementById(STREAM_STYLE_ID)) return;
	const style = document.createElement("style");
	style.id = STREAM_STYLE_ID;
	style.innerHTML = `
    .stream-chunk { opacity: 0; transform: translateY(2px); transition: opacity 120ms ease-out, transform 120ms ease-out; }
    .stream-chunk.visible { opacity: 1; transform: translateY(0); }
  `;
	document.head.appendChild(style);
};

// Fallback: paint the text a chunk at a time with a small fade-in. Used when
// `streamFromReader` fails or when rendering precomputed text.
export const streamText = async (
	text: string,
	container: HTMLElement,
	chunkDelayMs = 60,
): Promise<HTMLElement> => {
	ensureStreamStyles();

	const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
	const streamContainer = document.createElement("div");
	streamContainer.className =
		"text-foreground  break-words overflow-wrap-anywhere markdown-content text-[0.9375rem]";
	container.appendChild(streamContainer);

	// Prefer paragraph chunks; fall back to sentences if only one paragraph.
	const paragraphs = cleaned
		.split(/\n{2,}/)
		.map((s) => s.trim())
		.filter(Boolean);

	const chunks =
		paragraphs.length > 1
			? paragraphs
			: (cleaned.match(/[^\r\n.!?]+[.!?]*(?:\s+|$)/g) ?? [cleaned])
					.map((s) => s.trim())
					.filter(Boolean);

	for (const chunk of chunks) {
		const chunkDiv = document.createElement("div");
		chunkDiv.className = "stream-chunk";
		chunkDiv.innerHTML = parseMarkdown(chunk);
		streamContainer.appendChild(chunkDiv);

		// Force reflow so the transition fires when `visible` is added next.
		void chunkDiv.offsetHeight;
		requestAnimationFrame(() => chunkDiv.classList.add("visible"));

		await new Promise((resolve) => setTimeout(resolve, chunkDelayMs));
	}

	return streamContainer;
};
