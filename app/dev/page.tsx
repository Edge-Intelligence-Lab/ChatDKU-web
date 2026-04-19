"use client";

import { ChatPage } from "@/components/chat-page";

const DEV_ARTIFICIAL_DELAY_MS = 40000;

export default function Dev() {
	return (
		<ChatPage
			isDev
			requireToken={false}
			artificialDelayMs={DEV_ARTIFICIAL_DELAY_MS}
			disclaimerKey={null}
			disclaimerText="This is an unreleased testing site for development purposes only."
		/>
	);
}
