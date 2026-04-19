"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/components/language-provider";
import {
	Search,
	Shield,
	Brain,
	Database,
	Zap,
	ArrowRight,
	ChevronRight,
	BookOpen,
	Users,
	CheckCircle,
	Smartphone,
	BarChart3,
	RefreshCw,
	FileText,
	Globe,
	MapPin,
	Layers,
	ArrowUpRight,
} from "lucide-react";

type Props = {
	className?: string;
};

function NavLinks({ className }: Props) {
	const { t } = useLanguage();
	return (
		<div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
			<Link href="#stack">
				<Button variant="link" size="sm" className="px-2">
					{t("home.nav.stack")}
				</Button>
			</Link>
			<Link href="#agent">
				<Button variant="link" size="sm" className="px-2">
					{t("home.nav.agent")}
				</Button>
			</Link>
			<Link href="#seekbench">
				<Button variant="link" size="sm" className="px-2">
					{t("home.nav.seekbench")}
				</Button>
			</Link>
			<Link href="/about">
				<Button variant="link" size="sm" className="px-2">
					{t("home.nav.about")}
				</Button>
			</Link>
			<Link href="/team-credits">
				<Button variant="link" size="sm" className="px-2">
					{t("home.nav.team")}
				</Button>
			</Link>
		</div>
	);
}

export default function IntroPage() {
	const { t } = useLanguage();
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;

		const existing = document.querySelector(
			'script[src="https://www.youtube.com/iframe_api"]',
		);
		if (!existing) {
			const tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			document.body.appendChild(tag);
		}

		let player: any;
		let interval: ReturnType<typeof setInterval> | null = null;
		const END_SECONDS = 112;

		const createPlayer = () => {
			const YT = (window as any).YT;
			if (!YT || !YT.Player || !iframeRef.current) return;
			player = new YT.Player(iframeRef.current, {
				events: {
					onReady: (e: any) => {
						e.target.mute();
						e.target.playVideo();
					},
					onStateChange: (e: any) => {
						if (e.data === YT.PlayerState.ENDED) {
							e.target.seekTo(0, true);
							e.target.playVideo();
						}
					},
				},
			});
			interval = setInterval(() => {
				if (!player || typeof player.getCurrentTime !== "function") return;
				if (player.getCurrentTime() >= END_SECONDS) {
					player.seekTo(0, true);
					player.playVideo();
				}
			}, 250);
		};

		if ((window as any).YT && (window as any).YT.Player) {
			createPlayer();
		} else {
			const prev = (window as any).onYouTubeIframeAPIReady;
			(window as any).onYouTubeIframeAPIReady = () => {
				if (typeof prev === "function") prev();
				createPlayer();
			};
		}

		return () => {
			if (interval) clearInterval(interval);
			if (player && typeof player.destroy === "function") player.destroy();
		};
	}, []);

	return (
		<div className="min-h-screen bg-background font-inter text-foreground">
			{/* ── Navbar ── */}
			<nav className="sticky top-0 z-50  bg-background/80 backdrop-blur-sm rounded-b-sm ">
				<div className="lg:px-20 md:px-10 px-5 mx-auto py-3 sm:py-5 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Image
							src="/logos/new_logo.svg"
							alt="ChatDKU"
							width={40}
							height={40}
						/>
						<span className="font-bold font-inter text-3xl">ChatDKU</span>
					</div>
					<div className="flex items-center">
						<NavLinks className="hidden sm:inline-block pr-4" />
						<LanguageToggle />
						<Link href="/login">
							<Button className="rounded-full px-4 mx-2">
								{t("home.nav.login")}
							</Button>
						</Link>
					</div>
				</div>
				<NavLinks className="sm:hidden justify-evenly" />
			</nav>

			{/* ── Hero ── */}
			<section className="relative overflow-hidden py-24 md:py-24 px-4">
				<div className="flex flex-col lg:flex-row mx-auto items-center justify-around text-center">
					<div className="md:min-w-lg">
						<h1 className="text-4xl font-serif drop-shadow-white/10 drop-shadow-2xl sm:text-5xl md:text-6xl tracking-tight mb-10 leading-tight">
							{t("home.hero.title1")}
							<br />
							<span className=" bg-gradient-to-r  from-green-700 to-blue-600 dark:from-green-200 dark:to-blue-300 bg-clip-text text-transparent">
								{t("home.hero.title2")}
							</span>
						</h1>
						<p className="text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
							<b className="underline underline-offset-3">ChatDKU</b>{" "}
							{t("home.hero.subtitle")}
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Link href="/login">
								<Button
									size="lg"
									className="rounded-full text-xl px-8 w-auto sm:px-10 py-6 shadow-lg shadow-green-400/20 hover:font-bold "
								>
									{t("home.hero.cta")}
								</Button>
							</Link>
						</div>
						<div className="mt-8 mb-2 flex text-lg pt-5 flex-col sm:flex-row items-center justify-center gap-y-0 text-muted-foreground">
							{t("home.hero.broughtBy")}
							<div className="flex flex-col space-x-1 items-center">
								<Link href="https://sites.duke.edu/edgeintelligence/">
									<Image
										src={"/logos/BL_Edge Intelligence Lab_04.png"}
										alt="Logo for EIL."
										height={30}
										width={230}
										className="dark:hidden border -p-2 border-transparent hover:border-border hover:shadow-black/5 shadow-transparent rounded-2xl shadow-lg transition-all"
									/>
									<Image
										src={"/logos/BL_Edge Intelligence Lab_06.png"}
										alt="Logo for EIL."
										height={30}
										width={230}
										className="hidden dark:block border -p-2 border-transparent hover:border-border hover:shadow-black/5 shadow-transparent rounded-2xl shadow-lg transition-all"
									/>
								</Link>
							</div>
						</div>
					</div>
					<div className="lg:max-w-2/5 text-right md:pl-6 mt-6 scale-105 md:scale-100">
						{/* <iframe */}
						{/* 	ref={iframeRef} */}
						{/* 	src="https://www.youtube.com/embed/SdItulvqdLo?enablejsapi=1&autoplay=1&mute=1&controls=1&playsinline=1&modestbranding=1&rel=0&end=112" */}
						{/* 	title="Introducing ChatDKU: Your AI Assistant at Duke Kunshan University" */}
						{/* 	allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" */}
						{/* 	referrerPolicy="strict-origin-when-cross-origin" */}
						{/* 	allowFullScreen */}
						{/* 	style={{ aspectRatio: "16 / 9" }} */}
						{/* 	className="w-full h-auto rounded-sm border-0" */}
						{/* /> */}
						<video
							autoPlay
							muted
							loop
							playsInline
							preload="auto"
							className="w-full h-auto rounded-sm "
						>
							<source src="/chatdku_promo.webm" type="video/webm" />
							{t("home.hero.videoFallback")}
						</video>
						<Link href="https://youtu.be/SdItulvqdLo">
							<Button variant="link" className="m-2 text-muted-foreground">
								{t("home.hero.watchYouTube")} <ArrowUpRight />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* ── Partner Logos ── */}
			<section className=" text-center">
				<div className="mx-auto md:px-20 flex flex-col items-center gap-4 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 dark:from-transparent dark:to-transparent py-5 ">
					<p className="text-white text-sm tracking-wide uppercase font-serif">
						{t("home.partners.label")}
					</p>
					<Image
						src="/partner-logos.png"
						alt="Partner logos"
						width={900}
						height={100}
						className="w-full max-w-3xl h-auto object-contain opacity-90"
					/>
				</div>
			</section>

			{/* ── The Problem ── */}
			{/* <section className="py-16 px-4 from-neutral-500/30 bg-gradient-to-b to-lime-500/5"> */}
			{/* 	<div className="max-w-5xl mx-auto"> */}
			{/* 		<div className="text-center mb-10"> */}
			{/* 			<h2 className="text-2xl md:text-3xl font-bold mb-2"> */}
			{/* 				{t("home.problem.title")} */}
			{/* 			</h2> */}
			{/* 		</div> */}
			{/* 		<div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
			{/* 			{[ */}
			{/* 				{ */}
			{/* 					icon: FileText, */}
			{/* 					title: t("home.problem.pdf.title"), */}
			{/* 					desc: t("home.problem.pdf.desc"), */}
			{/* 				}, */}
			{/* 				{ */}
			{/* 					icon: Globe, */}
			{/* 					title: t("home.problem.tabs.title"), */}
			{/* 					desc: t("home.problem.tabs.desc"), */}
			{/* 				}, */}
			{/* 				{ */}
			{/* 					icon: MapPin, */}
			{/* 					title: t("home.problem.office.title"), */}
			{/* 					desc: t("home.problem.office.desc"), */}
			{/* 				}, */}
			{/* 			].map(({ icon: Icon, title, desc }) => ( */}
			{/* 				<div */}
			{/* 					key={title} */}
			{/* 					className="bg-background rounded-2xl p-6 border shadow-sm" */}
			{/* 				> */}
			{/* 					<div className="flex flex-row items-center space-x-2"> */}
			{/* 						<Icon className="text-muted-foreground" /> */}
			{/* 						<h3 className="font-semibold">{title}</h3> */}
			{/* 					</div> */}
			{/* 					<p className="text-sm text-muted-foreground">{desc}</p> */}
			{/* 				</div> */}
			{/* 			))}{" "} */}
			{/* 		</div>{" "} */}
			{/* 		<p className="text-center italic text-lg mt-6"> */}
			{/* 			{t("home.problem.coda")} */}
			{/* 		</p> */}
			{/* 	</div> */}
			{/* </section> */}

			{/* ── The Solution ── */}
			<section className="py-16 px-4" id="agent">
				<div className="max-w-5xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
						<div>
							<Badge variant="outline" className="mb-4">
								{t("home.solution.badge")}
							</Badge>
							<h2 className="text-2xl md:text-3xl font-bold mb-4">
								{t("home.solution.title")}
							</h2>
							<p className="text-muted-foreground mb-6 leading-relaxed">
								{t("home.solution.desc")}
							</p>
							<div className="space-y-3">
								{[
									{
										icon: Shield,
										text: t("home.solution.privacy"),
									},
									{
										icon: BookOpen,
										text: t("home.solution.sources"),
									},
									{
										icon: Users,
										text: t("home.solution.audience"),
									},
								].map(({ icon: Icon, text }) => (
									<div key={text} className="flex items-start gap-3">
										<Icon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
										<span className="text-sm">{text}</span>
									</div>
								))}
							</div>
						</div>

						{/* Mock chat demo */}
						<div className="bg-muted/40 rounded-3xl p-6 border space-y-3">
							<div className="bg-background rounded-2xl p-4 border text-sm">
								<p className="text-muted-foreground text-xs mb-1.5">
									{t("home.solution.demo.you")}
								</p>
								<p>{t("home.solution.demo.question")}</p>
							</div>
							<div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/50 text-sm">
								<p className="text-blue-600 dark:text-blue-400 text-xs mb-1.5 flex items-center gap-1.5">
									<Image
										src="/logos/new_logo.svg"
										alt=""
										width={12}
										height={12}
									/>
									ChatDKU
								</p>
								<p
									className="leading-relaxed"
									dangerouslySetInnerHTML={{
										__html: t("home.solution.demo.answer"),
									}}
								/>
								<p className="leading-relaxed mt-2">
									<span
										className="text-xs text-muted-foreground"
										dangerouslySetInnerHTML={{
											__html: t("home.solution.demo.ref"),
										}}
									/>
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Architecture ── */}
			<section id="stack" className="py-16 px-4 bg-muted/30">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<Badge variant="outline" className="mb-4">
							{t("home.arch.badge")}
						</Badge>
						<h2 className="text-2xl md:text-3xl font-bold mb-3">
							{t("home.arch.title")}
						</h2>
						<p className="text-muted-foreground max-w-xl mx-auto">
							{t("home.arch.subtitle")}
						</p>
					</div>

					<div className="space-y-2.5 max-w-3xl mx-auto">
						{[
							{
								layer: t("home.arch.layer1"),
								desc: t("home.arch.layer1.desc"),
								color:
									"bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40",
								dot: "bg-purple-500",
							},
							{
								layer: t("home.arch.layer2"),
								desc: t("home.arch.layer2.desc"),
								color:
									"bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
								dot: "bg-blue-500",
							},
							{
								layer: t("home.arch.layer3"),
								desc: t("home.arch.layer3.desc"),
								color:
									"bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
								dot: "bg-emerald-500",
							},
							{
								layer: t("home.arch.layer4"),
								desc: t("home.arch.layer4.desc"),
								color:
									"bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/40",
								dot: "bg-orange-500",
							},
						].map(({ layer, desc, color, dot }) => (
							<div
								key={layer}
								className={`flex items-center gap-4 rounded-2xl px-5 py-4 border ${color}`}
							>
								<div
									className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`}
								/>
								<div className="min-w-0">
									<span className="font-semibold text-sm">{layer}</span>
									<span className="text-muted-foreground text-sm">
										{" — "}
										{desc}
									</span>
								</div>
							</div>
						))}
					</div>

					<p className="mt-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
						{t("home.arch.footer")}{" "}
						<strong className="text-foreground">
							{t("home.arch.footerBold")}
						</strong>{" "}
						{t("home.arch.footerEnd")}
					</p>
				</div>
			</section>

			{/* ── Agent Flow ── */}
			<section className="py-16 px-4 bg-gradient-to-b from-transparent to-blue-500/10">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<Badge variant="outline" className="mb-4">
							{t("home.agent.badge")}
						</Badge>
						<h2 className="text-2xl md:text-3xl font-bold mb-3">
							{t("home.agent.title")}
						</h2>
						<p className="text-muted-foreground max-w-xl mx-auto">
							{t("home.agent.subtitle")}
						</p>
					</div>

					{/* Steps — vertical on mobile, horizontal on md+ */}
					<div className="flex flex-col md:flex-row items-stretch md:items-start gap-2 md:gap-1 max-w-4xl mx-auto">
						{[
							{
								step: "1",
								label: t("home.agent.step1"),
								icon: Search,
								desc: t("home.agent.step1.desc"),
							},
							{
								step: "2",
								label: t("home.agent.step2"),
								icon: Database,
								desc: t("home.agent.step2.desc"),
							},
							{
								step: "3",
								label: t("home.agent.step3"),
								icon: CheckCircle,
								desc: t("home.agent.step3.desc"),
							},
							{
								step: "4",
								label: t("home.agent.step4"),
								icon: RefreshCw,
								desc: t("home.agent.step4.desc"),
							},
							{
								step: "5",
								label: t("home.agent.step5"),
								icon: Brain,
								desc: t("home.agent.step5.desc"),
							},
						].map(({ step, label, icon: Icon, desc }, i) => (
							<div key={step} className="flex md:flex-col items-center flex-1">
								<div className="flex md:flex-col items-center md:items-center gap-3 md:gap-2 flex-1 md:text-center">
									<div className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm">
										{step}
									</div>
									<div className="flex-1 md:flex-none">
										<div className="font-semibold text-sm">{label}</div>
										<div className="text-xs text-muted-foreground">{desc}</div>
									</div>
								</div>
								{i < 4 && (
									<>
										<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 md:hidden" />
										<div className="hidden md:flex items-center justify-center w-full pt-4">
											<ChevronRight className="h-4 w-4 text-muted-foreground" />
										</div>
									</>
								)}
							</div>
						))}
					</div>

					<div className="mt-10 max-w-2xl mx-auto bg-muted/50 rounded-2xl p-5 border text-sm text-center text-muted-foreground leading-relaxed">
						{t("home.agent.footer1")}{" "}
						<strong className="text-foreground">
							{t("home.agent.footerBold")}
						</strong>{" "}
						{t("home.agent.footer2")}
					</div>
				</div>
			</section>

			{/* ── SeekBench ── */}
			<section id="seekbench" className="py-16 px-4 bg-muted/30">
				<div className="max-w-5xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
						<div className="space-y-4">
							<Badge variant="outline" className="mb-4">
								{t("home.seekbench.badge")}
							</Badge>
							<div className="rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center px-2 py-4">
								<BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />{" "}
								<h3 className="text-2xl mx-1">SeekBench</h3>
							</div>
							<h2 className="text-2xl md:text-3xl font-bold">
								{t("home.seekbench.title")}
							</h2>
							<p className="text-muted-foreground leading-relaxed">
								{t("home.seekbench.desc1")}
							</p>
							<p className="text-muted-foreground leading-relaxed">
								{t("home.seekbench.desc2")}{" "}
								<strong className="text-foreground">
									{t("home.seekbench.desc2Bold")}
								</strong>{" "}
								{t("home.seekbench.desc2End")}
							</p>
						</div>

						<div className="space-y-3">
							{[
								{
									label: t("home.seekbench.metric1"),
									icon: Database,
									desc: t("home.seekbench.metric1.desc"),
								},
								{
									label: t("home.seekbench.metric2"),
									icon: CheckCircle,
									desc: t("home.seekbench.metric2.desc"),
								},
								{
									label: t("home.seekbench.metric3"),
									icon: Brain,
									desc: t("home.seekbench.metric3.desc"),
								},
							].map(({ label, icon: Icon, desc }) => (
								<div
									key={label}
									className="bg-background rounded-xl p-4 border flex items-start gap-3"
								>
									<Icon className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
									<div>
										<div className="font-semibold text-sm">{label}</div>
										<div className="text-xs text-muted-foreground">{desc}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── Roadmap ── */}
			<section className="py-16 px-4 bg-gradient-to-b from-transparent to-emerald-500/10">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<Badge variant="outline" className="mb-4">
							{t("home.roadmap.badge")}
						</Badge>
						<h2 className="text-2xl md:text-3xl font-bold mb-2">
							{t("home.roadmap.title")}
						</h2>
						{/* <p className="text-muted-foreground"> */}
						{/* 	{t("home.roadmap.subtitle")} */}
						{/* </p> */}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{
								icon: Smartphone,
								title: t("home.roadmap.mobile"),
								desc: t("home.roadmap.mobile.desc"),
							},
							{
								icon: Brain,
								title: t("home.roadmap.agents"),
								desc: t("home.roadmap.agents.desc"),
							},
							{
								icon: Layers,
								title: t("home.roadmap.visual"),
								desc: t("home.roadmap.visual.desc"),
							},
							{
								icon: Zap,
								title: t("home.roadmap.eval"),
								desc: t("home.roadmap.eval.desc"),
							},
						].map(({ icon: Icon, title, desc }) => (
							<div
								key={title}
								className=" bg-muted/50 rounded-2xl p-5 border hover:shadow-md hover:bg-muted/80 transition-all duration-200"
							>
								<Icon className="h-6 w-6 mb-3 text-muted-foreground" />
								<h3 className="font-semibold mb-1 text-sm">{title}</h3>
								<p className="text-xs text-muted-foreground">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── CTA ── */}
			<section className="py-20 px-4 bg-muted/30">
				<div className="max-w-2xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						{t("home.cta.title")}
					</h2>
					<p className="text-muted-foreground mb-8 leading-relaxed">
						{t("home.cta.desc")}
					</p>
					<Link href="/login">
						<Button size="lg" className="rounded-full px-10">
							{t("home.cta.button")} <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>
			</section>

			{/* ── Footer ── */}
			<footer className="border-t py-6 px-4">
				<div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
					<div className="flex items-center gap-2">
						<span>{t("home.footer.copyright")}</span>
					</div>
					<div className="flex gap-4">
						<Link
							href="/about"
							className="hover:text-foreground transition-colors"
						>
							{t("home.footer.about")}
						</Link>
						<Link
							href="/team-credits"
							className="hover:text-foreground transition-colors"
						>
							{t("home.footer.team")}
						</Link>
						<Link
							href="/login"
							className="hover:text-foreground transition-colors"
						>
							{t("home.footer.login")}
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
