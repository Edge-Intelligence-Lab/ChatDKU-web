"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Reason = "not_correct" | "not_clear" | "not_relevant" | "other";

const REASON_KEYS = {
	not_correct: "chat.feedbackNotCorrect",
	not_clear: "chat.feedbackNotClear",
	not_relevant: "chat.feedbackNotRelevant",
	other: "chat.feedbackOther",
} as const;

export type FeedbackReason = "helpful" | string;

export interface FeedbackPromptProps {
	onSubmit: (reason: FeedbackReason) => void;
}

type Status =
	| { kind: "asking" }
	| { kind: "choosing" }
	| { kind: "submitted" }
	| { kind: "canceled" };

export function FeedbackPrompt({ onSubmit }: FeedbackPromptProps) {
	const { t } = useLanguage();
	const [status, setStatus] = useState<Status>({ kind: "asking" });
	const [selectedReason, setSelectedReason] = useState<Reason | null>(null);
	const [customReason, setCustomReason] = useState("");
	const [customInvalid, setCustomInvalid] = useState(false);

	if (status.kind === "submitted") {
		return (
			<div className="ml-4 mb-2">
				<span className="text-sm text-muted-foreground">
					{t("chat.feedbackThanks")}
				</span>
			</div>
		);
	}

	if (status.kind === "canceled") {
		return (
			<div className="ml-4 mb-2">
				<span className="text-sm text-muted-foreground">
					{t("chat.feedbackCanceled")}
				</span>
			</div>
		);
	}

	const submitChoice = () => {
		if (!selectedReason) return;
		const reason =
			selectedReason === "other" ? customReason.trim() : selectedReason;
		if (selectedReason === "other" && !reason) {
			setCustomInvalid(true);
			return;
		}
		onSubmit(reason);
		setStatus({ kind: "submitted" });
	};

	return (
		<div className="ml-4 mb-2">
			<div className="flex items-center gap-2 text-left">
				<span className="text-sm text-muted-foreground">
					{t("chat.feedbackQuestion")}
				</span>
				<button
					type="button"
					onClick={() => {
						onSubmit("helpful");
						setStatus({ kind: "submitted" });
					}}
					className="px-2 py-1 text-sm rounded-md bg-secondary/50 hover:bg-secondary"
				>
					{t("chat.feedbackYes")}
				</button>
				<button
					type="button"
					onClick={() => setStatus({ kind: "choosing" })}
					className="px-2 py-1 text-sm rounded-md bg-secondary/50 transition-all duration-300 hover:bg-red-600 hover:text-white"
				>
					{t("chat.feedbackNo")}
				</button>
			</div>

			<Dialog
				open={status.kind === "choosing"}
				onOpenChange={(open) => {
					if (!open) setStatus({ kind: "canceled" });
				}}
			>
				<DialogContent className="w-[90%] max-w-md">
					<DialogHeader>
						<DialogTitle>{t("chat.feedbackWhyTitle")}</DialogTitle>
					</DialogHeader>

					<div className="space-y-2">
						{(Object.keys(REASON_KEYS) as Reason[]).map((reason) => (
							<button
								key={reason}
								type="button"
								onClick={() => {
									setSelectedReason(reason);
									setCustomInvalid(false);
								}}
								className={cn(
									"w-full text-left px-3 py-2 rounded-md border hover:bg-accent text-foreground",
									selectedReason === reason && "bg-secondary text-black",
								)}
							>
								{t(REASON_KEYS[reason])}
							</button>
						))}
					</div>

					{selectedReason === "other" && (
						<textarea
							className={cn(
								"w-full mt-2 p-2 rounded-md border bg-background text-foreground",
								customInvalid && "border-destructive",
							)}
							rows={5}
							placeholder={
								customInvalid
									? t("chat.feedbackCustomRequired")
									: t("chat.feedbackCustomPlaceholder")
							}
							value={customReason}
							onChange={(e) => {
								setCustomReason(e.target.value);
								if (customInvalid && e.target.value.trim()) {
									setCustomInvalid(false);
								}
							}}
						/>
					)}

					<DialogFooter>
						<Button onClick={submitChoice} disabled={!selectedReason}>
							{t("chat.feedbackSubmit")}
						</Button>
						<Button
							variant="secondary"
							onClick={() => setStatus({ kind: "canceled" })}
							className="hover:bg-destructive hover:text-destructive-foreground"
						>
							{t("chat.feedbackCancel")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
