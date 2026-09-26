"use client";
import { useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Languages, Trash2, GitCompare, FileText } from "lucide-react";
import { useDocumentStore, useCompareStore } from "@/store/useStore";
import type { Language } from "@/lib/schemas";

const LANGUAGES: Language[] = [
  "English", "Hindi", "Hinglish", "Marathi",
  "Gujarati", "Bengali", "Tamil", "Telugu", "Kannada"
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { extraction: docExtraction, clearSession: clearDoc } = useDocumentStore();
  const { extractionA, extractionB, clearSession: clearCompare } = useCompareStore();

  const isWorkspace = pathname === "/workspace";
  const isCompare = pathname === "/compare";
  const isLanding = pathname === "/";
  
  const hasActiveSession = !!docExtraction || !!extractionA || !!extractionB;

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<"home" | "clear" | null>(null);

  function handleLogoClick(e: React.MouseEvent) {
    if (hasActiveSession && !isLanding) {
      e.preventDefault();
      setPendingAction("home");
      setShowConfirm(true);
    }
  }

  function handleClearClick() {
    setPendingAction("clear");
    setShowConfirm(true);
  }

  function confirmEndSession() {
    clearDoc();
    clearCompare();
    setShowConfirm(false);
    if (!isLanding) {
      router.push("/");
    }
  }

  function confirmKeepSession() {
    setShowConfirm(false);
    if (pendingAction === "home" && !isLanding) {
      router.push("/");
    }
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 flex items-center h-14 px-4 md:px-6 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md"
        style={{ boxShadow: "0 1px 0 var(--border)" }}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 mr-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded"
          aria-label="ClearPaper — home"
        >
          <PageCornerMark />
          <span
            className="text-lg font-semibold text-[var(--ink)] tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Clear<span className="text-[var(--primary)]">Paper</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 mx-4" aria-label="Main navigation">
          <NavLink href="/workspace" active={isWorkspace} icon={<FileText size={15} strokeWidth={1.5} />}>
            Analyze
          </NavLink>
          <NavLink href="/compare" active={isCompare} icon={<GitCompare size={15} strokeWidth={1.5} />}>
            Compare
          </NavLink>
        </nav>

        {/* Clear session */}
        <button
          onClick={handleClearClick}
          className="flex items-center gap-1.5 text-sm text-[var(--ink-faint)] hover:text-[var(--risk-high)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--risk-high-bg)]"
          aria-label="Clear session — removes all document data from this browser tab"
        >
          <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
          <span className="hidden sm:inline">Clear session</span>
        </button>
      </header>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-[var(--border)] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[var(--ink)] mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                Active Session
              </h3>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                You have an active document session. Do you want to end it and clear your data, or keep it so you can return to it?
              </p>
            </div>
            <div className="flex flex-col gap-2 p-4 bg-gray-50 border-t border-[var(--border)]">
              <button
                onClick={confirmKeepSession}
                className="w-full py-2.5 rounded-xl font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
              >
                Keep Session
              </button>
              <button
                onClick={confirmEndSession}
                className="w-full py-2.5 rounded-xl font-semibold bg-white border border-[var(--border)] text-[var(--risk-high)] hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                End & Clear Session
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full py-2 rounded-xl text-sm font-medium text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors",
        active
          ? "bg-[var(--primary-soft)] text-[var(--primary)]"
          : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)]"
      )}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      {children}
    </Link>
  );
}

function PageCornerMark() {
  return (
    <svg
      width="22"
      height="26"
      viewBox="0 0 22 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="16" height="24" rx="2" stroke="var(--primary)" strokeWidth="1.5" />
      <path d="M14 1L21 8H14V1Z" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="4" y1="13" x2="13" y2="13" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="17" x2="11" y2="17" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
