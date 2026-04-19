"use client";

import { useLanguage } from "@/components/language-provider";

export default function WelcomeBanner() {
	const { t } = useLanguage();
	return (
		<h1 className="text-xl md:text-2xl lg:text-3xl">{t("chat.welcome")}</h1>
	);
}
