"use client";

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { QuoteBlock } from "@/components/shared/QuoteBlock";
import { SkeletonCard, SectionError, SectionEmpty } from "@/components/shared/SectionState";
import { verifyQuote } from "@/lib/verify";
import { useDocumentStore } from "@/store/useStore";
import type { ClausesResult, Risk, Category } from "@/lib/schemas";
import { Search, SlidersHorizontal } from "lucide-react";

interface ClausesTabProps {
  clauses: ClausesResult | null;
  documentText: string;
  status: "idle" | "loading" | "done" | "error";
  error: string | null;
  onRetry: () => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  payment: "Payment",
  termination: "Termination",
  liability: "Liability",
  ip: "IP",
  confidentiality: "Confidentiality",
  non_compete: "Non-compete",
  renewal: "Renewal",
  dispute_resolution: "Dispute",
  deposit: "Deposit",
  maintenance: "Maintenance",
  privacy: "Privacy",
  other: "Other",
};

const RISK_ORDER: Record<Risk, number> = { high: 0, medium: 1, low: 2, info: 3 };

export function ClausesTab({ clauses, documentText, status, error, onRetry }: ClausesTabProps) {
  const { setActiveHighlight, addHighlight } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<Risk | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<"risk" | "document">("risk");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const processedClauses = useMemo(() => {
    if (!clauses?.clauses) return [];

    let result = (clauses.clauses || []).map((clause) => {
      const verification = verifyQuote(clause.quote, documentText);
      return { ...clause, verification };
    });

    // Filter
    if (filterRisk) result = result.filter((c) => c.risk === filterRisk);
    if (filterCategory) result = result.filter((c) => c.category === filterCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.plain_explanation.toLowerCase().includes(q) ||
          c.quote.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "risk") {
      result.sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]);
    }

    return result;
  }, [clauses, documentText, filterRisk, filterCategory, searchQuery, sortBy]);

  // Sync highlights to store when clauses load
  useEffect(() => {
    if (!clauses?.clauses) return;
    clauses.clauses.forEach((clause) => {
      const verification = verifyQuote(clause.quote, documentText);
      addHighlight({
        quoteText: clause.quote,
        status: verification.status,
        startOffset: verification.startOffset,
        endOffset: verification.endOffset,
        sourceId: clause.id,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clauses?.clauses]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-6">
        <SectionError message={error || "Could not load clauses."} onRetry={onRetry} />
      </div>
    );
  }

  if (!clauses || clauses.clauses.length === 0) {
    return (
      <SectionEmpty
        title="No clauses found"
        description="The AI did not identify any significant clauses in this document."
        className="p-6"
      />
    );
  }

  const availableCategories = [...new Set((clauses.clauses || []).map((c) => c.category))];

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3 space-y-2">
        {/* Search */}
        <div className="flex items-center gap-2 border border-[var(--border-strong)] rounded-lg px-3 py-1.5">
          <Search size={14} strokeWidth={1.5} className="text-[var(--ink-faint)]" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search clauses…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-0 focus:outline-none text-[var(--ink)] placeholder:text-[var(--ink-faint)]"
            aria-label="Search clauses"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={13} strokeWidth={1.5} className="text-[var(--ink-faint)]" aria-hidden="true" />

          {/* Risk filter */}
          {(["high", "medium", "low", "info"] as Risk[]).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRisk(filterRisk === r ? null : r)}
              className={cn(
                "px-2 py-0.5 text-xs rounded-full border transition-colors",
                filterRisk === r
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--primary)]"
              )}
              aria-pressed={filterRisk === r}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}

          <span className="text-[var(--border-strong)] text-sm">|</span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "risk" | "document")}
            className="text-xs bg-transparent border-0 focus:outline-none text-[var(--ink-muted)] cursor-pointer"
            aria-label="Sort clauses by"
          >
            <option value="risk">Sort: Risk</option>
            <option value="document">Sort: Doc order</option>
          </select>

          <span className="ml-auto text-xs text-[var(--ink-faint)]">
            {processedClauses.length} clause{processedClauses.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Clause cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {processedClauses.length === 0 ? (
          <SectionEmpty
            title="No clauses match your filters"
            description="Try adjusting your search or filter criteria."
          />
        ) : (
          processedClauses.map((clause) => (
            <ClauseCard
              key={clause.id}
              clause={clause}
              isExpanded={expandedId === clause.id}
              onToggle={() => setExpandedId(expandedId === clause.id ? null : clause.id)}
              onHighlight={() => {
                if (clause.verification.status !== "unverified") {
                  setActiveHighlight(clause.id);
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ClauseCardProps {
  clause: {
    id: string;
    title: string;
    category: Category;
    risk: Risk;
    quote: string;
    plain_explanation: string;
    why_it_matters: string;
    verification: ReturnType<typeof verifyQuote>;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onHighlight: () => void;
}

function ClauseCard({ clause, isExpanded, onToggle, onHighlight }: ClauseCardProps) {
  const riskColors: Record<Risk, string> = {
    high: "var(--risk-high)",
    medium: "var(--risk-medium)",
    low: "var(--risk-low)",
    info: "var(--info)",
  };

  return (
    <article
      className="border border-[var(--border)] rounded-[var(--radius-card)] overflow-hidden bg-[var(--surface)]"
      style={{ borderLeft: `4px solid ${riskColors[clause.risk]}` }}
      aria-label={`Clause: ${clause.title}`}
    >
      {/* Header */}
      <button
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-[var(--surface-muted)] transition-colors"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--ink)] leading-snug">{clause.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <RiskBadge risk={clause.risk} />
            <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--surface-muted)] text-[var(--ink-faint)] border border-[var(--border)]">
              {CATEGORY_LABELS[clause.category]}
            </span>
          </div>
        </div>
        <span className="text-[var(--ink-faint)] text-lg mt-0.5 flex-shrink-0" aria-hidden="true">
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--border)]">
          {/* Quote */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide mb-2">
              Original clause
            </p>
            <QuoteBlock
              quote={clause.quote}
              verificationStatus={clause.verification.status}
              onClickHighlight={clause.verification.status !== "unverified" ? onHighlight : undefined}
            />
          </div>

          {/* Plain explanation */}
          <div>
            <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide mb-1.5">
              In plain words
            </p>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{clause.plain_explanation}</p>
          </div>

          {/* Why it matters */}
          <div className="p-3 rounded-lg bg-[var(--primary-soft)] border border-[var(--primary-soft)]">
            <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wide mb-1">
              Why it matters to you
            </p>
            <p className="text-sm text-[var(--ink)] leading-relaxed">{clause.why_it_matters}</p>
          </div>
        </div>
      )}
    </article>
  );
}
