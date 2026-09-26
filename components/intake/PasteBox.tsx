"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClipboardPaste, LoaderCircle } from "lucide-react";

interface PasteBoxProps {
  onTextReady: (text: string, warnings: string[]) => void;
  disabled?: boolean;
  className?: string;
}

const MAX_CHARS = 150000;

export function PasteBox({ onTextReady, disabled, className }: PasteBoxProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setLoading(true);

    const warnings: string[] = [];
    let text = value.trim();
    if (text.length > MAX_CHARS) {
      warnings.push(
        `The pasted text is very long. Analysis is based on the first ${MAX_CHARS.toLocaleString("en-US")} characters.`
      );
      text = text.slice(0, MAX_CHARS);
    }

    // Small delay to show loading state
    await new Promise((r) => setTimeout(r, 100));
    onTextReady(text, warnings);
    setLoading(false);
  };

  const charCount = value.length;
  const nearLimit = charCount > MAX_CHARS * 0.8;
  const overLimit = charCount > MAX_CHARS;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1.5">
        <label
          htmlFor="paste-input"
          className="text-sm font-medium text-[var(--ink)]"
        >
          Or paste document text
        </label>
        <textarea
          id="paste-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste your contract, agreement, or policy text here…"
          disabled={disabled || loading}
          rows={8}
          className={cn(
            "w-full resize-y rounded-xl border px-4 py-3 shadow-sm",
            "text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)]",
            "bg-[var(--surface)] leading-relaxed",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent focus:shadow-md",
            "transition-all duration-300 ease-out",
            overLimit
              ? "border-[var(--risk-high)]"
              : "border-[var(--border-strong)] hover:border-[var(--primary)] hover:shadow-md",
            (disabled || loading) && "opacity-60 cursor-not-allowed"
          )}
          aria-label="Paste document text here"
          aria-describedby="paste-char-count"
        />
        <div className="flex items-center justify-between">
          <p
            id="paste-char-count"
            className={cn(
              "text-xs",
              overLimit
                ? "text-[var(--risk-high)] font-medium"
                : nearLimit
                ? "text-[var(--risk-medium)]"
                : "text-[var(--ink-faint)]"
            )}
          >
            {charCount.toLocaleString("en-US")} / {MAX_CHARS.toLocaleString("en-US")} characters
            {overLimit && " — will be trimmed"}
          </p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!value.trim() || disabled || loading}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
          "text-sm font-medium transition-all duration-300 ease-out shadow-sm",
          "bg-[var(--surface-muted)] text-[var(--ink)] border border-[var(--border-strong)]",
          "hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] hover:shadow-md hover:-translate-y-0.5",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
        )}
        aria-label="Analyze pasted text"
      >
        {loading ? (
          <LoaderCircle size={15} strokeWidth={1.5} className="animate-spin" aria-hidden="true" />
        ) : (
          <ClipboardPaste size={15} strokeWidth={1.5} aria-hidden="true" />
        )}
        {loading ? "Processing…" : "Analyze pasted text"}
      </button>
    </div>
  );
}
