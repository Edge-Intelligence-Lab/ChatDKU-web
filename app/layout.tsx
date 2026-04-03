import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
	variable: "--font-inter",
	display: "swap",
	subsets: ["latin"],
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

export const metadata: Metadata = {
	title: "ChatDKU",
	description: "Your AI assistant for Duke Kunshan University.",
	metadataBase: new URL("https://chatdku.com"),
	icons: {
		icon: "/favicon-small.png",
		apple: "/favicon-small.png",
	},
	openGraph: {
		title: "ChatDKU",
		description: "Your AI assistant for Duke Kunshan University.",
		url: "https://chatdku.com",
		siteName: "ChatDKU",
		images: [
			{
				url: "/og.png",
				width: 1200,
				height: 630,
				alt: "ChatDKU",
			},
		],
		locale: "en_US",
		alternateLocale: ["zh_CN"],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "ChatDKU",
		description: "The agentic AI assistant for Duke Kunshan University.",
		images: ["/og.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<Analytics />
			<body className={`${inter.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					// disableTransitionOnChange
				>
					<LanguageProvider>
						{children}
						<Toaster />
					</LanguageProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
