"use client";

import { CornerRightUp } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/components/utils";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";

export function AIInput({
  id = "ai-input",
  placeholder = "Type your message...",
  minHeight = 40,
  maxHeight = 200,
  onSubmit,
  onInputChange,
  className,
  thinkingMode,
  onThinkingModeChange,
  onEndpointChange,
  disabled = false,
}: {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onInputChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
  thinkingMode?: boolean;
  searchMode?: string;
  onThinkingModeChange?: (value: boolean) => void;
  onEndpointChange?: (endpoint: string) => void;
  onSearchModeChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(thinkingMode || false);

  const inputButtonStyle = cn(
    "flex items-center justify-around gap-1 p-2 text-sm min-w-[45px] min-h-[45px] rounded-4xl cursor-pointer border-transparent hover:border-foreground/10 border-1 hover:shadow-md active:text-foreground active:bg-foreground/10 transition-all duration-200",
  );

  useEffect(() => {
    if (thinkingMode !== undefined && thinkingMode !== isThinking) {
      setIsThinking(thinkingMode);
    }
  }, [thinkingMode]);

  const toggleThinkingMode = () => {
    if (disabled) return;
    const newValue = !isThinking;
    setIsThinking(newValue);
    onThinkingModeChange?.(newValue);
  };

  // Listen for external value changes through the input event
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = (e: Event) => {
      if (disabled) return;
      const target = e.target as HTMLTextAreaElement;
      setInputValue(target.value);
      onInputChange?.(target.value);
      adjustHeight();
    };

    textarea.addEventListener("input", handleInput);
    return () => textarea.removeEventListener("input", handleInput);
  }, [textareaRef, adjustHeight, onInputChange, disabled]);

  const handleReset = () => {
    if (disabled) return;
    if (!inputValue.trim()) return;
    onSubmit?.(inputValue);
    setInputValue("");
    adjustHeight(true);
  };

  return (
    <div className={cn("w-full py-2", className)}>
      <div
        className={cn(
          "relative max-w-2xl w-full mx-auto",
          "rounded-3xl p-1 bg-background dark:bg-accent shadow-sm",
          "border border-foreground/10 ring-black/20 dark:ring-white/20",
          "overflow-y-auto resize-none",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
          "transition-[height] duration-75 ease-in-out",
          "[&::-webkit-resizer]:hidden",
          "transition-all duration-200",
          inputValue
            ? "shadow-[0_0_12px_rgba(46,185,224,1)] animate-shadow-pulse"
            : "",
        )}
      >
        <style>
          {`
					@keyframes shadow-pulse {
						0% {
							box-shadow: 0 0 6px rgba(46 159 224 / 0.4);
						}
						50% {
							box-shadow: 0 0 9px #00DB6E5A;
						}
						100% {
							box-shadow: 0 0 6px rgba(46 159 224 / 0.4);
						}
					}
					.animate-shadow-pulse {
						animation: shadow-pulse 2s infinite;
					}
					`}
        </style>

        <div className="flex flex-row items-center">
          <Textarea
            autoFocus
            id={id}
            placeholder={placeholder}
            className={cn(
              "placeholder:text-black/40 dark:placeholder:text-white/40",
              "text-black dark:text-white text-wrap",
              "overflow-y-auto resize-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "pt-2 border-none bg-transparent",
              `min-h-[${minHeight}px] max-h-[${maxHeight}px]`,
              "[&::-webkit-resizer]:hidden",
            )}
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              if (disabled) return;
              const newValue = e.target.value;
              setInputValue(newValue);
              onInputChange?.(newValue);
              if (!newValue.trim()) {
                adjustHeight(true);
              } else {
                requestAnimationFrame(() => adjustHeight());
              }
            }}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReset();
              }
            }}
            disabled={disabled}
          />
          <div>
            <button
              onClick={handleReset}
              type="button"
              className={cn(
                inputButtonStyle,
                inputValue
                  ? "opacity-100 scale-100"
                  : "hidden opacity-0 scale-50",
              )}
              disabled={disabled}
            >
              <CornerRightUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
