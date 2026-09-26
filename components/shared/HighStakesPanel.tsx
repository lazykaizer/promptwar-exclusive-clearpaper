"use client";

import { AlertTriangle, Phone, MapPin } from "lucide-react";

interface HighStakesPanelProps {
  reason: string | null;
}

export function HighStakesPanel({ reason }: HighStakesPanelProps) {
  return (
    <div
      className="rounded-[var(--radius-card)] border-2 border-[var(--risk-high)] bg-[var(--risk-high-bg)] p-6 space-y-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={22}
          strokeWidth={1.5}
          className="text-[var(--risk-high)] mt-0.5 flex-shrink-0"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--risk-high)]">
            Talk to a professional soon
          </h3>
          {reason && (
            <p className="text-sm text-[var(--ink-muted)]">{reason}</p>
          )}
        </div>
      </div>

      <p className="text-sm text-[var(--ink)] leading-relaxed">
        This document appears to involve a matter that may have significant legal consequences. A qualified lawyer can help you understand your rights, obligations, and next steps.
      </p>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wide">
          Free legal aid in India
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Phone size={14} className="text-[var(--primary)] mt-0.5 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <span className="font-medium text-[var(--ink)]">NALSA Tele-Law Helpline: </span>
              <span className="tabular-nums">15100</span>
              <span className="text-[var(--ink-muted)]"> (free, available nationally)</span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin size={14} className="text-[var(--primary)] mt-0.5 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <span className="font-medium text-[var(--ink)]">District Legal Services Authority (DLSA)</span>
              <span className="text-[var(--ink-muted)]"> — visit your district court complex for in-person legal aid</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--ink-faint)] mt-2">
          Details provided for general information. Please verify current contact information on the official NALSA website (nalsa.gov.in).
        </p>
      </div>

      <div className="pt-2 border-t border-[var(--risk-high)] border-opacity-30">
        <p className="text-xs text-[var(--ink-muted)]">
          What to bring: any relevant documents, identification, correspondence related to this matter, and a written summary of the key dates and facts.
        </p>
      </div>
    </div>
  );
}
