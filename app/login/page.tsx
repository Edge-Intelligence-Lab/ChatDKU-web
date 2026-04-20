"use client";
import { TermsButton } from "@/components/about";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/ui/language-toggle";

const cgaramond = Cormorant_Garamond({
	variable: "--font-garamond",
	display: "swap",
	subsets: ["latin"],
});

export default function LoginPage() {
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isDukeLoading, setIsDukeLoading] = useState(false);
	const { t } = useLanguage();

	const router = useRouter();

	// useEffect(() => {
	// 	if (
	// 		Cookies.get("chatdku_token") &&
	// 		Cookies.get("terms_accepted") &&
	// 		!(process.env.NODE_ENV === "development")
	// 	) {
	// 		router.replace("/app");
	// 	}
	// }, [router]);

	const handleProceed = async () => {
		if (termsAccepted) {
			setIsLoading(true);
			// Set cookie for terms acceptance - expires in 60 days
			Cookies.set("terms_accepted", "true", { expires: 60 });
			// Fetch JWT so the Python chat API allows requests
			try {
				const res = await fetch("/api/auth/token");
				if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
				const { token } = await res.json();
				let expires: number | Date = 1;
				try {
					const payload = JSON.parse(atob(token.split(".")[1]));
					if (payload.exp) {
						expires = new Date(payload.exp * 1000);
					}
				} catch {}
				Cookies.set("chatdku_token", token, { expires });
			} catch (e) {
				console.error("JWT fetch failed:", e);
				toast.error(t("login.serverError"));
				setIsLoading(false);
				return;
			}
			router.push("/app");
		}
	};

	return (
		<div className="relative w-screen h-screen">
			<div className="absolute left-0 top-0 w-full md:w-1/2 h-[20vh] md:h-full overflow-hidden ">
				<Image
					src={"/ADBVC-2.webp"}
					alt="Photo of DKU campus."
					fill
					className="object-cover md:object-bottom md:rounded-4xl md:p-3 animate-in fade-in-30 duration-200 drop-shadow-md"
					priority
				/>
			</div>
			<div className="flex flex-col items-center md:absolute right-0 translate-y-[20vh] md:translate-y-0 top-0 md:top-0 md:w-1/2 md:h-full overflow-scroll space-y-4 justify-between">
				<div className="w-full flex flex-row items-center justify-between p-3 sm:p-5">
					<Link href="/" className="cursor-pointer">
						<h1 className="text-xl md:text-2xl lg:text-3xl flex items-center">
							<Image
								src="/logos/new_logo.svg"
								alt="ChatDKU logo"
								width={40}
								height={40}
							/>
							<b className="ml-1">ChatDKU</b>
						</h1>
					</Link>
					<div className="sm:space-x-2 flex items-center">
						<Link href={"/"}>
							<Button variant="link">{t("login.home")}</Button>
						</Link>
						<Link href={"/about"}>
							<Button variant="link">{t("login.about")}</Button>
						</Link>
						<Link href={"/team-credits"}>
							<Button variant="link">{t("login.team")}</Button>
						</Link>
						<LanguageToggle />
					</div>
				</div>
				<div className="mx-5 my-20 max-w-[500]">
					<h1
						className={`text-5xl font-lighter text-center font-serif tracking-tight drop-shadow-2xl drop-shadow-green-300/20 fade-slide-in ${cgaramond.variable}`}
					>
						{t("login.tagline")}
					</h1>
				</div>
				<div className="flex flex-col items-center space-y-4 outline p-10 rounded-3xl shadow">
					<TermsButton />
					<div className="flex items-center space-x-2">
						<Checkbox
							id="terms"
							checked={termsAccepted}
							className="cursor-pointer"
							onCheckedChange={(checked) => setTermsAccepted(checked === true)}
						/>
						<label
							htmlFor="terms"
							className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{t("login.acceptTerms")}
						</label>
					</div>

					<p className="text-xs text-muted-foreground">
						{t("login.cookieNotice")}
					</p>
				</div>

				<div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-4 justify-center">
									<Button
										variant="secondary"
										className={
											// "rounded-full p-6 border border-foreground/10 " +
											"rounded-full p-6 bg-green-700 text-white hover:bg-green-500 border border-green-300/30 disabled:bg-transparent disabled:text-foreground disabled:border-border" // This is only for Chancellor's Office demo
										}
										disabled={!termsAccepted || isLoading}
										onClick={handleProceed}
									>
										{isLoading ? (
											<Loader2 className="animate-spin" />
										) : (
											<p>
												{t("login.guest")}{" "}
												<span className="font-bold">
													{t("login.guestBold")}
												</span>
											</p>
										)}
									</Button>
									<p className="opacity-80">{t("login.or")}</p>
									<Button
										variant="default"
										className="rounded-full p-6 bg-blue-700 text-white hover:bg-blue-500 border border-blue-300/30 disabled:bg-transparent disabled:text-foreground disabled:border-border"
										disabled={!termsAccepted || isLoading || isDukeLoading}
										onClick={() => {
											setIsDukeLoading(true);
											window.location.href =
												"https://chatdku.dukekunshan.edu.cn/";
										}}
									>
										{isDukeLoading ? (
											<Loader2 className="animate-spin" />
										) : (
											<p>
												{t("login.netid")}{" "}
												<span className="font-bold">
													{t("login.netidBold")}
												</span>
											</p>
										)}
									</Button>
								</div>
							</TooltipTrigger>
							{!termsAccepted && (
								<TooltipContent>
									<p>{t("login.termsTooltip")}</p>
								</TooltipContent>
							)}
						</Tooltip>
					</TooltipProvider>
				</div>
				<div className="p-2 text-xs opacity-50 mt-10 w-full text-end">
					{t("login.footer")}
				</div>
			</div>
		</div>
	);
}
