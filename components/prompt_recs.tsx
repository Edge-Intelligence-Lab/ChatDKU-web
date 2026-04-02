"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import {
	promptsEn,
	promptsZh,
	pickRandomPrompts,
} from "@/lib/prompt-recommendations";

interface PromptRecsProps {
	onPromptSelect: (prompt: string) => void;
	onSubmit?: () => void;
}

export function PromptRecs({ onPromptSelect, onSubmit }: PromptRecsProps) {
	const { language } = useLanguage();
	const [selected, setSelected] = useState<{ icon: string; text: string }[]>(
		[],
	);

	useEffect(() => {
		const prompts = language === "zh" ? promptsZh : promptsEn;
		setSelected(pickRandomPrompts(prompts, 5));
	}, [language]);

	const handlePromptClick = (promptText: string) => {
		onPromptSelect(promptText);

		setTimeout(() => {
			const inputs = document.querySelectorAll('input[type="text"], textarea');

			if (inputs.length > 0) {
				const lastInput = inputs[inputs.length - 1] as HTMLElement;
				lastInput.focus();

				const enterEvent = new KeyboardEvent("keydown", {
					bubbles: true,
					cancelable: true,
					key: "Enter",
					code: "Enter",
					keyCode: 13,
					which: 13,
				});

				lastInput.dispatchEvent(enterEvent);
			}

			const sendButton = document.querySelector(
				'button[aria-label="Send message"], button:has(svg[data-icon="paper-plane"]), button:has(svg[data-testid="send-icon"])',
			);
			if (sendButton instanceof HTMLElement) {
				sendButton.click();
			}

			if (onSubmit) {
				onSubmit();
			}
		}, 10);
	};

	return (
		<div className="space-x-1 space-y-1 pt-2 text-center justify-center max-w-4xl mx-auto">
			{selected.map((prompt, i) => (
				<Button
					key={`${i}-${prompt.text}`}
					variant="outline"
					className="inline-flex flex-row items-center my-auto text-left shadow-none gap-2 px-4 py-2 text-xs rounded-3xl transition-colors max-w-[280px] h-auto whitespace-normal"
					onClick={() => handlePromptClick(prompt.text)}
				>
					<span className="text-lg flex-shrink-0">{prompt.icon}</span>
					<span className="text-left break-words">{prompt.text}</span>
				</Button>
			))}
		</div>
	);
}
