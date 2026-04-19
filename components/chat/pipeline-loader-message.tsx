"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
	getPipelineLoaderHTML,
	startPipelineLoader,
	type PipelineLoaderController,
	type PipelineStep,
} from "@/lib/pipelineLoader";

export interface PipelineLoaderMessageProps {
	steps: PipelineStep[];
	/** Signals the loader to fade out. Caller should flip this to true before unmount. */
	dismissing?: boolean;
	/** Invoked when the dismiss transition finishes. */
	onDismissed?: () => void;
}

// Renders the pipeline loader as a bot message. The loader internals (icon
// cycling, label swapping) live in lib/pipelineLoader.ts and manage their own
// DOM; this component just mounts the markup and wires up the controller.
export function PipelineLoaderMessage({
	steps,
	dismissing,
	onDismissed,
}: PipelineLoaderMessageProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const controllerRef = useRef<PipelineLoaderController | null>(null);

	useEffect(() => {
		if (!rootRef.current) return;
		controllerRef.current = startPipelineLoader(rootRef.current, { steps });
		return () => {
			controllerRef.current = null;
		};
	}, [steps]);

	useEffect(() => {
		if (!dismissing) return;
		let cancelled = false;
		controllerRef.current?.dismiss().then(() => {
			if (!cancelled) onDismissed?.();
		});
		return () => {
			cancelled = true;
		};
	}, [dismissing, onDismissed]);

	return (
		<div className="flex w-full">
			<div className="flex flex-col items-start w-full sm:max-w-[85%]">
				<div className="flex flex-col lg:flex-row gap-3 px-4 py-2 rounded-3xl w-full overflow-hidden text-sm">
					<div className="flex-shrink-0">
						<div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center">
							<Image
								src="/logos/new_logo.svg"
								alt="ChatDKU"
								width={32}
								height={32}
								className="p-1.5"
							/>
						</div>
					</div>
					<div
						ref={rootRef}
						className="text-left overflow-hidden"
						dangerouslySetInnerHTML={{
							__html: getPipelineLoaderHTML(steps[0]?.label ?? ""),
						}}
					/>
				</div>
			</div>
		</div>
	);
}
