"use client";

import {
	Map,
	Menu,
	MessageCircle,
	MessageCircleQuestion,
	SquarePen,
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

import { useLanguage } from "@/components/language-provider";
import Image from "next/image";

interface SidebarProps {
	onCampusMap: () => void;
	onEndpointChange?: (endpoint: string) => void;
	onNewChat: () => void;
	onConversationSelect: (sessionId: string) => void;

	currentEndpoint?: string;
}

export default function Side({
	onCampusMap,
	onEndpointChange,
	onNewChat,
	onConversationSelect,

	currentEndpoint,
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
	const { t } = useLanguage();

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

			if (false) {
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
							<SheetTitle>
								<Link
									href={"/"}
									className="flex items-center gap-x-1 font-inter font-bold"
								>
									<Image
										src="/logos/new_logo.svg"
										alt="Logo"
										className="relative"
										priority
										loading="eager"
										width={30}
										height={30}
									/>
									ChatDKU
								</Link>
							</SheetTitle>
						</SheetHeader>

						<div className="px-2 flex flex-col space-y-1.5 h-full">
							<Button
								variant="inChatbox"
								className="w-full justify-start"
								onClick={onNewChat}
							>
								<SquarePen />
								{t("side.newChat")}
							</Button>
							<Button
								variant="inChatbox"
								className="w-full justify-start"
								onClick={onCampusMap}
							>
								<Map />
								{t("side.campusResources")}
							</Button>

							<Link href="/about">
								<Button variant="inChatbox" className="w-full justify-start">
									<MessageCircleQuestion />
									{t("side.aboutChatDKU")}
								</Button>
							</Link>

							<Link href="https://chatdku.dukekunshan.edu.cn/">
								<Button variant="inChatbox" className="w-full justify-start">
									<LogIn />
									{t("side.loginNetID")}
								</Button>
							</Link>

							<div className={cn(!isDevRoute && "hidden")}>
								<p className="ml-2 mt-4 text-sm text-muted-foreground">
									{t("side.modelSelection")}
								</p>
								<ComboBoxResponsive
									inputValue={currentEndpoint || ""}
									onEndpointChange={onEndpointChange ?? (() => {})}
								/>
							</div>
							<TooltipProvider>
								<Tooltip>
									<TooltipContent>{t("side.historyDisabled")}</TooltipContent>
									<TooltipTrigger className="text-left opacity-50 cursor-not-allowed">
										<div>
											<p className="ml-2 mt-4 text-sm text-muted-foreground">
												{t("side.chatHistory")}
											</p>
											<div className="pb-2">
												<Input
													placeholder={t("side.searchChats")}
													value={searchQuery}
													onChange={(e) => setSearchQuery(e.target.value)}
												/>
											</div>
											<ScrollArea className="flex-1 min-h-0 pointer-events-none">
												<div className="space-y-1 pb-4">
													{(searchQuery.trim()
														? filteredConversations
														: conversations
													).length > 0 ? (
														(searchQuery.trim()
															? filteredConversations
															: conversations
														).map((conversation) => (
															<div
																key={conversation.id}
																className={cn(
																	"group w-[97%] flex items-center justify-between p-2 pl-3 rounded-md hover:bg-sidebar-accent",
																	false && "bg-sidebar-accent",
																)}
															>
																<div
																	className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
																	onClick={() =>
																		onConversationSelect(conversation.id)
																	}
																>
																	<MessageCircle className="h-4 w-4 shrink-0" />
																	<div className="flex-1 min-w-0">
																		<Tooltip delayDuration={600}>
																			<TooltipTrigger asChild>
																				<div className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[230px]">
																					{conversation.title}
																				</div>
																			</TooltipTrigger>

																			<TooltipContent
																				side="bottom"
																				align="start"
																			>
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
															</div>
														))
													) : (
														<div className="text-sm text-sidebar-foreground/60 text-center py-4">
															{searchQuery.trim()
																? t("side.noMatches")
																: t("side.noConversations")}
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
							<DialogTitle>{t("side.deleteChat")}</DialogTitle>
						</DialogHeader>

						<p className="text-sm text-muted-foreground">
							{t("side.deleteConfirm")}
						</p>

						<DialogFooter className="mt-4 flex justify-end gap-2">
							<Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
								{t("side.cancel")}
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
								{t("side.delete")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</TooltipProvider>
	);
}
