// Animated "what the agent is doing right now" indicator shown while the user
// waits for the first response chunk. Today the steps are scripted on a timer
// purely for perceived-latency reasons. In the future, callers can drive the
// current step from real agent pipeline state by passing a custom `steps`
// array and calling `controller.setStep(id)` as events arrive.

export type PipelineStep = { id: string; label: string };

export const DEFAULT_PIPELINE_STEP_IDS = [
	"vector",
	"keyword",
	"database",
	"evaluate",
	"refine",
	"synthesize",
] as const;

export type DefaultPipelineStepId = (typeof DEFAULT_PIPELINE_STEP_IDS)[number];

const STEP_DURATION_MS = 3000;
const LABEL_SWAP_MS = 180;
const DISMISS_MS = 220;
const STYLE_ID = "pipeline-loader-style";

// Inner path markup for each cycling icon (search, file-search, compass, radar,
// sparkles). Rendered inside a shared <svg> by renderIcons().
const ICON_PATHS: readonly string[] = [
	'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
	'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="m13.3 16.3 1.7 1.7"/>',
	'<circle cx="12" cy="12" r="10"/><path d="m16 8-4 8-4-4 8-4Z"/>',
	'<path d="M21 12a9 9 0 1 1-9-9"/><path d="M22 12a10 10 0 1 1-10-10"/><path d="M14.31 8.69 21 2"/><circle cx="12" cy="12" r="0.5"/>',
	'<path d="M12 3l1.9 3.9L18 9l-4.1 2.1L12 15l-1.9-3.9L6 9l4.1-2.1Z"/><path d="M20 17l.95 1.95L23 20l-1.95.95L20 23l-.95-2.05L17 20l2.05-.95Z"/><path d="M4 17l.95 1.95L7 20l-1.95.95L4 23l-.95-2.05L1 20l2.05-.95Z"/>',
];

const ICON_CYCLE_MS = STEP_DURATION_MS * ICON_PATHS.length;

const SVG_PROPS =
	'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';

const renderIcons = (): string =>
	ICON_PATHS.map(
		(paths, i) =>
			`<svg ${SVG_PROPS} class="absolute inset-0 icon-cycle" style="animation-delay:${i * STEP_DURATION_MS}ms">${paths}</svg>`,
	).join("");

const ensureStyles = () => {
	if (typeof document === "undefined") return;
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement("style");
	style.id = STYLE_ID;
	// Each icon shares the same animation; we stagger them by one step via
	// inline `animation-delay`. The cycle is exactly ICON_PATHS.length steps,
	// so icon N takes its turn at step N and hands off at step N+1.
	//
	// `fill-mode: backwards` is the key fix: without it, icons with a positive
	// delay render at their default opacity (i.e. fully visible) until their
	// animation begins — which stacks all icons on top of each other at t=0.
	// Backwards mode applies the 0% keyframe during the delay so icons stay
	// hidden until their turn.
	//
	// The keyframe holds each icon fully opaque for one step-worth of its
	// cycle (0%..20% of 5 steps) and uses the last 3% as a soft crossfade that
	// overlaps with the next icon ramping up from its own 0%.
	style.innerHTML = `
    @keyframes cdkuIconCycle {
      0%   { opacity: 0; transform: scale(0.92); }
      3%   { opacity: 1; transform: scale(1); }
      20%  { opacity: 1; transform: scale(1); }
      23%  { opacity: 0; transform: scale(1.04); }
      100% { opacity: 0; }
    }
    @keyframes cdkuDotPulse {
      0%, 20%   { opacity: 0.2; }
      50%       { opacity: 1; }
      80%, 100% { opacity: 0.2; }
    }
    .cdku-pipeline {
      transition: opacity ${DISMISS_MS}ms ease-out, transform ${DISMISS_MS}ms ease-out;
    }
    .cdku-pipeline.is-dismissing { opacity: 0; transform: translateY(-4px); }
    .cdku-pipeline .icon-cycle {
      animation: cdkuIconCycle ${ICON_CYCLE_MS}ms linear infinite backwards;
    }
    .cdku-pipeline .dot {
      width: 3px; height: 3px; border-radius: 9999px;
      background-color: currentColor; display: inline-block; margin-left: 3px;
      opacity: 0.2; animation: cdkuDotPulse 1200ms ease-in-out infinite;
    }
    .cdku-pipeline .dot:nth-child(2) { animation-delay: 150ms; }
    .cdku-pipeline .dot:nth-child(3) { animation-delay: 300ms; }
    .cdku-pipeline .pipeline-label {
      display: inline-block;
      transition: opacity ${LABEL_SWAP_MS}ms ease-out, transform ${LABEL_SWAP_MS}ms ease-out;
    }
    .cdku-pipeline .pipeline-label.is-swapping { opacity: 0; transform: translateY(-2px); }
  `;
	document.head.appendChild(style);
};

export const getPipelineLoaderHTML = (initialLabel: string): string => `
  <div class="cdku-pipeline flex items-center gap-2 sm:gap-2.5 text-foreground/80">
    <div class="relative inline-flex items-center justify-center align-middle" style="width:1em;height:1em;">
      ${renderIcons()}
    </div>
    <div class="text-xs sm:text-sm leading-none tracking-tight">
      <span class="pipeline-label opacity-80" data-pipeline-label>${initialLabel}</span>
      <span class="ml-1 inline-flex align-middle">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </span>
    </div>
  </div>
`;

export interface PipelineLoaderController {
	/** Jump to a specific step by id. No-op if already dismissed or id not found. */
	setStep: (id: string) => void;
	/** Fade out the loader. Resolves once the transition finishes. */
	dismiss: () => Promise<void>;
}

export interface StartPipelineLoaderOptions {
	steps: PipelineStep[];
	/** Time before auto-advancing to the next step. Last step is held indefinitely. */
	stepDurationMs?: number;
}

export const startPipelineLoader = (
	root: Element | null,
	{ steps, stepDurationMs = STEP_DURATION_MS }: StartPipelineLoaderOptions,
): PipelineLoaderController => {
	ensureStyles();

	const wrapper = root?.querySelector<HTMLElement>(".cdku-pipeline") ?? null;
	const labelEl =
		root?.querySelector<HTMLElement>("[data-pipeline-label]") ?? null;

	let idx = 0;
	let dismissed = false;
	let timer: ReturnType<typeof setTimeout> | null = null;

	const clearTimer = () => {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	};

	const writeLabel = (label: string) => {
		if (!labelEl) return;
		labelEl.classList.add("is-swapping");
		setTimeout(() => {
			if (dismissed) return;
			labelEl.textContent = label;
			labelEl.classList.remove("is-swapping");
		}, LABEL_SWAP_MS);
	};

	const scheduleAdvance = () => {
		clearTimer();
		if (idx >= steps.length - 1) return; // hold on the final step
		timer = setTimeout(() => {
			if (dismissed) return;
			idx += 1;
			writeLabel(steps[idx].label);
			scheduleAdvance();
		}, stepDurationMs);
	};

	scheduleAdvance();

	return {
		setStep: (id) => {
			if (dismissed) return;
			const next = steps.findIndex((s) => s.id === id);
			if (next === -1 || next === idx) return;
			idx = next;
			writeLabel(steps[idx].label);
			scheduleAdvance();
		},
		dismiss: () =>
			new Promise<void>((resolve) => {
				if (dismissed) {
					resolve();
					return;
				}
				dismissed = true;
				clearTimer();
				if (!wrapper) {
					resolve();
					return;
				}
				wrapper.classList.add("is-dismissing");
				setTimeout(resolve, DISMISS_MS);
			}),
	};
};
