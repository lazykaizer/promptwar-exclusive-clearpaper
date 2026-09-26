"use client";

import { ShieldCheck, AlertCircle, HelpCircle, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/lib/verify";

interface VerifyBadgeProps {
  status: VerificationStatus;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<
  VerificationStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    className: "text-[var(--risk-low)] bg-[var(--risk-low-bg)]",
  },
  close: {
    label: "Close match",
    icon: AlertCircle,
    className: "text-[var(--risk-medium)] bg-[var(--risk-medium-bg)]",
  },
  unverified: {
    label: "Could not verify",
    icon: HelpCircle,
    className: "text-[var(--ink-faint)] bg-[var(--surface-muted)]",
  },
};

export function VerifyBadge({ status, size = "sm", className }: VerifyBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isSmall = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        isSmall ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        config.className,
        className
      )}
      title={
        status === "verified"
          ? "This quote was found verbatim in the document"
          : status === "close"
          ? "This quote closely matches text in the document"
          : "This quote could not be verified in the document"
      }
      aria-label={config.label}
    >
      <Icon size={isSmall ? 11 : 13} strokeWidth={1.5} aria-hidden="true" />
      {config.label}
    </span>
  );
}

interface QuoteBlockProps {
  quote: string;
  verificationStatus?: VerificationStatus;
  onClickHighlight?: () => void;
  className?: string;
}

export function QuoteBlock({
  quote,
  verificationStatus,
  onClickHighlight,
  className,
}: QuoteBlockProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg p-4 border-l-4",
        "bg-[var(--surface-muted)] border-[var(--border-strong)]",
        onClickHighlight &&
          verificationStatus !== "unverified" &&
          "cursor-pointer hover:bg-[var(--highlight)] transition-colors duration-150",
        className
      )}
      onClick={
        onClickHighlight && verificationStatus !== "unverified"
          ? onClickHighlight
          : undefined
      }
      role={
        onClickHighlight && verificationStatus !== "unverified"
          ? "button"
          : undefined
      }
      tabIndex={
        onClickHighlight && verificationStatus !== "unverified" ? 0 : undefined
      }
      onKeyDown={
        onClickHighlight && verificationStatus !== "unverified"
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClickHighlight();
              }
            }
          : undefined
      }
      aria-label={
        onClickHighlight && verificationStatus !== "unverified"
          ? "Click to highlight this quote in the document"
          : undefined
      }
    >
      <Quote
        size={14}
        className="absolute top-3 right-3 text-[var(--ink-faint)]"
        aria-hidden="true"
      />
      <p className="text-sm leading-relaxed italic text-[var(--ink-muted)] font-serif pr-5">
        {quote}
      </p>
      {verificationStatus && (
        <div className="mt-2 flex justify-end">
          <VerifyBadge status={verificationStatus} />
        </div>
      )}
    </div>
  );
}
