import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function NavLinks({ className }: Props) {
	return (
		<div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
			<Link href="#stack">
				<Button variant="link" size="sm">
					Stack
				</Button>
			</Link>
			<Link href="#agent">
				<Button variant="link" size="sm">
					Agent
				</Button>
			</Link>
			<Link href="#seekbench">
				<Button variant="link" size="sm">
					SeekBench
				</Button>
			</Link>
			<Link href="/about">
				<Button variant="link" size="sm">
					About
				</Button>
			</Link>
			<Link href="/team-credits">
				<Button variant="link" size="sm">
					Team
				</Button>
			</Link>
		</div>
	);
}

export default function IntroPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			{/* ── Navbar ── */}
			<nav className="sticky top-0 z-50  bg-background/80 backdrop-blur-sm rounded-b-sm ">
				<div className="md:px-20 px-5 mx-auto py-3 sm:py-5 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Image
							src="/logos/new_logo.svg"
							alt="ChatDKU"
							width={40}
							height={40}
						/>
						<span className="font-bold text-3xl">ChatDKU</span>
					</div>
					<div>
						<NavLinks className="hidden sm:inline-block pr-4" />
						<Link href="/login">
							<Button className="rounded-full px-4">Log In</Button>
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
							University knowledge,
							<br />
							<span className=" bg-gradient-to-r  from-green-700 to-blue-600 dark:from-green-200 dark:to-blue-300 bg-clip-text text-transparent">
								finally in one place.
							</span>
						</h1>
						<p className="text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
							{/* <Image */}
							{/* 	src="/logos/new_logo.svg" */}
							{/* 	width={22} */}
							{/* 	height={22} */}
							{/* 	alt="Logo" */}
							{/* 	className="inline pb-1" */}
							{/* /> */}
							<b className="underline underline-offset-3">ChatDKU</b> is the
							agentic AI assistant that answers all your DKU questions
							accurately, privately, and instantly.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<Link href="/login">
								<Button
									size="lg"
									className="rounded-full text-xl px-8 w-auto sm:px-10 py-6 shadow-lg shadow-green-400/20 hover:font-bold "
								>
									Open ChatDKU
								</Button>
							</Link>
							{/* <a href="#how-it-works"> */}
							{/* 	<Button */}
							{/* 		variant="outline" */}
							{/* 		size="lg" */}
							{/* 		className="rounded-full px-8 w-full sm:w-auto sm:px-10 md:py-6 text-lg" */}
							{/* 	> */}
							{/* 		How it works */}
							{/* 	</Button> */}
							{/* </a> */}
						</div>
						<div className="mt-8 mb-2 flex text-lg pt-5 flex-col sm:flex-row items-center justify-center gap-y-0 text-muted-foreground">
							Brought to you by
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
						<video
							autoPlay
							muted
							loop
							playsInline
							preload="auto"
							className="w-full h-auto rounded-sm "
						>
							<source src="/promo.webm" type="video/webm" />
							Your browser does not support the video tag.
						</video>
						<Link href="https://youtube.com">
							<Button variant="link" className="m-2 text-muted-foreground">
								Watch on YouTube <ArrowUpRight />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* ── The Problem ── */}
			<section className="py-16 px-4 bg-from-muted/30 bg-gradient-to-b to-lime-500/5">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-10">
						<h2 className="text-2xl md:text-3xl font-bold mb-2">
							Does this sound familiar?
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{[
							{
								icon: FileText,
								title: "Lost in PDFs",
								desc: "Academic policies buried in documents nobody reads twice.",
							},
							{
								icon: Globe,
								title: "10 tabs open",
								desc: "Deadlines, requirements, and resources scattered across a dozen websites.",
							},
							{
								icon: MapPin,
								title: "Office ping-pong",
								desc: "Bounced between offices just to get a simple answer.",
							},
						].map(({ icon: Icon, title, desc }) => (
							<div
								key={title}
								className="bg-background rounded-2xl p-6 border shadow-sm"
							>
								<div className="flex flex-row items-center space-x-2">
									<Icon className="text-muted-foreground" />
									<h3 className="font-semibold">{title}</h3>
								</div>
								<p className="text-sm text-muted-foreground">{desc}</p>
							</div>
						))}{" "}
					</div>{" "}
					<p className="text-center italic text-lg mt-6">
						We've all been there.
					</p>
				</div>
			</section>

			{/* ── The Solution ── */}
			<section className="py-16 px-4" id="agent">
				<div className="max-w-5xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
						<div>
							<Badge variant="outline" className="mb-4">
								The Solution
							</Badge>
							<h2 className="text-2xl md:text-3xl font-bold mb-4">
								An AI that actually knows DKU.
							</h2>
							<p className="text-muted-foreground mb-6 leading-relaxed">
								Unlike general-purpose chatbots, ChatDKU is built on official
								DKU sources. That's policies, deadlines, courses, bulletins —
								all deployed entirely on DKU infrastructure.
							</p>
							<div className="space-y-3">
								{[
									{
										icon: Shield,
										text: "Fully on-premise, so your queries never leave the internal DKU network.",
									},
									{
										icon: BookOpen,
										text: "Grounded in official, up-to-date DKU sources, not the open web.",
									},
									{
										icon: Users,
										text: "Built for students, faculty, and staff.",
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
								<p className="text-muted-foreground text-xs mb-1.5">You</p>
								<p>When can I declare my major?</p>
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
								<p className="leading-relaxed">
									You can declare your major during the{" "}
									<b>Spring term of your sophomore year</b> at Duke Kunshan
									University.
									<br />
									Prior to declaring, you should work with your academic advisor
									to develop a long-range academic plan that aligns with your
									intended major.
									<br /> It is recommended to explore different major options
									during your first year to make an informed decision. For more
									information, consult the Office of Undergraduate Advising or
									review the DKU Undergraduate Bulletin.
									<br />
									<span className="text-xs text-muted-foreground">
										Reference: <br />• DKU Undergraduate Studies Bulletin (Page
										52) <br />• Advising FAQ (12-19-24 Update) (Page 5)
									</span>
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
							Under the Hood
						</Badge>
						<h2 className="text-2xl md:text-3xl font-bold mb-3">
							A full-stack AI platform
						</h2>
						<p className="text-muted-foreground max-w-xl mx-auto">
							Every layer is built for reliability, privacy, and continuous
							improvement.
						</p>
					</div>

					<div className="space-y-2.5 max-w-3xl mx-auto">
						{[
							{
								layer: "Modern Interface",
								desc: "Next.js powers an accessible UI for both mobile and desktop.",
								color:
									"bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/40",
								dot: "bg-purple-500",
							},
							{
								layer: "Secure Backend",
								desc: "Authentication with Duke NetID, secure routing, and request handling.",
								color:
									"bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
								dot: "bg-blue-500",
							},
							{
								layer: "Agentic RAG Core",
								desc: "ChatDKU features advanced AI techniques for response planning, hybrid retrieval mechanisms, reasoning, synthesis, and memory.",
								color:
									"bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
								dot: "bg-emerald-500",
							},
							{
								layer: "Knowledge Base",
								desc: "Exclusive information from a variety of DKU documents, stored as vector embeddings and a relational database.",
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
						We use an offline ingestion pipeline to parse official DKU sources,
						vector-embed them in chunks, to build an efficiently searchable
						index. At query time,{" "}
						<strong className="text-foreground">
							vector search + keyword search + reranking
						</strong>{" "}
						ground every response in real campus information.
					</p>
				</div>
			</section>

			{/* ── Agent Flow ── */}
			<section className="py-16 px-4 bg-gradient-to-b from-transparent to-blue-500/10">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<Badge variant="outline" className="mb-4">
							Agent Flow
						</Badge>
						<h2 className="text-2xl md:text-3xl font-bold mb-3">
							How your question becomes an answer
						</h2>
						<p className="text-muted-foreground max-w-xl mx-auto">
							ChatDKU doesn&apos;t guess. Every response goes through a rigorous
							verification loop.
						</p>
					</div>

					{/* Steps — vertical on mobile, horizontal on md+ */}
					<div className="flex flex-col md:flex-row items-stretch md:items-start gap-2 md:gap-1 max-w-4xl mx-auto">
						{[
							{
								step: "1",
								label: "Query",
								icon: Search,
								desc: "Your question is sent to the system",
							},
							{
								step: "2",
								label: "Retrieve",
								icon: Database,
								desc: "Agent searches the knowledge base",
							},
							{
								step: "3",
								label: "Evaluate",
								icon: CheckCircle,
								desc: "Is the evidence sufficient?",
							},
							{
								step: "4",
								label: "Refine",
								icon: RefreshCw,
								desc: "If not, rewrite query & retrieve again",
							},
							{
								step: "5",
								label: "Synthesize",
								icon: Brain,
								desc: "Generate answer with citations",
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
										{/* Arrow on mobile (right-pointing) */}
										<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 md:hidden" />
										{/* Arrow on desktop (down-pointing via rotate) */}
										<div className="hidden md:flex items-center justify-center w-full pt-4">
											<ChevronRight className="h-4 w-4 text-muted-foreground" />
										</div>
									</>
								)}
							</div>
						))}
					</div>

					<div className="mt-10 max-w-2xl mx-auto bg-muted/50 rounded-2xl p-5 border text-sm text-center text-muted-foreground leading-relaxed">
						If the retrieved context isn&apos;t strong enough, the system
						rewrites the query and retrieves again before generating.{" "}
						<strong className="text-foreground">
							No hallucinations, no guessing.
						</strong>{" "}
						Only when evidence passes the sufficiency check does the synthesizer
						produce the final response, complete with citations for manual
						review.
					</div>
				</div>
			</section>

			{/* ── SeekBench ── */}
			<section id="seekbench" className="py-16 px-4 bg-muted/30">
				<div className="max-w-5xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
						<div className="space-y-4">
							<Badge variant="outline" className="mb-4">
								Evaluation
							</Badge>
							<div className="rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center px-2 py-4">
								<BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />{" "}
								<h3 className="text-2xl mx-1">SeekBench</h3>
							</div>
							<h2 className="text-2xl md:text-3xl font-bold">
								Not just an answer machine.
							</h2>
							<p className="text-muted-foreground leading-relaxed">
								SeekBench is an evaluation framework woven throughout the
								pipeline — scoring not just final answers, but also retrieval
								quality and intermediate reasoning decisions.
							</p>
							<p className="text-muted-foreground leading-relaxed">
								This lets us pinpoint exactly where the pipeline needs
								improvement, making ChatDKU a{" "}
								<strong className="text-foreground">
									continuously improvable system
								</strong>{" "}
								driven by real evaluation and user feedback.
							</p>
						</div>

						<div className="space-y-3">
							{[
								{
									label: "Retrieval quality",
									icon: Database,
									desc: "Are the right documents being found?",
								},
								{
									label: "Sufficiency decisions",
									icon: CheckCircle,
									desc: "Is the evidence threshold being met correctly?",
								},
								{
									label: "Final answer quality",
									icon: Brain,
									desc: "Is the response accurate, grounded, and helpful?",
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
							Roadmap
						</Badge>
						<h2 className="text-2xl md:text-3xl font-bold mb-2">
							What&apos;s coming next
						</h2>
						<p className="text-muted-foreground">
							ChatDKU is actively evolving.
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{
								icon: Smartphone,
								title: "Mobile App",
								desc: "Native iOS & Android for on-the-go access",
							},
							{
								icon: Brain,
								title: "Stronger Agents",
								desc: "More capable multi-step reasoning and planning",
							},
							{
								icon: Layers,
								title: "Visual Data Import",
								desc: "Drag-and-drop interface for adding campus documents",
							},
							{
								icon: Zap,
								title: "Auto Evaluation",
								desc: "More powerful automated benchmarking framework",
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
						Ready to ask your first question?
					</h2>
					<p className="text-muted-foreground mb-8 leading-relaxed">
						ChatDKU is available to all DKU students, faculty, and staff — free,
						fast, and private.
					</p>
					<Link href="/login">
						<Button size="lg" className="rounded-full px-10">
							Get Started <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>
			</section>

			{/* ── Footer ── */}
			<footer className="border-t py-6 px-4">
				<div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
					<div className="flex items-center gap-2">
						<span>DKU Edge Intelligence Lab © 2026</span>
					</div>
					<div className="flex gap-4">
						<Link
							href="/about"
							className="hover:text-foreground transition-colors"
						>
							About
						</Link>
						<Link
							href="/team-credits"
							className="hover:text-foreground transition-colors"
						>
							Team
						</Link>
						<Link
							href="/login"
							className="hover:text-foreground transition-colors"
						>
							Login
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
