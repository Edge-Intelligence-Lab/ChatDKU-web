"use client";

import { useMemo } from "react";
import Image from "next/image";
import { parseMarkdown } from "@/lib/chat-stream";
import { cn } from "@/lib/utils";

export type MessageRole = "user" | "bot";

export type MessageVariant = "default" | "error";

export interface ChatMessageProps {
	role: MessageRole;
	content: string;
	variant?: MessageVariant;
	/** When true, the bot message is wider. Used only on the dev page. */
	isDev?: boolean;
	children?: React.ReactNode;
}

export function ChatMessage({
	role,
	content,
	variant = "default",
	isDev = false,
	children,
}: ChatMessageProps) {
	const isUser = role === "user";

	const html = useMemo(() => {
		if (!content) return "";
		if (content.startsWith("<")) return content; // raw html passthrough
		return parseMarkdown(content).trim();
	}, [content]);

	const userMaxWidth = isDev
		? "items-end max-w-[85%] sm:max-w-[80%]"
		: "items-end max-w-[95%] sm:max-w-[85%]";

	const bubbleBg =
		variant === "error"
			? "bg-destructive/10 dark:bg-destructive/20"
			: isUser
				? "bg-muted/50 dark:bg-muted/50"
				: "";

	return (
		<div className={cn("flex w-full", isUser && "justify-end")}>
			<div
				className={cn(
					"flex flex-col",
					isUser ? userMaxWidth : "items-start w-full sm:max-w-[85%]",
				)}
			>
				<div
					className={cn(
						"flex flex-col lg:flex-row gap-3 px-4 py-2 rounded-3xl w-full overflow-hidden text-sm",
						bubbleBg,
						isUser && "lg:flex-row-reverse",
					)}
				>
					{!isUser && (
						<div className="flex-shrink-0">
							<div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center">
								<Image
									src="/logos/new_logo.svg"
									alt="ChatDKU"
									width={32}
									height={32}
									className="p-1.5"
								/>
							</div>
						</div>
					)}
					<div
						className={cn(
							"overflow-hidden",
							isUser ? "text-right" : "text-left",
						)}
					>
						<div
							className={cn(
								"text-foreground break-words overflow-wrap-anywhere markdown-content",
								!isUser && "text-[0.9375rem]",
							)}
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</div>
				</div>
				{children}
			</div>
		</div>
	);
}
