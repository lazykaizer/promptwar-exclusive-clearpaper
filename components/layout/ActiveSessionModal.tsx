"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocumentStore, useCompareStore } from "@/store/useStore";

export function ActiveSessionModal() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [sessionType, setSessionType] = useState<"workspace" | "compare" | null>(null);

  const { extraction: docExtraction, clearSession: clearDoc } = useDocumentStore();
  const { extractionA, extractionB, clearSession: clearCompare } = useCompareStore();

  useEffect(() => {
    // We only want to show this if the user lands on the home page and ALREADY has an active session
    if (docExtraction) {
      setSessionType("workspace");
      setShow(true);
    } else if (extractionA || extractionB) {
      setSessionType("compare");
      setShow(true);
    }
  }, [docExtraction, extractionA, extractionB]);

  if (!show) return null;

  function handleKeep() {
    setShow(false);
  }

  function handleClear() {
    clearDoc();
    clearCompare();
    setShow(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-[var(--border)] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-bold text-[var(--ink)] mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            Active Session Found
          </h3>
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
            You navigated away from an active document session. Do you want to keep it or clear your data?
          </p>
        </div>
        <div className="flex flex-col gap-2 p-4 bg-gray-50 border-t border-[var(--border)]">
          <button
            onClick={handleKeep}
            className="w-full py-2.5 rounded-xl font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
          >
            Keep Session
          </button>
          <button
            onClick={handleClear}
            className="w-full py-2.5 rounded-xl font-semibold bg-white border border-[var(--border)] text-[var(--risk-high)] hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            End & Clear Session
          </button>
        </div>
      </div>
    </div>
  );
}
