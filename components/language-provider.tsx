"use client";

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import Cookies from "js-cookie";
import { dictionaries, type Language, type DictionaryKey } from "@/lib/i18n";

type LanguageContextType = {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: DictionaryKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
	const [language, setLanguageState] = useState<Language>("en");

	useEffect(() => {
		const saved = Cookies.get("chatdku_lang") as Language | undefined;
		if (saved && (saved === "en" || saved === "zh")) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from cookie on mount
			setLanguageState(saved);
		}
	}, []);

	const setLanguage = useCallback((lang: Language) => {
		setLanguageState(lang);
		Cookies.set("chatdku_lang", lang, { expires: 365 });
		document.documentElement.lang = lang;
	}, []);

	const t = useCallback(
		(key: DictionaryKey): string => {
			return dictionaries[language][key] ?? key;
		},
		[language],
	);

	return (
		<LanguageContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
