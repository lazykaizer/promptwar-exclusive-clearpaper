"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { DisclaimerBar } from "@/components/layout/DisclaimerBar";
import { useCompareStore } from "@/store/useStore";
import { DropZone } from "@/components/intake/DropZone";
import { PasteBox } from "@/components/intake/PasteBox";
import { SectionError, SkeletonBlock, SectionEmpty } from "@/components/shared/SectionState";
import { QuoteBlock } from "@/components/shared/QuoteBlock";
import { verifyQuote } from "@/lib/verify";
import { RiskBadge } from "@/components/shared/RiskBadge";
import type { CompareResult, Risk, Role, Language } from "@/lib/schemas";
import {
  GitCompare, Pencil, ArrowRight, TrendingDown, TrendingUp,
  Equal, PlusCircle, MinusCircle, RefreshCw, Zap, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MotionDiv } from "@/components/shared/Motion";

const ROLES: Role[] = ["Tenant","Landlord","Employee","Employer","Freelancer","Client","Borrower","Lender","Consumer","Other"];
const LANGUAGES: Language[] = ["English","Hindi","Hinglish","Marathi","Gujarati","Bengali","Tamil","Telugu","Kannada"];

export default function ComparePage() {
  const {
    labelA, labelB, extractionA, extractionB, result, role, language,
    setLabel, setExtraction, setResultLoading, setResultData, setResultError,
    setRole, setLanguage, clearSession,
  } = useCompareStore();

  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<"A" | "B" | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);

  async function runComparison() {
    if (!extractionA || !extractionB) return;
    setResultLoading();

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textA: extractionA.text,
          textB: extractionB.text,
          labelA,
          labelB,
          role,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setResultError(data.error || "Comparison failed.");
      } else {
        setResultData(data.data);
      }
    } catch {
      setResultError("Comparison failed. Please try again.");
    }
  }

  async function loadSampleDocs() {
    setSampleLoading(true);
    try {
      const [v1, v2] = await Promise.all([
        fetch("/samples/freelance-msa-v1.txt").then((r) => r.text()),
        fetch("/samples/freelance-msa-v2.txt").then((r) => r.text()),
      ]);
      setLabel("A", "Freelance MSA v1");
      setLabel("B", "Freelance MSA v2 (Revised)");
      setExtraction("A", { text: v1, pageCount: 0, method: "plain", warnings: [] });
      setExtraction("B", { text: v2, pageCount: 0, method: "plain", warnings: [] });
      setRole("Freelancer");
    } catch {
      // silent
    } finally {
      setSampleLoading(false);
    }
  }

  const canCompare = !!extractionA && !!extractionB;

  return (
    <>
      <TopBar />
      <DisclaimerBar />

      <main className="min-h-screen bg-[var(--bg)] py-10 px-4">
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
                Compare Documents
              </h1>
              <p className="text-[var(--ink-muted)] text-lg">
                Upload two documents or versions to get a side-by-side analysis.
              </p>
            </div>
            <button
              onClick={loadSampleDocs}
              disabled={sampleLoading}
              className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] underline underline-offset-2 disabled:opacity-50"
            >
              {sampleLoading ? "Loading…" : "Try sample (MSA v1 vs v2)"}
            </button>
          </div>

          {/* Document slots */}
          <div className="grid md:grid-cols-2 gap-6">
            {(["A", "B"] as const).map((slot) => {
              const extraction = slot === "A" ? extractionA : extractionB;
              const label = slot === "A" ? labelA : labelB;
              const slotError = slot === "A" ? errorA : errorB;
              const setSlotError = slot === "A" ? setErrorA : setErrorB;

              return (
                <div key={slot} className="space-y-3">
                  {/* Label */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[var(--primary)] text-white">
                      {slot}
                    </span>
                    {editingLabel === slot ? (
                      <input
                        autoFocus
                        value={label}
                        onChange={(e) => setLabel(slot, e.target.value)}
                        onBlur={() => setEditingLabel(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingLabel(null)}
                        className="text-sm font-medium text-[var(--ink)] bg-transparent border-b border-[var(--primary)] focus:outline-none flex-1"
                        aria-label={`Label for document ${slot}`}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingLabel(slot)}
                        className="flex items-center gap-1 text-sm font-medium text-[var(--ink)] hover:text-[var(--primary)] transition-colors"
                        aria-label={`Edit label for document ${slot}`}
                      >
                        {label}
                        <Pencil size={11} strokeWidth={1.5} className="text-[var(--ink-faint)]" />
                      </button>
                    )}
                  </div>

                  {extraction ? (
                    <div className="p-4 rounded-[var(--radius-card)] border border-[var(--risk-low)] bg-[var(--risk-low-bg)]">
                      <p className="text-sm font-medium text-[var(--risk-low)]">
                        Document loaded — {extraction.text.length.toLocaleString("en-US")} characters
                      </p>
                      <button
                        onClick={() => setExtraction(slot, null)}
                        className="flex items-center gap-1.5 text-sm text-[var(--risk-high)] hover:opacity-80 transition-opacity mt-2 font-medium"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <DropZone
                        onFileExtracted={(text, filename, warnings) => {
                          setExtraction(slot, { text, pageCount: 0, method: "plain", warnings });
                          if (label === `Document ${slot}`) setLabel(slot, filename);
                        }}
                        onError={setSlotError}
                      />
                      <PasteBox
                        onTextReady={(text) => setExtraction(slot, { text, pageCount: 0, method: "plain", warnings: [] })}
                      />
                    </>
                  )}
                  {slotError && (
                    <p className="text-xs text-[var(--risk-high)]">{slotError}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Context selectors */}
          <div className="flex flex-wrap gap-4 items-center p-4 rounded-[var(--radius-card)] bg-[var(--surface)] border border-[var(--border)]">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--ink-muted)]">I am the</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="block text-sm border border-[var(--border-strong)] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>


            <div className="ml-auto">
              <button
                onClick={runComparison}
                disabled={!canCompare || result.status === "loading"}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out shadow-sm",
                  canCompare && result.status !== "loading"
                    ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] hover:shadow-md hover:-translate-y-0.5"
                    : "bg-[var(--surface-muted)] text-[var(--ink-faint)] cursor-not-allowed"
                )}
                aria-label="Compare documents"
              >
                {result.status === "loading" ? (
                  <RefreshCw size={16} strokeWidth={1.5} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Zap size={16} strokeWidth={1.5} aria-hidden="true" />
                )}
                {result.status === "loading" ? "Comparing…" : "Compare Now"}
              </button>
            </div>
          </div>

          {/* Results */}
          {result.status === "loading" && (
            <div className="space-y-4 p-6 bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--border)]">
              <p className="text-sm text-[var(--ink-muted)]">Analyzing both documents…</p>
              <SkeletonBlock lines={6} />
            </div>
          )}

          {result.status === "error" && (
            <SectionError
              message={result.error || "Comparison failed."}
              onRetry={runComparison}
            />
          )}

          {result.status === "done" && result.data && (
            <CompareResults
              result={result.data}
              labelA={labelA}
              labelB={labelB}
              textA={extractionA?.text ?? ""}
              textB={extractionB?.text ?? ""}
            />
          )}
        </MotionDiv>
      </main>
    </>
  );
}

function CompareResults({
  result, labelA, labelB, textA, textB,
}: {
  result: CompareResult;
  labelA: string;
  labelB: string;
  textA: string;
  textB: string;
}) {
  const [showDiff, setShowDiff] = useState(false);

  const verdictColor: Record<"A" | "B" | "neither", string> = {
    A: "var(--risk-low)",
    B: "var(--primary)",
    neither: "var(--ink-muted)",
  };

  const changeIcon: Record<"better_a" | "better_b" | "similar" | "only_a" | "only_b", React.ElementType> = {
    better_a: TrendingUp,
    better_b: TrendingDown,
    similar: Equal,
    only_a: PlusCircle,
    only_b: MinusCircle,
  };

  const changeLabel: Record<string, string> = {
    better_a: `Better in ${labelA}`,
    better_b: `Better in ${labelB}`,
    similar: "Similar",
    only_a: `Only in ${labelA}`,
    only_b: `Only in ${labelB}`,
  };

  return (
    <div className="space-y-8">
      {/* Verdict */}
      <section
        className="p-6 rounded-[var(--radius-card)] border-2"
        style={{ borderColor: verdictColor[result.verdict.favored] }}
        aria-labelledby="verdict-heading"
      >
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide">
              Verdict
            </p>
            <h2 id="verdict-heading" className="text-xl font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)", color: verdictColor[result.verdict.favored] }}>
              {result.verdict.favored === "A"
                ? `${labelA} is more favorable`
                : result.verdict.favored === "B"
                ? `${labelB} is more favorable`
                : "Both documents are similarly positioned"}
            </h2>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed mt-2">{result.verdict.reasoning}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full lg:w-auto lg:max-w-sm bg-[var(--surface-muted)] p-4 rounded-xl border border-[var(--border)] flex-shrink-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--ink-faint)] mb-1 uppercase tracking-wide font-semibold">{labelA} Risk</p>
              <p className="text-sm font-medium text-[var(--ink)]">{result.verdict.risk_a}</p>
            </div>
            <div className="hidden sm:flex items-center text-[var(--ink-faint)] justify-center self-stretch">
              <div className="w-[1px] h-full bg-[var(--border)]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--ink-faint)] mb-1 uppercase tracking-wide font-semibold">{labelB} Risk</p>
              <p className="text-sm font-medium text-[var(--ink)]">{result.verdict.risk_b}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Topic comparison table */}
      {result.topics.length > 0 && (
        <section aria-labelledby="topics-heading">
          <h2 id="topics-heading" className="text-base font-semibold text-[var(--ink)] mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Side-by-Side Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" aria-label="Topic comparison table">
              <thead>
                <tr className="bg-[var(--surface-muted)]">
                  <th className="text-left p-3 text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide border-b border-[var(--border)] w-1/4">Topic</th>
                  <th className="text-left p-3 text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide border-b border-[var(--border)] w-5/12">{labelA}</th>
                  <th className="text-left p-3 text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide border-b border-[var(--border)] w-5/12">{labelB}</th>
                  <th className="text-left p-3 text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide border-b border-[var(--border)] w-24">Change</th>
                </tr>
              </thead>
              <tbody>
                {result.topics?.map((topic, i) => {
                  const ChangeIcon = changeIcon[topic.change] || changeIcon.similar;
                  const verA = topic.a?.quote ? verifyQuote(topic.a.quote, textA) : null;
                  const verB = topic.b?.quote ? verifyQuote(topic.b.quote, textB) : null;
                  return (
                    <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)]">
                      <td className="p-3 align-top">
                        <p className="font-medium text-[var(--ink)]">{topic.topic}</p>
                        <RiskBadge risk={topic.importance} size="sm" className="mt-1" />
                      </td>
                      <td className="p-3 align-top">
                        <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{topic.a?.summary}</p>
                        {topic.a?.quote && verA && (
                          <QuoteBlock quote={topic.a.quote} verificationStatus={verA.status} className="mt-2 text-xs" />
                        )}
                      </td>
                      <td className="p-3 align-top">
                        <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{topic.b?.summary}</p>
                        {topic.b?.quote && verB && (
                          <QuoteBlock quote={topic.b.quote} verificationStatus={verB.status} className="mt-2 text-xs" />
                        )}
                      </td>
                      <td className="p-3 align-top">
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--ink-muted)]">
                          <ChangeIcon size={12} strokeWidth={1.5} aria-hidden="true" />
                          {changeLabel[topic.change] || changeLabel.similar}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Changes detected */}
      {result.changes.length > 0 && (
        <section aria-labelledby="changes-heading">
          <h2 id="changes-heading" className="text-base font-semibold text-[var(--ink)] mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            What Changed
          </h2>
          <div className="space-y-3">
            {result.changes?.map((change, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0",
                    change.type === "added" ? "bg-[var(--risk-low-bg)] text-[var(--risk-low)]" :
                    change.type === "removed" ? "bg-[var(--risk-high-bg)] text-[var(--risk-high)]" :
                    "bg-[var(--risk-medium-bg)] text-[var(--risk-medium)]"
                  )}
                >
                  {change.type}
                </span>
                <div className="space-y-2 flex-1">
                  <p className="text-sm text-[var(--ink)] leading-snug">{change.description}</p>
                  <RiskBadge risk={change.severity} />
                  {change.quote_a && (
                    <QuoteBlock quote={change.quote_a} verificationStatus={verifyQuote(change.quote_a, textA).status} />
                  )}
                  {change.quote_b && (
                    <QuoteBlock quote={change.quote_b} verificationStatus={verifyQuote(change.quote_b, textB).status} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Inconsistencies */}
      {result.inconsistencies.length > 0 && (
        <section aria-labelledby="inconsistencies-heading">
          <h2 id="inconsistencies-heading" className="text-base font-semibold text-[var(--ink)] mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Inconsistencies
          </h2>
          <div className="space-y-3">
            {result.inconsistencies?.map((item, i) => (
              <div key={i} className="p-4 rounded-[var(--radius-card)] border border-[var(--risk-medium)] bg-[var(--risk-medium-bg)]">
                <p className="text-sm font-medium text-[var(--risk-medium)]">{item.description}</p>
                {item.quotes?.map((q, qi) => (
                  <QuoteBlock key={qi} quote={q} verificationStatus="unverified" className="mt-2" />
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Negotiation points */}
      {result.negotiation_points.length > 0 && (
        <section aria-labelledby="neg-heading">
          <h2 id="neg-heading" className="text-base font-semibold text-[var(--ink)] mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Negotiation Points
          </h2>
          <div className="space-y-3">
            {result.negotiation_points?.map((point, i) => (
              <div key={i} className="p-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
                <p className="text-sm font-medium text-[var(--ink)]">{point.ask}</p>
                {point.sample_wording && (
                  <div className="mt-2 bg-[var(--surface-muted)] rounded-lg p-3">
                    <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide mb-1">Sample wording</p>
                    <p className="text-sm text-[var(--ink-muted)] italic">"{point.sample_wording}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
