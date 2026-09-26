import { z } from "zod";

// ─── Primitive types ─────────────────────────────────────────────────────────

export const RiskSchema = z.enum(["high", "medium", "low", "info"]);
export type Risk = z.infer<typeof RiskSchema>;

export const CategorySchema = z.enum([
  "payment",
  "termination",
  "liability",
  "ip",
  "confidentiality",
  "non_compete",
  "renewal",
  "dispute_resolution",
  "deposit",
  "maintenance",
  "privacy",
  "other",
]);
export type Category = z.infer<typeof CategorySchema>;

export const LanguageSchema = z.enum([
  "English",
  "Hindi",
  "Hinglish",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
]);
export type Language = z.infer<typeof LanguageSchema>;

export const RoleSchema = z.enum([
  "Tenant",
  "Landlord",
  "Employee",
  "Employer",
  "Freelancer",
  "Client",
  "Borrower",
  "Lender",
  "Consumer",
  "Other",
]);
export type Role = z.infer<typeof RoleSchema>;

export const JurisdictionSchema = z.enum(["India", "Other"]);
export type Jurisdiction = z.infer<typeof JurisdictionSchema>;

// ─── Extraction ───────────────────────────────────────────────────────────────

export const ExtractionResultSchema = z.object({
  text: z.string(),
  pageCount: z.number().int().nonnegative(),
  method: z.enum(["text-layer", "ocr", "docx", "plain"]),
  warnings: z.array(z.string()),
});
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

// ─── Analysis: Summary ────────────────────────────────────────────────────────

export const HighStakesFlagSchema = z.object({
  triggered: z.boolean(),
  reason: z.string().nullable(),
});

export const SummarySchema = z.object({
  is_legal_document: z.boolean().catch(true),
  doc_type: z.string().catch("Unknown"),
  parties: z.array(
    z.union([
      z.object({ name: z.string().catch("Unknown"), role: z.string().catch("Unknown") }),
      z.string().transform((s) => ({ name: s, role: "Unknown" })),
    ])
  ).catch([]),
  effective_date: z.string().nullable().catch(null),
  term: z.string().nullable().catch(null),
  governing_law: z.string().nullable().catch(null),
  plain_summary: z.string().catch(""),
  simple_summary: z.string().catch(""),
  overall_risk: z.enum(["low", "moderate", "high", "severe"]).catch("low"),
  overall_risk_reason: z.string().catch(""),
  key_facts: z.union([
    z.array(z.object({ label: z.string().catch("Fact"), value: z.string().catch("") })),
    z.object({
      money_amounts: z.array(z.string()).catch([]),
      durations: z.array(z.string()).catch([]),
      notice_periods: z.array(z.string()).catch([]),
      lock_in_periods: z.array(z.string()).catch([]),
      renewal_terms: z.array(z.string()).catch([]),
    }).transform((obj) => {
      const facts: { label: string; value: string }[] = [];
      for (const a of obj.money_amounts) facts.push({ label: "Money", value: a });
      for (const a of obj.durations) facts.push({ label: "Duration", value: a });
      for (const a of obj.notice_periods) facts.push({ label: "Notice Period", value: a });
      for (const a of obj.lock_in_periods) facts.push({ label: "Lock-in", value: a });
      for (const a of obj.renewal_terms) facts.push({ label: "Renewal", value: a });
      return facts;
    }),
  ]).catch([]),
  top_things_to_know: z.array(z.string()).catch([]),
  high_stakes_flag: HighStakesFlagSchema.catch({ triggered: false, reason: null }),
}).passthrough();
export type Summary = z.infer<typeof SummarySchema>;

// ─── Analysis: Clauses ────────────────────────────────────────────────────────

export const ClauseCardSchema = z.object({
  id: z.string().catch(""),
  title: z.string().catch("Unknown Clause"),
  category: CategorySchema.catch("other"),
  risk: RiskSchema.catch("info"),
  quote: z.string().catch(""),
  plain_explanation: z.string().catch(""),
  why_it_matters: z.string().catch(""),
}).catch({ id: "", title: "Unknown Clause", category: "other", risk: "info", quote: "", plain_explanation: "", why_it_matters: "" });
export type ClauseCard = z.infer<typeof ClauseCardSchema>;

export const ClausesResultSchema = z.object({
  clauses: z.array(ClauseCardSchema).catch([]),
}).catch({ clauses: [] });
export type ClausesResult = z.infer<typeof ClausesResultSchema>;

// ─── Analysis: Obligations & Dates ───────────────────────────────────────────

let _obligationCounter = 0;
export const ObligationSchema = z.object({
  id: z.string().catch(""),
  party: z.enum(["user", "other"]).catch("other"),
  description: z.string().catch(""),
  quote: z.string().catch(""),
  due: z.string().nullable().catch(null),
  consequence: z.string().nullable().catch(null),
}).catch({ id: "", party: "other", description: "", quote: "", due: null, consequence: null })
.transform((o) => ({ ...o, id: o.id || `obl-${++_obligationCounter}` }));
export type Obligation = z.infer<typeof ObligationSchema>;

export const MoneyItemSchema = z.object({
  amount: z.string().catch(""),
  purpose: z.string().catch(""),
  when: z.string().nullable().catch(null),
  refundable: z.enum(["yes", "no", "unclear"]).catch("unclear"),
  quote: z.string().catch(""),
}).catch({ amount: "", purpose: "", when: null, refundable: "unclear", quote: "" });
export type MoneyItem = z.infer<typeof MoneyItemSchema>;

export const DateItemSchema = z.object({
  label: z.string().catch(""),
  date_iso: z.string().nullable().catch(null),
  relative: z.string().nullable().catch(null),
  quote: z.string().catch(""),
}).catch({ label: "", date_iso: null, relative: null, quote: "" });
export type DateItem = z.infer<typeof DateItemSchema>;

export const ObligationsResultSchema = z.object({
  obligations: z.array(ObligationSchema).catch([]),
  money_items: z.array(MoneyItemSchema).catch([]),
  date_items: z.array(DateItemSchema).catch([]),
}).catch({ obligations: [], money_items: [], date_items: [] });
export type ObligationsResult = z.infer<typeof ObligationsResultSchema>;

// ─── Analysis: Action Plan ────────────────────────────────────────────────────

export const ActionPlanSchema = z.object({
  red_flags: z.array(
    z.object({
      title: z.string().catch(""),
      reason: z.string().catch(""),
      clause_id: z.string().nullable().catch(null),
    }).catch({ title: "", reason: "", clause_id: null })
  ).catch([]),
  missing_protections: z.array(
    z.object({
      title: z.string().catch(""),
      why_it_matters: z.string().catch(""),
    }).catch({ title: "", why_it_matters: "" })
  ).catch([]),
  negotiation_points: z.array(
    z.object({
      clause_id: z.string().nullable().catch(null),
      ask: z.string().catch(""),
      sample_wording: z.string().catch(""),
    }).catch({ clause_id: null, ask: "", sample_wording: "" })
  ).catch([]),
  checklist: z.array(z.string()).catch([]),
  lawyer_questions: z.array(z.string()).catch([]),
  documents_to_bring: z.array(z.string()).catch([]),
  options: z.array(
    z.object({
      title: z.string().catch(""),
      when_it_makes_sense: z.string().catch(""),
    }).catch({ title: "", when_it_makes_sense: "" })
  ).catch([]),
}).catch({ red_flags: [], missing_protections: [], negotiation_points: [], checklist: [], lawyer_questions: [], documents_to_bring: [], options: [] });
export type ActionPlan = z.infer<typeof ActionPlanSchema>;

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const ChatAnswerSchema = z.object({
  answer: z.string().catch(""),
  confidence: z.enum(["clear", "partial", "not_addressed"]).catch("partial"),
  citations: z.array(
    z.union([
      z.object({ quote: z.string().catch("") }),
      z.string().transform((s) => ({ quote: s })),
    ]).catch({ quote: "" })
  ).catch([]),
  general_info_note: z.string().nullable().catch(null),
  suggest_lawyer: z.boolean().catch(false),
}).catch({ answer: "", confidence: "partial", citations: [], general_info_note: null, suggest_lawyer: false });
export type ChatAnswer = z.infer<typeof ChatAnswerSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ─── Compare ──────────────────────────────────────────────────────────────────

export const CompareResultSchema = z.object({
  verdict: z.object({
    favored: z.enum(["A", "B", "neither"]).catch("neither"),
    reasoning: z.string().catch(""),
    risk_a: z.string().catch(""),
    risk_b: z.string().catch(""),
  }).catch({ favored: "neither", reasoning: "", risk_a: "", risk_b: "" }),
  topics: z.array(
    z.object({
      topic: z.string().catch("Unknown Topic"),
      a: z.object({ summary: z.string().catch(""), quote: z.string().nullable().catch(null) }).catch({ summary: "", quote: null }),
      b: z.object({ summary: z.string().catch(""), quote: z.string().nullable().catch(null) }).catch({ summary: "", quote: null }),
      change: z.enum(["better_a", "better_b", "similar", "only_a", "only_b"]).catch("similar"),
      importance: RiskSchema.catch("info"),
    }).catch({ topic: "Unknown", a: { summary: "", quote: null }, b: { summary: "", quote: null }, change: "similar", importance: "info" })
  ).catch([]),
  changes: z.array(
    z.object({
      type: z.enum(["added", "removed", "modified"]).catch("modified"),
      description: z.string().catch(""),
      severity: RiskSchema.catch("info"),
      quote_a: z.string().nullable().catch(null),
      quote_b: z.string().nullable().catch(null),
    }).catch({ type: "modified", description: "", severity: "info", quote_a: null, quote_b: null })
  ).catch([]),
  inconsistencies: z.array(
    z.object({
      description: z.string().catch(""),
      quotes: z.array(z.string()).catch([]),
    }).catch({ description: "", quotes: [] })
  ).catch([]),
  negotiation_points: z.array(
    z.union([
      z.object({
        ask: z.string().catch(""),
        sample_wording: z.string().catch(""),
      }),
      z.string().transform((s) => ({ ask: s, sample_wording: "" })),
    ]).catch({ ask: "", sample_wording: "" })
  ).catch([]),
}).catch({ verdict: { favored: "neither", reasoning: "", risk_a: "", risk_b: "" }, topics: [], changes: [], inconsistencies: [], negotiation_points: [] });
export type CompareResult = z.infer<typeof CompareResultSchema>;

// ─── API Request/Response schemas ─────────────────────────────────────────────

export const AnalyzeRequestSchema = z.object({
  text: z.string().min(1).max(600000),
  section: z.enum(["summary", "clauses", "obligations", "action"]),
  role: RoleSchema.default("Other"),
  docType: z.string().default("Auto-detect"),
  language: LanguageSchema.default("English"),
  jurisdiction: JurisdictionSchema.default("India"),
  clauseIds: z.array(z.string()).optional(),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const ChatRequestSchema = z.object({
  text: z.string().min(1).max(600000),
  messages: z.array(ChatMessageSchema).max(16),
  role: RoleSchema.default("Other"),
  language: LanguageSchema.default("English"),
  jurisdiction: JurisdictionSchema.default("India"),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const CompareRequestSchema = z.object({
  textA: z.string().min(1).max(600000),
  textB: z.string().min(1).max(600000),
  labelA: z.string().default("Document A"),
  labelB: z.string().default("Document B"),
  role: RoleSchema.default("Other"),
  language: LanguageSchema.default("English"),
});
export type CompareRequest = z.infer<typeof CompareRequestSchema>;

// ─── Verification ─────────────────────────────────────────────────────────────

export type VerificationStatus = "verified" | "close" | "unverified";

export interface VerifiedQuote {
  quote: string;
  status: VerificationStatus;
  startOffset: number | null;
  endOffset: number | null;
}
