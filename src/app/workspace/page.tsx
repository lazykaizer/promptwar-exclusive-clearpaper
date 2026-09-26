"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useDocumentStore } from "@/store/useStore";
import { TopBar } from "@/components/layout/TopBar";
import { DisclaimerBar } from "@/components/layout/DisclaimerBar";
import { DropZone } from "@/components/intake/DropZone";
import { PasteBox } from "@/components/intake/PasteBox";
import { ContextSelectors } from "@/components/intake/ContextSelectors";
import { SampleLinks } from "@/components/intake/SampleLinks";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { OverviewTab } from "@/components/insights/OverviewTab";
import { ClausesTab } from "@/components/insights/ClausesTab";
import { ObligationsTab } from "@/components/insights/ObligationsTab";
import { ActionPlanTab } from "@/components/insights/ActionPlanTab";
import { AskTab } from "@/components/insights/AskTab";
import { MotionDiv } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";
import type { Language, Role, Jurisdiction } from "@/lib/schemas";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "clauses", label: "Clauses" },
  { id: "obligations", label: "Obligations" },
  { id: "action", label: "Action Plan" },
  { id: "ask", label: "Ask" },
];

export default function WorkspacePage() {
  const {
    extraction, context, setExtraction, setContext,
    summary, clauses, obligations, action,
    setSectionLoading, setSectionData, setSectionError, resetSection,
    activeTab, setActiveTab,
  } = useDocumentStore();

  const [documentTitle, setDocumentTitle] = useState("Document");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"document" | "insights">("insights");

  const hasDocument = !!extraction;
  const isInitialMount = useRef(true);

  // Fetch a specific section
  const fetchSection = useCallback(
    async (section: "clauses" | "obligations" | "action") => {
      if (!extraction?.text) return;
      
      setSectionLoading(section);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: extraction.text, 
            role: context.role, 
            language: context.language, 
            jurisdiction: context.jurisdiction, 
            docType: context.docType, 
            section 
          }),
        });
        const result = await res.json();
        if (!res.ok || result.error) {
          setSectionError(section, result.error || `Failed to load ${section}.`);
        } else {
          setSectionData(section, result.data);
        }
      } catch {
        setSectionError(section, `Failed to load ${section}.`);
      }
    },
    [extraction, context, setSectionData, setSectionError, setSectionLoading]
  );

  // Run analysis when extraction is available (Only fetches Summary initially)
  const runAnalysis = useCallback(
    async (text: string) => {
      if (!text) return;

      // Fire summary first
      setSectionLoading("summary");

      const basePayload = {
        text,
        role: context.role,
        language: context.language,
        jurisdiction: context.jurisdiction,
        docType: context.docType,
      };

      try {
        const summaryRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...basePayload, section: "summary" }),
        });
        const summaryResult = await summaryRes.json();
        if (!summaryRes.ok || summaryResult.error) {
          setSectionError("summary", summaryResult.error || "Failed to load summary.");
        } else {
          setSectionData("summary", summaryResult.data);
          
          // Helper for default questions
          function getDefaultQuestions(role: string, docType: string) {
            return [
              `What are my key risks as a ${role}?`,
              `Are there any hidden costs?`,
              `Can I terminate this early?`,
              `What happens if I breach this?`
            ];
          }

          setSuggestedQuestions(getDefaultQuestions(context.role, summaryResult.data.doc_type || "contract"));
        }
      } catch (err) {
        setSectionError("summary", "Failed to load summary. Please try again.");
      }
    },
    [context, setSectionData, setSectionError, setSectionLoading]
  );

  function handleDocumentReady(text: string, filename: string, warnings: string[]) {
    setIntakeError(null);
    setDocumentTitle(filename);
    setExtraction({ text, pageCount: 0, method: "plain", warnings });
    runAnalysis(text);
    setMobileView("insights");
  }

  function handleSampleLoad(text: string, filename: string, role: string) {
    setContext({ role: role as Role });
    handleDocumentReady(text, filename, []);
  }

  // Auto-fetch sections when their tab is clicked
  useEffect(() => {
    if (!hasDocument) return;
    if (activeTab === "clauses" && clauses.status === "idle") {
      fetchSection("clauses");
    } else if (activeTab === "obligations" && obligations.status === "idle") {
      fetchSection("obligations");
    } else if (activeTab === "action" && action.status === "idle") {
      fetchSection("action");
    }
  }, [activeTab, hasDocument, clauses.status, obligations.status, action.status, fetchSection]);

  // Re-run summary when language or role changes, and reset other tabs
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (extraction?.text && (summary.status === "done" || summary.status === "error")) {
      resetSection("clauses");
      resetSection("obligations");
      resetSection("action");
      runAnalysis(extraction.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.language, context.role, context.jurisdiction]);

  if (!hasDocument) {
    return (
      <>
        <TopBar />
        <DisclaimerBar />
        <main className="min-h-screen bg-[var(--bg)] py-10 px-4">
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
                Analyze your document
              </h1>
              <p className="text-[var(--ink-muted)] text-lg">
                Upload or paste any legal document for a plain-language breakdown.
              </p>
            </div>

            {intakeError && (
              <div className="p-4 rounded-[var(--radius-card)] bg-[var(--risk-high-bg)] border border-[var(--border)]" role="alert">
                <p className="text-sm text-[var(--risk-high)]">{intakeError}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Drop zone */}
              <div className="space-y-4">
                <DropZone
                  onFileExtracted={(text, filename, warnings) =>
                    handleDocumentReady(text, filename, warnings)
                  }
                  onError={setIntakeError}
                />
              </div>

              {/* Paste + context */}
              <div className="space-y-4">
                <PasteBox
                  onTextReady={(text, warnings) =>
                    handleDocumentReady(text, "Pasted document", warnings)
                  }
                />
                <ContextSelectors
                  role={context.role}
                  docType={context.docType}
                  jurisdiction={context.jurisdiction}
                  language={context.language}
                  onRoleChange={(r) => setContext({ role: r })}
                  onDocTypeChange={(d) => setContext({ docType: d })}
                  onJurisdictionChange={(j) => setContext({ jurisdiction: j })}
                  onLanguageChange={(l) => setContext({ language: l })}
                />
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-6">
              <SampleLinks
                onSampleLoad={handleSampleLoad}
              />
            </div>
          </MotionDiv>
        </main>
      </>
    );
  }

  // Workspace view with document
  return (
    <>
      <TopBar />
      <DisclaimerBar />

      {/* Mobile toggle */}
      <div className="lg:hidden flex border-b border-[var(--border)] bg-[var(--surface)]" role="tablist" aria-label="View switcher">
        <button
          role="tab"
          aria-selected={mobileView === "document"}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            mobileView === "document"
              ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
              : "text-[var(--ink-muted)]"
          )}
          onClick={() => setMobileView("document")}
        >
          Document
        </button>
        <button
          role="tab"
          aria-selected={mobileView === "insights"}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            mobileView === "insights"
              ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
              : "text-[var(--ink-muted)]"
          )}
          onClick={() => setMobileView("insights")}
        >
          Insights
        </button>
      </div>

      <div className="flex h-[calc(100vh-7rem)] lg:h-[calc(100vh-6rem)]">
        {/* Document panel */}
        <div
          className={cn(
            "border-r border-[var(--border)] bg-[var(--surface)] overflow-hidden",
            "lg:block lg:w-[42%]",
            mobileView === "document" ? "flex-1 block" : "hidden"
          )}
          aria-label="Document panel"
        >
          <DocumentViewer text={extraction.text} className="h-full" />
        </div>

        {/* Insights panel */}
        <div
          className={cn(
            "flex flex-col min-h-0 overflow-hidden",
            "lg:flex lg:flex-1",
            mobileView === "insights" ? "flex-1" : "hidden lg:flex"
          )}
          aria-label="Insights panel"
        >
          {/* Tab bar */}
          <div
            className="flex border-b border-[var(--border)] bg-[var(--surface)] overflow-x-auto"
            role="tablist"
            aria-label="Analysis tabs"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tab-panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-shrink-0 px-4 py-3.5 text-sm font-medium transition-colors whitespace-nowrap",
                  "border-b-2",
                  activeTab === tab.id
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--border)]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div
              id="tab-panel-overview"
              role="tabpanel"
              aria-labelledby="tab-overview"
              hidden={activeTab !== "overview"}
            >
              <OverviewTab
                summary={summary.data}
                status={summary.status}
                error={summary.error}
                onRetry={() => {
                  setSectionLoading("summary");
                  runAnalysis(extraction.text);
                }}
              />
            </div>

            <div
              id="tab-panel-clauses"
              role="tabpanel"
              aria-labelledby="tab-clauses"
              hidden={activeTab !== "clauses"}
            >
              <ClausesTab
                clauses={clauses.data}
                documentText={extraction.text}
                status={clauses.status}
                error={clauses.error}
                onRetry={() => {
                  setSectionLoading("clauses");
                  fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      text: extraction.text,
                      section: "clauses",
                      role: context.role,
                      language: context.language,
                      jurisdiction: context.jurisdiction,
                    }),
                  }).then(r => r.json()).then(r => {
                    if (r.data) setSectionData("clauses", r.data);
                    else setSectionError("clauses", r.error || "Retry failed.");
                  }).catch(() => setSectionError("clauses", "Retry failed."));
                }}
              />
            </div>

            <div
              id="tab-panel-obligations"
              role="tabpanel"
              aria-labelledby="tab-obligations"
              hidden={activeTab !== "obligations"}
            >
              <ObligationsTab
                obligations={obligations.data}
                documentText={extraction.text}
                documentTitle={documentTitle}
                status={obligations.status}
                error={obligations.error}
                onRetry={() => {
                  setSectionLoading("obligations");
                  fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      text: extraction.text,
                      section: "obligations",
                      role: context.role,
                      language: context.language,
                      jurisdiction: context.jurisdiction,
                    }),
                  }).then(r => r.json()).then(r => {
                    if (r.data) setSectionData("obligations", r.data);
                    else setSectionError("obligations", r.error || "Retry failed.");
                  }).catch(() => setSectionError("obligations", "Retry failed."));
                }}
              />
            </div>

            <div
              id="tab-panel-action"
              role="tabpanel"
              aria-labelledby="tab-action"
              hidden={activeTab !== "action"}
            >
              <ActionPlanTab
                action={action.data}
                documentTitle={documentTitle}
                status={action.status}
                error={action.error}
                onRetry={() => {
                  setSectionLoading("action");
                  fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      text: extraction.text,
                      section: "action",
                      role: context.role,
                      language: context.language,
                      jurisdiction: context.jurisdiction,
                    }),
                  }).then(r => r.json()).then(r => {
                    if (r.data) setSectionData("action", r.data);
                    else setSectionError("action", r.error || "Retry failed.");
                  }).catch(() => setSectionError("action", "Retry failed."));
                }}
              />
            </div>

            <div
              id="tab-panel-ask"
              role="tabpanel"
              aria-labelledby="tab-ask"
              hidden={activeTab !== "ask"}
              className="h-full"
            >
              <AskTab
                documentText={extraction.text}
                documentTitle={documentTitle}
                suggestedQuestions={suggestedQuestions}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function getDefaultQuestions(role: Role, docType: string): string[] {
  const lowerDoc = docType.toLowerCase();
  if (lowerDoc.includes("rental") || lowerDoc.includes("lease") || lowerDoc.includes("license")) {
    return [
      "Can the landlord keep my deposit if I leave early?",
      "Can the landlord enter without notice?",
      "What is the notice period to vacate?",
      "Can the rent be increased during the term?",
      "What maintenance am I responsible for?",
    ];
  }
  if (lowerDoc.includes("employ") || lowerDoc.includes("offer")) {
    return [
      "What is the notice period if I resign?",
      "What does the non-compete clause restrict?",
      "What is the service bond and penalty?",
      "Who owns work I create outside office hours?",
      "What happens during probation?",
    ];
  }
  if (lowerDoc.includes("freelance") || lowerDoc.includes("service") || lowerDoc.includes("msa")) {
    return [
      "Who owns the work I create?",
      "What is my liability if something goes wrong?",
      "How long do I have to wait for payment?",
      "Can the client terminate without cause?",
      "Can I show this work in my portfolio?",
    ];
  }
  return [
    "What are the key obligations in this document?",
    "Are there any penalties or fees I should know about?",
    "How can I end this agreement early?",
    "What happens in case of a dispute?",
    "Are there any automatic renewals?",
  ];
}
