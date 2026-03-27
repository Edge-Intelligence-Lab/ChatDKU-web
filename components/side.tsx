"use client";

import {
	ChevronRight,
	FileText,
	Menu,
	MessageCircle,
	MessageCircleQuestion,
	SquarePen,
	MoreHorizontal,
	Trash2,
	LogIn,
} from "lucide-react";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import DynamicLogo from "./dynamic-logo";
import { ComboBoxResponsive } from "./ui/combobox";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useRef, useState } from "react";

import {
	Convo,
	getConversations,
	getSessionMessages,
	deleteConversation,
} from "@/lib/convosNew";
import { Input } from "./ui/input";

import { cn } from "@/components/utils";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
	onDocumentManager: () => void;
	onEndpointChange?: (endpoint: string) => void;
	currentSessionId?: string;
	onNewChat: () => void;
	onConversationSelect: (sessionId: string) => void;

	currentEndpoint?: string;
	disabled?: boolean;
}

export default function Side({
	onDocumentManager,
	onEndpointChange,
	currentSessionId,
	onNewChat,
	onConversationSelect,

	currentEndpoint,
	disabled = false,
}: SidebarProps) {
	const pathname = usePathname();
	const isDevRoute = pathname === "/dev" || pathname === "/dev/";
	const [conversations, setConversations] = useState<Convo[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [messagesIndex, setMessagesIndex] = useState<Record<string, string>>(
		{},
	);
	const [filteredConversations, setFilteredConversations] = useState<Convo[]>(
		[],
	);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!currentSessionId) return;
		const loadConversations = async () => {
			const convos = await getConversations();
			setConversations(convos);
		};
		loadConversations();
	}, [currentSessionId]);

	// Keep filtered list in sync with base conversations when no search
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredConversations(conversations);
		}
	}, [conversations, searchQuery]);

	// Debounced search that matches title and message contents
	useEffect(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return;

		if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		debounceTimerRef.current = setTimeout(async () => {
			const titleMatches = conversations.filter((c) =>
				c.title.toLowerCase().includes(query),
			);

			// For conversations we haven't indexed yet, fetch messages lazily
			const toIndex = conversations.filter(
				(c) => messagesIndex[c.id] === undefined,
			);

			if (toIndex.length > 0) {
				try {
					const results = await Promise.all(
						toIndex.map(async (c) => {
							const msgs = await getSessionMessages(c.id);
							const combined = msgs
								.map((m) => m.content)
								.join("\n")
								.toLowerCase();
							return [c.id, combined] as const;
						}),
					);
					setMessagesIndex((prev) => {
						const next = { ...prev };
						for (const [id, text] of results) next[id] = text;
						return next;
					});
				} catch (e) {
					// ignore fetch errors here; search will just rely on titles
				}
			}

			// After ensuring index (best-effort), compute final matches
			const contentMatches = conversations.filter((c) => {
				const indexed = messagesIndex[c.id];
				return indexed ? indexed.includes(query) : false;
			});

			const byId: Record<string, Convo> = {};
			[...titleMatches, ...contentMatches].forEach((c) => (byId[c.id] = c));
			setFilteredConversations(Object.values(byId));
		}, 250);

		return () => {
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		};
	}, [searchQuery, conversations, messagesIndex]);

	const openDeleteDialog = (id: string) => {
		setDeleteId(id);
		setIsDeleteOpen(true);
	};
	const handleDeleteConversation = async (id: string) => {
		const success = await deleteConversation(id);

		if (success) {
			setConversations((prev) => prev.filter((c) => c.id !== id));

			if (currentSessionId === id) {
				onNewChat();
			}
		} else {
			alert("Delete failed");
		}
	};

	return (
		<TooltipProvider>
			<div className="fixed z-50">
				<Sheet>
					<SheetTrigger>
						<div className="m-2 p-2 hover:outline-1 cursor-pointer rounded-2xl active:bg-accent">
							<Menu className="" />
						</div>
					</SheetTrigger>
					<SheetContent side="left">
						<SheetHeader>
							<SheetTitle className="flex items-center gap-x-1">
								<DynamicLogo width={35} height={35} />
								ChatDKU
							</SheetTitle>
						</SheetHeader>

						<div className="px-2 flex flex-col space-y-1.5 h-full">
							<Button
								variant="inChatbox"
								className="w-full justify-start"
								onClick={onNewChat}
								disabled={disabled}
							>
								<SquarePen />
								New Chat
							</Button>

							<div className={cn(!isDevRoute && "hidden")}>
								<Button
									variant="inChatbox"
									onClick={onDocumentManager}
									className="w-full justify-start"
									disabled={disabled}
								>
									<FileText />
									Document Manager
									<ChevronRight className="ml-auto" />
								</Button>
							</div>

							<Link href="/about">
								<Button
									variant="inChatbox"
									className="w-full justify-start"
									disabled={disabled}
								>
									<MessageCircleQuestion />
									About ChatDKU
								</Button>
							</Link>
							
							<Link href="https://chatdku.dukekunshan.edu.cn/">
								<Button
									variant="inChatbox"
									className="w-full justify-start"
									disabled={disabled}
								>
									<LogIn />
									Login with Duke NetID
								</Button>
							</Link>

							<div className={cn(!isDevRoute && "hidden")}>
								<p className="ml-2 mt-4 text-sm text-muted-foreground">
									Model Selection
								</p>
								<ComboBoxResponsive
									inputValue={currentEndpoint || ""}
									onEndpointChange={onEndpointChange ?? (() => {})}
								/>
							</div>
							<TooltipProvider>
							<Tooltip>
								<TooltipContent>
									History not saved for guest users.
								</TooltipContent>
							<TooltipTrigger className="text-left opacity-50 cursor-not-allowed">
								<div>
							<p className="ml-2 mt-4 text-sm text-muted-foreground">
								Chat History
							</p>
							<div className="pb-2">
								<Input
									placeholder="Search chats"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									disabled={disabled}
								/>
							</div>
							<ScrollArea className="flex-1 min-h-0 pointer-events-none">
								<div className="space-y-1 pb-4">
									{(searchQuery.trim() ? filteredConversations : conversations)
										.length > 0 ? (
										(searchQuery.trim()
											? filteredConversations
											: conversations
										).map((conversation) => (
											<div
												key={conversation.id}
												className={cn(
													"group w-[97%] flex items-center justify-between p-2 pl-3 rounded-md hover:bg-sidebar-accent",
													currentSessionId === conversation.id &&
														"bg-sidebar-accent",
												)}
											>
												<div
													className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
													onClick={() => onConversationSelect(conversation.id)}
												>
													<MessageCircle className="h-4 w-4 shrink-0" />
													<div className="flex-1 min-w-0">
														<Tooltip delayDuration={600}>
															<TooltipTrigger asChild>
																<div className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[230px]">
																	{conversation.title}
																</div>
															</TooltipTrigger>

															<TooltipContent side="bottom" align="start">
																<p className="max-w-xs break-words">
																	{conversation.title}
																</p>
															</TooltipContent>
														</Tooltip>
														<div className="text-xs text-sidebar-foreground/60">
															{conversation.created_at.toLocaleDateString()}
														</div>
													</div>
												</div>

												{/* <DropdownMenu
													onOpenChange={(open) =>
														setActiveMenuId(open ? conversation.id : null)
													}
												>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className={cn(
																"h-8 w-8 transition-opacity",
																activeMenuId === conversation.id
																	? "opacity-100 bg-muted"
																	: "opacity-0 group-hover:opacity-100",
															)}
															onClick={(e) => e.stopPropagation()}
														>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>

													<DropdownMenuContent align="start" side="bottom">
														<DropdownMenuItem
															onClick={() => openDeleteDialog(conversation.id)}
															className="group flex items-center gap-2 text-red-500 hover:text-foreground"
														>
															<Trash2 className="h-4 w-4 text-red-500 group-hover:text-foreground" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent> 
												</DropdownMenu> */}
											</div>
										))
									) : (
										<div className="text-sm text-sidebar-foreground/60 text-center py-4">
											{searchQuery.trim()
												? "No matches"
												: "No conversations yet"}
										</div>
									)}
								</div>
							</ScrollArea>
							</div>
							</TooltipTrigger>
							</Tooltip>
							</TooltipProvider>
						</div>
					</SheetContent>
				</Sheet>
				{/*A pop-up window confirming deletion */}
				<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete chat?</DialogTitle>
						</DialogHeader>

						<p className="text-sm text-muted-foreground">
							This will permanently delete this chat history.
						</p>

						<DialogFooter className="mt-4 flex justify-end gap-2">
							<Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
								Cancel
							</Button>

							<Button
								className="bg-red-500 hover:bg-red-600 text-white"
								onClick={() => {
									if (deleteId) {
										handleDeleteConversation(deleteId);
									}
									setIsDeleteOpen(false);
								}}
							>
								Delete
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</TooltipProvider>
	);
}
