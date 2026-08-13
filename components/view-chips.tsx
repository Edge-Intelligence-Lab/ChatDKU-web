"use client";

import { Map, CalendarDays } from "lucide-react";

interface ViewChipsProps {
	onCampusMap: () => void;
	onAcademicCalendar: () => void;
}

/** Quick tool cards shown above the prompt suggestions on the chat homepage */
export function ViewChips({ onCampusMap, onAcademicCalendar }: ViewChipsProps) {
	return (
		<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 mt-16 sm:mt-27 px-2">
			<span className="text-sm sm:text-base text-muted-foreground">
				More features:
			</span>
			<div className="flex flex-row justify-center gap-2 sm:gap-3">
				{/* Campus Map */}
				<button
					type="button"
					onClick={onCampusMap}
					className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-foreground/10 bg-background/60 text-left shadow-none hover:border-foreground/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
				>
					<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
						<Map className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					</div>
					<span className="text-xs sm:text-sm text-foreground">
						Campus Map
					</span>
				</button>

				{/* Academic Calendar */}
				<button
					type="button"
					onClick={onAcademicCalendar}
					className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-foreground/10 bg-background/60 text-left shadow-none hover:border-foreground/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
				>
					<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
						<CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
					</div>
					<span className="text-xs sm:text-sm text-foreground">
						Academic Calendar
					</span>
				</button>
			</div>
		</div>
	);
}
