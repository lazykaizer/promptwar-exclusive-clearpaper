"use client";

import Link from "next/link";
import { Info } from "lucide-react";

export function DisclaimerBar() {
  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--surface-muted)] border-b border-[var(--border)] text-center"
      role="note"
      aria-label="Legal disclaimer"
    >
      <Info size={13} strokeWidth={1.5} className="text-[var(--ink-faint)] flex-shrink-0" aria-hidden="true" />
      <p className="text-xs text-[var(--ink-muted)]">
        General information to help you understand documents.{" "}
        <strong className="font-medium text-[var(--ink)]">Not legal advice.</strong>{" "}
        For decisions with real consequences, consult a qualified lawyer.{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          How it works
        </Link>
      </p>
    </div>
  );
}
