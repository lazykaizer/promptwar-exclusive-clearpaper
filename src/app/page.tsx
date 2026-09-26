import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import {
  FileText, ShieldCheck, ListChecks, MessagesSquare,
  GitCompare, Languages, ChevronRight, CheckCircle2
} from "lucide-react";
import { MotionDiv, MotionH1, MotionP, MotionSection } from "@/components/shared/Motion";
import { ActiveSessionModal } from "@/components/layout/ActiveSessionModal";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] selection:bg-[var(--highlight)] selection:text-black">
      <ActiveSessionModal />
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center h-16 px-6 border-b border-[var(--border)] bg-white/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 mr-auto" aria-label="ClearPaper home">
          <svg width="24" height="28" viewBox="0 0 22 26" fill="none" aria-hidden="true" className="transform transition-transform hover:scale-105">
            <rect x="1" y="1" width="16" height="24" rx="2" stroke="#1F4D45" strokeWidth="1.5" />
            <path d="M14 1L21 8H14V1Z" fill="#E4EEEA" stroke="#1F4D45" strokeWidth="1.5" strokeLinejoin="round" />
            <line x1="4" y1="13" x2="13" y2="13" stroke="#B9862F" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="4" y1="17" x2="11" y2="17" stroke="#D5CDBD" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-xl font-bold text-[var(--ink)] tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
            Clear<span style={{ color: "var(--primary)" }}>Paper</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6" aria-label="Main navigation">
          <Link href="/workspace" className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--primary)] transition-colors">Analyze</Link>
          <Link href="/compare" className="text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--primary)] transition-colors">Compare</Link>
          <Link href="/workspace" className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-md transition-all active:scale-95">
            Get started
          </Link>
        </nav>
      </header>

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center justify-center min-h-[70vh]">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--primary-soft)] rounded-full blur-[120px] opacity-50 pointer-events-none -z-10" />

          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-white border border-[var(--border)] text-[var(--ink)] mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
            Free · No account needed · No document storage
          </MotionDiv>
          
          <MotionH1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--ink)] leading-[1.1] tracking-tight max-w-4xl mx-auto"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Understand exactly what you <span className="text-[var(--primary)] relative inline-block">sign.<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="var(--accent)" strokeWidth="3" fill="transparent" /></svg></span>
          </MotionH1>
          
          <MotionP 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mt-6 text-xl md:text-2xl text-[var(--ink-muted)] font-medium" 
            lang="hi"
          >
            Jo likha hai, wahi samjho.
          </MotionP>
          
          <MotionP 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="mt-6 text-lg text-[var(--ink-muted)] leading-relaxed max-w-2xl mx-auto"
          >
            Upload any legal document — rental agreement, job offer, NDA, freelance contract — and get a plain-language breakdown with risk analysis, obligations, and an action plan.
          </MotionP>
          
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center w-full"
          >
            <Link
              href="/workspace"
              className="group flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl bg-[var(--primary)] text-white text-lg font-semibold hover:bg-[var(--primary-hover)] shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Analyze a document
              <ChevronRight size={20} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
            <Link
              href="/compare"
              className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl bg-white border-2 border-[var(--border)] text-[var(--ink)] text-lg font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <GitCompare size={20} strokeWidth={2.5} />
              Compare two documents
            </Link>
          </MotionDiv>
        </section>

        {/* Animated Product Preview */}
        <MotionSection 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-6xl mx-auto px-6 pb-24"
        >
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-white shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary-soft)] to-transparent opacity-30 pointer-events-none" />
            
            {/* Window controls */}
            <div className="flex items-center h-12 px-5 bg-gray-50 border-b border-[var(--border)] gap-2 relative z-10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="mx-auto text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm flex items-center gap-2">
                <ShieldCheck size={14} className="text-[var(--primary)]" />
                ClearPaper Analysis Engine
              </div>
              <div className="w-16" /> {/* spacer for center alignment */}
            </div>

            <div className="flex flex-col md:flex-row h-auto md:h-[450px] relative z-10">
              {/* Document Side (Animated scanning effect) */}
              <div className="w-full md:w-[45%] border-r border-[var(--border)] bg-white p-6 md:p-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-[200%] bg-gradient-to-b from-transparent via-[var(--primary-soft)] to-transparent animate-[scan_4s_ease-in-out_infinite] opacity-50" />
                <p className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <FileText size={16} /> Original Contract
                </p>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-100 rounded-md w-full" />
                  <div className="h-4 bg-gray-100 rounded-md w-11/12" />
                  <MotionDiv 
                    initial={{ backgroundColor: "#F3F4F6" }}
                    animate={{ backgroundColor: ["#F3F4F6", "#FFF1B8", "#F3F4F6"] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    className="h-4 rounded-md w-full"
                  />
                  <MotionDiv 
                    initial={{ backgroundColor: "#F3F4F6" }}
                    animate={{ backgroundColor: ["#F3F4F6", "#FFF1B8", "#F3F4F6"] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    className="h-4 rounded-md w-5/6"
                  />
                  <div className="h-4 bg-gray-100 rounded-md w-full" />
                  <div className="h-4 bg-gray-100 rounded-md w-full" />
                  <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-md w-full mt-8" />
                  <MotionDiv 
                    initial={{ backgroundColor: "#F3F4F6" }}
                    animate={{ backgroundColor: ["#F3F4F6", "#F9E7E3", "#F3F4F6"] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 2.5 }}
                    className="h-4 rounded-md w-full"
                  />
                  <MotionDiv 
                    initial={{ backgroundColor: "#F3F4F6" }}
                    animate={{ backgroundColor: ["#F3F4F6", "#F9E7E3", "#F3F4F6"] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 2.5 }}
                    className="h-4 rounded-md w-2/3"
                  />
                </div>
              </div>

              {/* Analysis Side (Staggered fade in) */}
              <div className="flex-1 p-6 md:p-8 bg-gray-50 flex flex-col gap-4 overflow-y-auto">
                <div className="flex gap-3 mb-2">
                  <div className="px-4 py-1.5 bg-white shadow-sm border border-[var(--primary)] text-[var(--primary)] rounded-full text-sm font-semibold">Risks</div>
                  <div className="px-4 py-1.5 bg-gray-200 text-gray-500 rounded-full text-sm font-semibold">Summary</div>
                  <div className="px-4 py-1.5 bg-gray-200 text-gray-500 rounded-full text-sm font-semibold">Action Plan</div>
                </div>

                <MotionDiv 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="p-5 rounded-xl border border-red-200 bg-red-50/50 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase tracking-wider">High Risk</span>
                    <span className="text-sm font-semibold text-gray-800">Unreasonable Notice Period</span>
                  </div>
                  <p className="text-sm text-gray-600">The 90-day notice period is significantly higher than industry standard (30 days) and restricts your ability to switch jobs easily.</p>
                </MotionDiv>

                <MotionDiv 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded uppercase tracking-wider">Medium Risk</span>
                    <span className="text-sm font-semibold text-gray-800">Broad Non-Compete</span>
                  </div>
                  <p className="text-sm text-gray-600">You cannot work for any competitor globally for 1 year after leaving. Consider negotiating this to be restricted only to direct competitors in your state.</p>
                </MotionDiv>
                
                <MotionDiv 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="p-5 rounded-xl border border-green-200 bg-green-50/50 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-wider">Safe</span>
                    <span className="text-sm font-semibold text-gray-800">Severance Package</span>
                  </div>
                  <p className="text-sm text-gray-600">Standard 2-month severance pay is guaranteed if terminated without cause. This is a fair and standard protection.</p>
                </MotionDiv>
              </div>
            </div>
          </div>
        </MotionSection>

        {/* Features Grid */}
        <section className="bg-white py-24 border-y border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[var(--ink)] mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                Everything you need before you sign
              </h2>
              <p className="text-lg text-[var(--ink-muted)] max-w-2xl mx-auto">
                Stop guessing what complex legal jargon means. We break it down into actionable insights so you can negotiate with confidence.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: ShieldCheck, title: "Verified Clause Analysis", desc: "Every risk rating is backed by a verbatim quote from your document. We never hallucinate or invent clauses." },
                { icon: GitCompare, title: "Compare Versions", desc: "Upload two versions of an agreement (e.g. before & after negotiation) to instantly highlight exactly what changed and the legal impact." },
                { icon: Languages, title: "Your Local Language", desc: "Get full explanations in English, Hindi, Hinglish, Marathi, Gujarati, Tamil, and more." },
                { icon: ListChecks, title: "Actionable Checklists", desc: "Get a clear 'Action Plan' with red flags to negotiate, missing protections to ask for, and a pre-signing checklist." },
                { icon: MessagesSquare, title: "Ask Questions", desc: "Not sure about a specific paragraph? Ask the AI questions directly about your document and get answers cited from the text." },
                { icon: FileText, title: "Role-Based Perspective", desc: "Are you the landlord or the tenant? The employer or the employee? Our analysis adapts to protect YOUR specific interests." }
              ].map((f, i) => (
                <MotionDiv 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-8 hover:bg-[var(--primary-soft)] hover:border-[var(--primary)] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <f.icon className="text-[var(--primary)]" size={24} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--ink)] mb-3">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Real life scenarios */}
        <section className="py-24 bg-[var(--bg)] relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-bold text-[var(--ink)] text-center mb-16" style={{ fontFamily: "var(--font-serif)" }}>
              Built for real situations
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { name: "Riya, 24", title: "First-time renter in Mumbai", quote: "I had a 40-page leave-and-license agreement and no lawyer. ClearPaper instantly spotted a sneaky lock-in clause that would have cost me my deposit." },
                { name: "Arjun, 28", title: "Software Engineer", quote: "I got two job offers and used the 'Compare' tool. It highlighted that one had a 6-month non-compete while the other only had 1 month. Made my decision easy." },
                { name: "Meera, 34", title: "Freelance Designer", quote: "A client sent a contract that claimed full ownership of my entire portfolio, not just the work I did for them. The Action Plan told me exactly what to say to fix it." },
                { name: "Mr. Sharma, 58", title: "Small Shop Owner", quote: "The bank gave me a loan agreement in English. I couldn't understand the legal words. ClearPaper explained the whole thing to me in simple Hindi." },
              ].map((p, i) => (
                <MotionDiv 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-[var(--border)]"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-xl">{p.name[0]}</div>
                    <div>
                      <h4 className="font-bold text-[var(--ink)]">{p.name}</h4>
                      <p className="text-sm text-[var(--primary)] font-medium">{p.title}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic leading-relaxed">"{p.quote}"</p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Callout */}
        <section className="bg-[var(--primary)] text-white py-20 text-center px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <ShieldCheck size={48} className="mx-auto text-[var(--accent)] mb-6" />
            <h2 className="text-4xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>Your privacy, strictly enforced.</h2>
            <p className="text-lg text-white/80 leading-relaxed">
              We never save your documents. Your data is analyzed entirely in-memory and immediately discarded when you close the tab. No accounts, no tracking, no training models on your data.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              <div className="flex items-center gap-2 justify-center"><CheckCircle2 className="text-[var(--accent)]" size={20}/> No database storage</div>
              <div className="flex items-center gap-2 justify-center"><CheckCircle2 className="text-[var(--accent)]" size={20}/> Instant session deletion</div>
              <div className="flex items-center gap-2 justify-center"><CheckCircle2 className="text-[var(--accent)]" size={20}/> No hidden analytics</div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center px-6 bg-white">
          <h2 className="text-4xl font-bold text-[var(--ink)] mb-6" style={{ fontFamily: "var(--font-serif)" }}>
            Ready to read the fine print?
          </h2>
          <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
            Upload your first contract now. It takes 10 seconds and costs nothing.
          </p>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-[var(--primary)] text-white text-xl font-bold hover:bg-[var(--primary-hover)] shadow-2xl hover:shadow-xl transition-all hover:-translate-y-1"
          >
            Start Analyzing Now
            <ChevronRight size={24} strokeWidth={2.5} />
          </Link>
        </section>
      </main>

      <Footer />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-50%); }
          50% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
      `}} />
    </div>
  );
}
