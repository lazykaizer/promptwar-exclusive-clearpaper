"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-2">
            <p
              className="text-base font-semibold text-[var(--ink)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              ClearPaper
            </p>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed max-w-xs">
              Helping ordinary people understand what they sign. General information only.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide">
              Tools
            </p>
            <nav className="space-y-1" aria-label="Footer navigation">
              <FooterLink href="/workspace">Analyze a document</FooterLink>
              <FooterLink href="/compare">Compare documents</FooterLink>
            </nav>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide">
              About
            </p>
            <nav className="space-y-1" aria-label="Footer about links">
              <FooterLink href="/privacy">Privacy & how it works</FooterLink>
            </nav>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-6 space-y-2">
          <p className="text-xs text-[var(--ink-faint)] leading-relaxed max-w-3xl">
            <strong className="font-medium text-[var(--ink-muted)]">Disclaimer:</strong> ClearPaper provides general legal information to help you understand documents. It is not a law firm, does not provide legal advice, and does not create an attorney-client relationship. The analysis is AI-generated and may contain errors. For any matter with significant legal or financial consequences, consult a qualified lawyer.
          </p>
          <p className="text-xs text-[var(--ink-faint)]">
            Your documents are never stored. All data stays in your browser session and is cleared when you close the tab.
          </p>
          <p className="text-xs text-[var(--ink-faint)]">
            © {new Date().getFullYear()} ClearPaper. Built with care for the people.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block text-sm text-[var(--ink-muted)] hover:text-[var(--primary)] transition-colors"
    >
      {children}
    </Link>
  );
}
