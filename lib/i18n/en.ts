const en = {
	// Navbar
	"navbar.about": "About",
	"navbar.dev": "Dev",
	"navbar.preview": "Demo",

	// Back button
	back: "Back",

	// Home page - Navbar
	"home.nav.stack": "Stack",
	"home.nav.agent": "Agent",
	"home.nav.seekbench": "SeekBench",
	"home.nav.about": "About",
	"home.nav.team": "Team",
	"home.nav.login": "Log In",

	// Home page - Hero
	"home.hero.title1": "University knowledge,",
	"home.hero.title2": "finally in one place.",
	"home.hero.subtitle.prefix": "",
	"home.hero.subtitle":
		"is the agentic AI assistant that answers all your DKU questions accurately, privately, and instantly.",
	"home.hero.cta": "Open ChatDKU",
	"home.hero.broughtBy": "Brought to you by",
	"home.hero.watchYouTube": "Watch on YouTube",
	"home.hero.videoFallback": "Your browser does not support the video tag.",

	// Home page - Partners
	"home.partners.label": "In Partnership With",

	// Home page - Problem
	"home.problem.title": "Does this sound familiar?",
	"home.problem.pdf.title": "Lost in PDFs",
	"home.problem.pdf.desc":
		"Academic policies buried in documents nobody reads twice.",
	"home.problem.tabs.title": "10 tabs open",
	"home.problem.tabs.desc":
		"Deadlines, requirements, and resources scattered across a dozen websites.",
	"home.problem.office.title": "Office ping-pong",
	"home.problem.office.desc":
		"Bounced between offices just to get a simple answer.",
	"home.problem.coda": "We've all been there.",

	// Home page - Solution
	"home.solution.badge": "The Solution",
	"home.solution.title": "An AI that actually knows DKU.",
	"home.solution.desc":
		"Unlike general-purpose chatbots, ChatDKU is built on official DKU sources. That's policies, deadlines, courses, bulletins — all deployed entirely on DKU infrastructure.",
	"home.solution.privacy":
		"Fully on-premise, so your queries never leave the internal DKU network.",
	"home.solution.sources":
		"Grounded in official, up-to-date DKU sources, not the open web.",
	"home.solution.audience": "Built for students, faculty, and staff.",
	"home.solution.demo.you": "You",
	"home.solution.demo.question": "When can I declare my major?",
	"home.solution.demo.answer":
		"You can declare your major during the <b>Spring term of your sophomore year</b> at Duke Kunshan University.<br/>Prior to declaring, you should work with your academic advisor to develop a long-range academic plan that aligns with your intended major.<br/> It is recommended to explore different major options during your first year to make an informed decision. For more information, consult the Office of Undergraduate Advising or review the DKU Undergraduate Bulletin.",
	"home.solution.demo.ref":
		"Reference: <br/>• DKU Undergraduate Studies Bulletin (Page 52) <br/>• Advising FAQ (12-19-24 Update) (Page 5)",

	// Home page - Architecture
	"home.arch.badge": "Under the Hood",
	"home.arch.title": "A full-stack AI platform",
	"home.arch.subtitle":
		"Every layer is built for reliability, privacy, and continuous improvement.",
	"home.arch.layer1": "Modern Interface",
	"home.arch.layer1.desc":
		"Next.js powers an accessible UI for both mobile and desktop.",
	"home.arch.layer2": "Secure Backend",
	"home.arch.layer2.desc":
		"Authentication with Duke NetID, secure routing, and request handling.",
	"home.arch.layer3": "Agentic RAG Core",
	"home.arch.layer3.desc":
		"ChatDKU features advanced AI techniques for response planning, hybrid retrieval mechanisms, reasoning, synthesis, and memory.",
	"home.arch.layer4": "Knowledge Base",
	"home.arch.layer4.desc":
		"Exclusive information from a variety of DKU documents, stored as vector embeddings and a relational database.",
	"home.arch.footer":
		"We use an offline ingestion pipeline to parse official DKU sources, vector-embed them in chunks, to build an efficiently searchable index. At query time,",
	"home.arch.footerBold": "vector search + keyword search + reranking",
	"home.arch.footerEnd": "ground every response in real campus information.",

	// Home page - Agent Flow
	"home.agent.badge": "Agent Flow",
	"home.agent.title": "How your question becomes an answer",
	"home.agent.subtitle":
		"ChatDKU doesn't guess. Every response goes through a rigorous verification loop.",
	"home.agent.step1": "Query",
	"home.agent.step1.desc": "Your question is sent to the system",
	"home.agent.step2": "Retrieve",
	"home.agent.step2.desc": "Agent searches the knowledge base",
	"home.agent.step3": "Evaluate",
	"home.agent.step3.desc": "Is the evidence sufficient?",
	"home.agent.step4": "Refine",
	"home.agent.step4.desc": "If not, rewrite query & retrieve again",
	"home.agent.step5": "Synthesize",
	"home.agent.step5.desc": "Generate answer with citations",
	"home.agent.footer1":
		"If the retrieved context isn't strong enough, the system rewrites the query and retrieves again before generating.",
	"home.agent.footerBold": "No hallucinations, no guessing.",
	"home.agent.footer2":
		"Only when evidence passes the sufficiency check does the synthesizer produce the final response, complete with citations for manual review.",

	// Home page - SeekBench
	"home.seekbench.badge": "Evaluation",
	"home.seekbench.title": "Not just an answer machine.",
	"home.seekbench.desc1":
		"SeekBench is an evaluation framework woven throughout the pipeline — scoring not just final answers, but also retrieval quality and intermediate reasoning decisions.",
	"home.seekbench.desc2":
		"This lets us pinpoint exactly where the pipeline needs improvement, making ChatDKU a",
	"home.seekbench.desc2Bold": "continuously improvable system",
	"home.seekbench.desc2End": "driven by real evaluation and user feedback.",
	"home.seekbench.metric1": "Retrieval quality",
	"home.seekbench.metric1.desc": "Are the right documents being found?",
	"home.seekbench.metric2": "Sufficiency decisions",
	"home.seekbench.metric2.desc":
		"Is the evidence threshold being met correctly?",
	"home.seekbench.metric3": "Final answer quality",
	"home.seekbench.metric3.desc":
		"Is the response accurate, grounded, and helpful?",

	// Home page - Roadmap
	"home.roadmap.badge": "Roadmap",
	"home.roadmap.title": "What's coming next",
	"home.roadmap.subtitle": "ChatDKU is actively evolving.",
	"home.roadmap.mobile": "Mobile App",
	"home.roadmap.mobile.desc": "Native iOS & Android for on-the-go access",
	"home.roadmap.agents": "Stronger Agents",
	"home.roadmap.agents.desc": "More capable multi-step reasoning and planning",
	"home.roadmap.visual": "Visual Data Import",
	"home.roadmap.visual.desc":
		"Drag-and-drop interface for adding campus documents",
	"home.roadmap.eval": "Auto Evaluation",
	"home.roadmap.eval.desc": "More powerful automated benchmarking framework",

	// Home page - CTA
	"home.cta.title": "Ready to ask your first question?",
	"home.cta.desc":
		"ChatDKU is available to all DKU students, faculty, and staff — free, fast, and private.",
	"home.cta.button": "Get Started",

	// Home page - Footer
	"home.footer.copyright": "DKU Edge Intelligence Lab © 2026",
	"home.footer.about": "About",
	"home.footer.team": "Team",
	"home.footer.login": "Login",

	// Login page
	"login.home": "Home",
	"login.about": "About",
	"login.team": "Team",
	"login.tagline": "Navigating university has never been easier.",
	"login.openTerms": "Open Terms and Conditions",
	"login.acceptTerms": "Accept Terms and Conditions",
	"login.cookieNotice": "We save a cookie to remember your preferences.",
	"login.guest": "Proceed as",
	"login.guestBold": "guest",
	"login.or": "or",
	"login.netid": "Log in with",
	"login.netidBold": "Duke NetID",
	"login.termsTooltip": "Please accept the Terms and Conditions to use ChatDKU",
	"login.footer": "2026 Edge Intelligence Lab",
	"login.serverError": "Couldn't connect to server. Please try again later.",

	// Chat page
	"chat.welcome": "Welcome to ChatDKU",
	"chat.placeholder": "Type your message...",
	"chat.searching": "Searching relevant documents",
	"chat.step.vector": "Running vector retrieval",
	"chat.step.keyword": "Running keyword retrieval",
	"chat.step.database": "Running database retrieval",
	"chat.step.evaluate": "Evaluating response",
	"chat.step.refine": "Refining response",
	"chat.step.synthesize": "Synthesizing",
	"chat.feedbackQuestion": "Was this response helpful?",
	"chat.feedbackYes": "Yes",
	"chat.feedbackNo": "No",
	"chat.feedbackThanks": "Thanks for your feedback!",
	"chat.feedbackCanceled": "Feedback canceled.",
	"chat.feedbackWhyTitle": "Sorry to hear that. Can you tell us why?",
	"chat.feedbackNotCorrect": "Not Correct",
	"chat.feedbackNotClear": "Not Clear",
	"chat.feedbackNotRelevant": "Not Relevant",
	"chat.feedbackOther": "Other",
	"chat.feedbackCustomPlaceholder": "Please describe the issue",
	"chat.feedbackCustomRequired": "Please write something!",
	"chat.feedbackSubmit": "Submit",
	"chat.feedbackCancel": "Cancel",
	"chat.disclaimer":
		"AI responses may contain errors. Please verify with the relevant offices if anything is unclear.",

	// About page / component
	"about.title": "About ChatDKU",
	"about.point1":
		"ChatDKU, Duke Kunshan University's dedicated AI chatbot, is designed to streamline access to campus information and enhance engagement for students, faculty, and staff. ChatDKU provides instant, reliable answers to DKU-specific queries—saving time and simplifying university life. The unique feature of ChatDKU is its local deployment to ensure data privacy and security.",
	"about.point2":
		"ChatDKU-Student is not meant to be a replacement for advisor meetings or communication with relevant offices when you need support. It is a tool to give quick, accurate answers about DKU policies but it is important for users to follow up with the university personnel involved if you are going to be taking some sort of action based on policy.",
	"about.point3":
		"All A.I. systems have the potential to make an error for a variety of reasons. While the developers of this platform will make every effort to make this platform as accurate as possible, it is the user's responsibility to double check the accuracy of any answers provided by the system. If a user misses a deadline or neglects to take an action because of an answer given by the system, the responsibility for that rests on the user, not on ChatDKU. Screenshots of responses provided by the system cannot serve as a rationale to provide exceptions to policies outlined in the Undergraduate Bulletin or deadlines set in the Academic Calendar.",
	"about.point4":
		"To improve answer accuracy, please ensure your questions contain specific and detailed keywords. This helps avoid misunderstandings or incorrect interpretations.",
	"about.developedBy":
		"Developed by DKU Edge Intelligence Lab, in partnership with the IGHE SET Lab and Office of Undergraduate Advising.",
	"about.guidebook": "Get the Guidebook",
	"about.credits": "Credits",

	// Terms and Conditions
	"terms.title": "Terms and Conditions",
	"terms.openButton": "Open Terms and Conditions",

	// Sidebar
	"side.newChat": "New Chat",
	"side.aboutChatDKU": "About ChatDKU",
	"side.loginNetID": "Login with Duke NetID",
	"side.modelSelection": "Model Selection",
	"side.chatHistory": "Chat History",
	"side.historyDisabled": "History not saved for guest users.",
	"side.searchChats": "Search chats",
	"side.noMatches": "No matches",
	"side.noConversations": "No conversations yet",
	"side.deleteChat": "Delete chat?",
	"side.deleteConfirm": "This will permanently delete this chat history.",
	"side.cancel": "Cancel",
	"side.delete": "Delete",
	"side.campusResources": "Campus Resources",

	// Starter
	"starter.title": "Ask ChatDKU",

	// Team Credits
	"team.credits": "Credits",
	"team.coreMembers": "Core Members",
	"team.newMembers": "New Members",
	"team.alumni": "Alumni",
	"team.showMore": "Show more",
	"team.showLess": "Show less",
} as const;

export default en;
