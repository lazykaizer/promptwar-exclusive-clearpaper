"use client";

import { cn } from "@/lib/utils";
import { RiskGauge } from "@/components/shared/RiskGauge";
import { HighStakesPanel } from "@/components/shared/HighStakesPanel";
import { SkeletonBlock, SectionError } from "@/components/shared/SectionState";
import type { Summary } from "@/lib/schemas";
import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useDocumentStore } from "@/store/useStore";

interface OverviewTabProps {
  summary: Summary | null;
  status: "idle" | "loading" | "done" | "error";
  error: string | null;
  onRetry: () => void;
}

export function OverviewTab({ summary, status, error, onRetry }: OverviewTabProps) {
  const { showSimpleSummary, setShowSimpleSummary } = useDocumentStore();

  if (status === "loading" || status === "idle") {
    return (
      <div className="space-y-6 p-6">
        <SkeletonBlock lines={3} />
        <div className="h-12 skeleton rounded-full" />
        <SkeletonBlock lines={5} />
        <SkeletonBlock lines={4} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-6">
        <SectionError message={error || "Could not load overview."} onRetry={onRetry} />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="p-6 space-y-6" aria-label="Document overview">
      {/* Not a legal document notice */}
      {!summary.is_legal_document && (
        <div className="flex items-start gap-3 p-4 rounded-[var(--radius-card)] bg-[var(--risk-medium-bg)] border border-[var(--risk-medium)] border-opacity-30">
          <Info size={16} strokeWidth={1.5} className="text-[var(--risk-medium)] flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-[var(--ink-muted)]">
            This document does not appear to be a standard legal or contractual document. The analysis below is based on what was found in the text.
          </p>
        </div>
      )}

      {/* High stakes */}
      {summary.high_stakes_flag.triggered && (
        <HighStakesPanel reason={summary.high_stakes_flag.reason} />
      )}

      {/* Document type & parties */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
            {summary.doc_type}
          </span>
          {summary.governing_law && (
            <span className="px-2.5 py-1 text-xs rounded-full bg-[var(--surface-muted)] text-[var(--ink-muted)] border border-[var(--border)]">
              {summary.governing_law}
            </span>
          )}
        </div>

        {summary.parties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {summary.parties?.map((p, i) => (
              <div key={i} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                <span className="font-medium text-[var(--ink)]">{p.name}</span>
                <span className="text-[var(--ink-faint)]"> · {p.role}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-[var(--ink-muted)]">
          {summary.effective_date && (
            <span><span className="text-[var(--ink-faint)]">Effective: </span>{summary.effective_date}</span>
          )}
          {summary.term && (
            <span><span className="text-[var(--ink-faint)]">Term: </span>{summary.term}</span>
          )}
        </div>
      </div>

      <hr className="border-[var(--border)]" />

      {/* Risk gauge */}
      <section aria-labelledby="risk-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="risk-heading" className="text-base font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
            Overall Risk
          </h2>
          <span className="text-xs text-[var(--ink-faint)] bg-[var(--surface-muted)] px-2 py-0.5 rounded">
            AI-generated · verify with source
          </span>
        </div>
        <RiskGauge risk={summary.overall_risk} reason={summary.overall_risk_reason} />
      </section>

      <hr className="border-[var(--border)]" />

      {/* Key facts */}
      {summary.key_facts.length > 0 && (
        <section aria-labelledby="key-facts-heading">
          <h2 id="key-facts-heading" className="text-base font-semibold text-[var(--ink)] mb-3" style={{ fontFamily: "var(--font-serif)" }}>
            Key Facts
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {summary.key_facts?.map((fact, i) => (
              <div key={i} className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
                <p className="text-xs text-[var(--ink-faint)] mb-0.5">{fact.label}</p>
                <p className="text-sm font-medium text-[var(--ink)] tabular-nums">{fact.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <hr className="border-[var(--border)]" />

      {/* Plain summary */}
      <section aria-labelledby="summary-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="summary-heading" className="text-base font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
            Plain-Language Summary
          </h2>
          <button
            onClick={() => setShowSimpleSummary(!showSimpleSummary)}
            className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-1 transition-colors"
            aria-pressed={showSimpleSummary}
            aria-label="Toggle to simpler explanation"
          >
            {showSimpleSummary ? (
              <>Standard <ChevronUp size={12} /></>
            ) : (
              <>Explain like I&apos;m new to this <ChevronDown size={12} /></>
            )}
          </button>
        </div>
        <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
          {showSimpleSummary ? summary.simple_summary : summary.plain_summary}
        </p>
      </section>

      <hr className="border-[var(--border)]" />

      {/* Top 3 things */}
      <section aria-labelledby="top-things-heading">
        <h2 id="top-things-heading" className="text-base font-semibold text-[var(--ink)] mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          3 Things to Know Before Signing
        </h2>
        <ol className="space-y-2">
          {summary.top_things_to_know?.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-[var(--primary)] bg-[var(--primary-soft)]"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-[var(--ink-muted)] pt-0.5">{item}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
