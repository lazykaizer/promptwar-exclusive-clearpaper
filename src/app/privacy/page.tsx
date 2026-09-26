import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, FileText, Server, Zap } from "lucide-react";

export default function PrivacyPage() {
  return (
    <>
      <header className="sticky top-0 z-40 flex items-center h-14 px-6 border-b border-[var(--border)] bg-[var(--surface)]">
        <Link href="/" className="text-base font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
          Clear<span style={{ color: "var(--primary)" }}>Paper</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-[var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
            Privacy & How It Works
          </h1>
          <p className="text-[var(--ink-muted)] leading-relaxed">
            We built ClearPaper to be useful without being intrusive. Here is exactly what happens when you use it.
          </p>
        </div>

        <section className="space-y-6">
          {[
            {
              icon: FileText,
              title: "Your document is never stored",
              body: "When you upload or paste a document, it is processed in memory and sent to the AI model to generate the analysis. After your session, no copy of your document text is retained on our servers. Clicking 'Clear session' removes it from your browser tab immediately. A page refresh also clears it.",
            },
            {
              icon: Server,
              title: "How the AI processes your document",
              body: "Your document text is sent to the Gemini AI model (by Google) to generate analysis. The model receives the document as part of the prompt and returns structured analysis. We use Google's API or Vertex AI depending on the deployment — both are governed by Google's data processing terms. We strongly recommend using sample documents for public demos rather than real sensitive documents.",
            },
            {
              icon: ShieldCheck,
              title: "What we do not collect",
              body: "We do not collect your name, email, or any personal information. We do not use analytics tools that capture document content. We do not log the text of your documents. We do not share your document with any third party other than the AI model (Google Gemini) used for analysis.",
            },
            {
              icon: Zap,
              title: "How the analysis is generated",
              body: "When you upload a document, the server extracts the text (from PDF, DOCX, or image), then calls the AI model separately for each section: summary, clauses, obligations, and action plan. These run in parallel so results appear as soon as each one is ready. The AI is instructed to base every claim strictly on the document text and to quote verbatim. Each quote is then verified against your original document on the server before being displayed.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4 p-5 rounded-[10px] border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center">
                  <Icon size={18} strokeWidth={1.5} className="text-[var(--primary)]" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-[var(--ink)]">{item.title}</h2>
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{item.body}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="p-5 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface-muted)] space-y-2">
          <h2 className="text-sm font-semibold text-[var(--ink)]">A note on AI and legal information</h2>
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
            ClearPaper provides general legal information — it is not a law firm, does not provide legal advice, and using it does not create an attorney-client relationship. The AI may make errors or miss important context. Treat the analysis as a starting point for understanding, not a final legal opinion. For any matter with significant financial or legal consequences, consult a qualified lawyer.
          </p>
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
            For free legal help in India: <strong>NALSA Tele-Law helpline: 15100</strong>. For in-person help, visit your District Legal Services Authority (DLSA). Please verify current contact details at <strong>nalsa.gov.in</strong>.
          </p>
        </section>

        <div className="pt-4 border-t border-[var(--border)]">
          <Link href="/" className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] underline underline-offset-2">
            ← Back to ClearPaper
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
