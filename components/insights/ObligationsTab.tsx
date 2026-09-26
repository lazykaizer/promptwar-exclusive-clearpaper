"use client";

import { SkeletonBlock, SectionError, SectionEmpty } from "@/components/shared/SectionState";
import { QuoteBlock } from "@/components/shared/QuoteBlock";
import { verifyQuote } from "@/lib/verify";
import { generateICS, buildCalendarEvents } from "@/lib/ics";
import type { ObligationsResult } from "@/lib/schemas";
import { Download, CalendarDays, DollarSign, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ObligationsTabProps {
  obligations: ObligationsResult | null;
  documentText: string;
  documentTitle: string;
  status: "idle" | "loading" | "done" | "error";
  error: string | null;
  onRetry: () => void;
}

export function ObligationsTab({
  obligations,
  documentText,
  documentTitle,
  status,
  error,
  onRetry,
}: ObligationsTabProps) {
  if (status === "loading" || status === "idle") {
    return (
      <div className="p-6 space-y-6">
        <SkeletonBlock lines={4} />
        <SkeletonBlock lines={3} />
        <SkeletonBlock lines={4} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-6">
        <SectionError message={error || "Could not load obligations."} onRetry={onRetry} />
      </div>
    );
  }

  if (!obligations) return null;

  const userObligations = obligations.obligations.filter((o) => o.party === "user");
  const otherObligations = obligations.obligations.filter((o) => o.party === "other");

  function downloadICS() {
    if (!obligations) return;
    const events = buildCalendarEvents(obligations.date_items, documentTitle);
    if (events.length === 0) {
      alert("No explicit dates found in this document to add to calendar.");
      return;
    }
    const icsContent = generateICS(events, `${documentTitle} — Key Dates`);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clearpaper-key-dates.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-8" aria-label="Obligations and dates">
      {/* Your obligations */}
      <section aria-labelledby="your-obligations-heading">
        <h2
          id="your-obligations-heading"
          className="text-base font-semibold text-[var(--ink)] mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          What you must do
        </h2>
        {userObligations.length === 0 ? (
          <SectionEmpty title="No obligations found for your role" />
        ) : (
          <div className="space-y-3">
            {userObligations.map((o) => (
              <ObligationCard key={o.id} obligation={o} documentText={documentText} />
            ))}
          </div>
        )}
      </section>

      <hr className="border-[var(--border)]" />

      {/* Other party obligations */}
      <section aria-labelledby="other-obligations-heading">
        <h2
          id="other-obligations-heading"
          className="text-base font-semibold text-[var(--ink)] mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          What the other party must do
        </h2>
        {otherObligations.length === 0 ? (
          <SectionEmpty title="No obligations found for the other party" />
        ) : (
          <div className="space-y-3">
            {otherObligations.map((o) => (
              <ObligationCard key={o.id} obligation={o} documentText={documentText} />
            ))}
          </div>
        )}
      </section>

      <hr className="border-[var(--border)]" />

      {/* Money table */}
      {obligations.money_items.length > 0 && (
        <section aria-labelledby="money-heading">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} strokeWidth={1.5} className="text-[var(--accent)]" aria-hidden="true" />
            <h2
              id="money-heading"
              className="text-base font-semibold text-[var(--ink)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Money and Payments
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" aria-label="Money and payment items">
              <thead>
                <tr className="bg-[var(--surface-muted)]">
                  <th className="text-left p-3 text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide border-b border-[var(--border)]">Amount</th>
                  <th className="text-left p-3 text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide border-b border-[var(--border)]">Purpose</th>
                  <th className="text-left p-3 text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide border-b border-[var(--border)]">When</th>
                  <th className="text-left p-3 text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide border-b border-[var(--border)]">Refundable</th>
                </tr>
              </thead>
              <tbody>
                {obligations.money_items?.map((item, i) => (
                  <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]">
                    <td className="p-3 font-semibold tabular-nums text-[var(--ink)]">{item.amount}</td>
                    <td className="p-3 text-[var(--ink-muted)]">{item.purpose}</td>
                    <td className="p-3 text-[var(--ink-muted)]">{item.when || "—"}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs rounded-full font-medium",
                          item.refundable === "yes"
                            ? "bg-[var(--risk-low-bg)] text-[var(--risk-low)]"
                            : item.refundable === "no"
                            ? "bg-[var(--risk-high-bg)] text-[var(--risk-high)]"
                            : "bg-[var(--surface-muted)] text-[var(--ink-faint)]"
                        )}
                      >
                        {item.refundable === "yes" ? "Yes" : item.refundable === "no" ? "No" : "Unclear"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Key dates timeline */}
      {obligations.date_items.length > 0 && (
        <section aria-labelledby="dates-heading">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} strokeWidth={1.5} className="text-[var(--primary)]" aria-hidden="true" />
              <h2
                id="dates-heading"
                className="text-base font-semibold text-[var(--ink)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Key Dates &amp; Deadlines
              </h2>
            </div>
            <button
              onClick={downloadICS}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors"
              aria-label="Download key dates as iCalendar file"
            >
              <Download size={12} strokeWidth={1.5} aria-hidden="true" />
              Download .ics
            </button>
          </div>

          <div className="relative pl-6 space-y-4" role="list" aria-label="Timeline of key dates">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-[var(--border)]" aria-hidden="true" />
            {obligations.date_items?.map((item, i) => (
              <div key={i} className="relative" role="listitem">
                <div
                  className="absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--primary)] border-2 border-[var(--bg)]"
                  aria-hidden="true"
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-[var(--ink)]">{item.label}</p>
                  <p className="text-xs text-[var(--ink-faint)] tabular-nums">
                    {item.date_iso || item.relative || "Not specified"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ObligationCard({
  obligation,
  documentText,
}: {
  obligation: ObligationsResult["obligations"][number];
  documentText: string;
}) {
  const verification = verifyQuote(obligation.quote, documentText);

  return (
    <div className="border border-[var(--border)] rounded-[var(--radius-card)] p-4 space-y-3 bg-[var(--surface)]">
      <div className="flex items-start gap-2">
        {obligation.due ? (
          <CheckSquare size={15} strokeWidth={1.5} className="text-[var(--primary)] mt-0.5 flex-shrink-0" aria-hidden="true" />
        ) : (
          <Square size={15} strokeWidth={1.5} className="text-[var(--ink-faint)] mt-0.5 flex-shrink-0" aria-hidden="true" />
        )}
        <div className="space-y-1 flex-1">
          <p className="text-sm text-[var(--ink)] leading-snug">{obligation.description}</p>
          {obligation.due && (
            <p className="text-xs text-[var(--ink-faint)]">
              <span className="font-medium">When: </span>{obligation.due}
            </p>
          )}
          {obligation.consequence && (
            <p className="text-xs text-[var(--risk-high)]">
              <span className="font-medium">If missed: </span>{obligation.consequence}
            </p>
          )}
        </div>
      </div>
      <QuoteBlock
        quote={obligation.quote}
        verificationStatus={verification.status}
      />
    </div>
  );
}
