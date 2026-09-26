"use client";

import { cn } from "@/lib/utils";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

// ─── Skeleton loading state ───────────────────────────────────────────────────

interface SkeletonProps {
  lines?: number;
  className?: string;
}

export function SkeletonBlock({ lines = 4, className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-label="Loading…">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn("skeleton h-4 rounded", i === lines - 1 ? "w-3/4" : "w-full")}
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border border-[var(--border)] rounded-[var(--radius-card)] p-5 space-y-4",
        className
      )}
      aria-busy="true"
    >
      <div className="flex items-start justify-between">
        <div className="skeleton h-5 w-2/5 rounded" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <SkeletonBlock lines={3} />
    </div>
  );
}

// ─── Section error state ──────────────────────────────────────────────────────

interface SectionErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function SectionError({ message, onRetry, className }: SectionErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 py-10 px-6 text-center rounded-[var(--radius-card)]",
        "border border-[var(--risk-high-bg)] bg-[var(--risk-high-bg)]",
        className
      )}
      role="alert"
    >
      <AlertTriangle
        size={32}
        strokeWidth={1.5}
        className="text-[var(--risk-high)]"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--risk-high)]">
          Something went wrong
        </p>
        <p className="text-sm text-[var(--ink-muted)] max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--risk-high)] text-[var(--risk-high)] hover:bg-white transition-colors"
        >
          <RefreshCw size={14} strokeWidth={1.5} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

interface SectionEmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function SectionEmpty({
  icon,
  title,
  description,
  className,
}: SectionEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-12 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="text-[var(--ink-faint)] mb-1">{icon}</div>
      )}
      <p className="text-sm font-medium text-[var(--ink-muted)]">{title}</p>
      {description && (
        <p className="text-sm text-[var(--ink-faint)] max-w-xs">{description}</p>
      )}
    </div>
  );
}

// ─── Loading spinner ──────────────────────────────────────────────────────────

export function LoadingSpinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <Loader2
      size={size}
      strokeWidth={1.5}
      className={cn("animate-spin text-[var(--primary)]", className)}
      aria-label="Loading"
    />
  );
}
