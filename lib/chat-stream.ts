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

// Reads a streaming Response body, invoking `onProgress` with the accumulated
// text each time a chunk arrives. Returns accumulated text plus whether
// streaming succeeded; on failure the caller is expected to fall back to
// `streamText` using the response text.
export const streamFromReader = async (
	response: Response,
	onProgress: (accumulated: string) => void,
): Promise<StreamResult> => {
	if (!response.body) return { success: false, text: "" };

	let accumulated = "";
	try {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		let firstChunk = true;
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			if (firstChunk) {
				console.log("begin response stream");
				firstChunk = false;
			}

			accumulated += decoder.decode(value, { stream: true });
			onProgress(accumulated);
		}

		accumulated += decoder.decode();
		onProgress(accumulated);
		return { success: true, text: accumulated };
	} catch (error) {
		console.warn("Stream reading failed, reverting to simulated stream", error);
		return { success: false, text: accumulated };
	}
};

// Fallback for when real streaming fails: paints `text` in paragraph- or
// sentence-sized chunks with a small delay between each, invoking `onProgress`
// with the accumulated text so callers can re-render as it grows.
export const streamText = async (
	text: string,
	onProgress: (accumulated: string) => void,
	chunkDelayMs = 60,
): Promise<void> => {
	const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");

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

	let accumulated = "";
	for (const chunk of chunks) {
		accumulated = accumulated ? `${accumulated}\n\n${chunk}` : chunk;
		onProgress(accumulated);
		await new Promise((resolve) => setTimeout(resolve, chunkDelayMs));
	}
};
