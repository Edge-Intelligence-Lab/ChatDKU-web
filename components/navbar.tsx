"use client";
import { Home, MessageCircleQuestion, SquarePen } from "lucide-react";
import { usePathname } from "next/navigation";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/components/language-provider";

// import { ModeToggle } from "@/components/ui/mode-toggle";
import DynamicLogo from "@/components/dynamic-logo";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "./ui/mode-toggle";
import { LanguageToggle } from "./ui/language-toggle";
import Link from "next/link";

export function Navbar() {
	const pathname = usePathname();
	const isDevRoute = pathname === "/dev" || pathname === "/dev/";
	const { t } = useLanguage();

	return (
		<NavigationMenu className="w-full max-w-[98vw] mx-auto flex justify-between items-center border-none fixed top-0 left-1/2 -translate-x-1/2 z-10 backdrop-blur-md lg:backdrop-blur-none bg-gradient-to-b from-background to-transparent">
			<div className="flex flex-row items-center ">
				<Link
					href={"/chat"}
					className="flex flex-row items-center p-3 pr-0 space-x-2"
				>
					<div className="w-5" />
					<DynamicLogo width={35} height={35} />
					<h2 className="flex flex-row -ml-1 gap-1 items-center font-inter text-xl md:text-xl font-bold">
						ChatDKU
						{isDevRoute && (
							// <span className="font-inter text-xs md:text-sm lg:text-sm italic text-primary/20">dev</span>
							<Badge variant="default">{t("navbar.dev")}</Badge>
						)}
						{!isDevRoute && (
							// <span className="font-inter text-xs md:text-sm lg:text-sm italic text-primary/20">dev</span>
							<Badge variant="default">{t("navbar.preview")}</Badge>
						)}
					</h2>
				</Link>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<NavigationMenuLink
								href="/about"
								className={
									isDevRoute
										? "hidden"
										: "lg:text-md flex flex-row items-center"
								}
							>
								<MessageCircleQuestion className="size-4 text-primary-500" />
							</NavigationMenuLink>
						</TooltipTrigger>
						<TooltipContent>
							<p>About</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
			<NavigationMenuList>
				<NavigationMenuItem>
					<LanguageToggle />
				</NavigationMenuItem>
				<NavigationMenuItem>
					<ModeToggle />
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}
