import { create } from "zustand";
import type {
  Summary,
  ClausesResult,
  ObligationsResult,
  ActionPlan,
  ChatMessage,
  Language,
  Role,
  Jurisdiction,
  ExtractionResult,
  CompareResult,
} from "@/lib/schemas";
import type { VerificationResult } from "@/lib/verify";

// ─── Section state wrapper ─────────────────────────────────────────────────────

export type SectionStatus = "idle" | "loading" | "done" | "error";

interface Section<T> {
  status: SectionStatus;
  data: T | null;
  error: string | null;
}

function makeSection<T>(): Section<T> {
  return { status: "idle", data: null, error: null };
}

// ─── Verified quote index ─────────────────────────────────────────────────────

export interface QuoteHighlight {
  quoteText: string;
  status: VerificationResult["status"];
  startOffset: number | null;
  endOffset: number | null;
  sourceId: string; // clause id or "chat-{n}"
}

// ─── Document context ─────────────────────────────────────────────────────────

export interface DocumentContext {
  role: Role;
  language: Language;
  jurisdiction: Jurisdiction;
  docType: string;
}

// ─── Main store state ─────────────────────────────────────────────────────────

interface DocumentStore {
  // Document data
  extraction: ExtractionResult | null;
  context: DocumentContext;

  // Analysis sections
  summary: Section<Summary>;
  clauses: Section<ClausesResult>;
  obligations: Section<ObligationsResult>;
  action: Section<ActionPlan>;

  // Highlights
  highlights: QuoteHighlight[];
  activeHighlightId: string | null;

  // Checklist state (in-memory)
  checklistState: Record<string, boolean>;

  // Chat
  chatMessages: ChatMessage[];
  chatLoading: boolean;

  // UI state
  activeTab: string;
  showSimpleSummary: boolean;

  // Actions
  setExtraction: (extraction: ExtractionResult | null) => void;
  setContext: (context: Partial<DocumentContext>) => void;
  setSectionLoading: (
    section: "summary" | "clauses" | "obligations" | "action"
  ) => void;
  setSectionData: (
    section: "summary" | "clauses" | "obligations" | "action",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ) => void;
  setSectionError: (
    section: "summary" | "clauses" | "obligations" | "action",
    error: string
  ) => void;
  resetSection: (
    section: "summary" | "clauses" | "obligations" | "action"
  ) => void;
  setHighlights: (highlights: QuoteHighlight[]) => void;
  addHighlight: (highlight: QuoteHighlight) => void;
  setActiveHighlight: (id: string | null) => void;
  toggleChecklist: (item: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  setChatLoading: (loading: boolean) => void;
  clearChat: () => void;
  setActiveTab: (tab: string) => void;
  setShowSimpleSummary: (show: boolean) => void;
  clearSession: () => void;
}

const defaultContext: DocumentContext = {
  role: "Other",
  language: "English",
  jurisdiction: "India",
  docType: "Auto-detect",
};

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  extraction: null,
  context: defaultContext,
  summary: makeSection<Summary>(),
  clauses: makeSection<ClausesResult>(),
  obligations: makeSection<ObligationsResult>(),
  action: makeSection<ActionPlan>(),
  highlights: [],
  activeHighlightId: null,
  checklistState: {},
  chatMessages: [],
  chatLoading: false,
  activeTab: "overview",
  showSimpleSummary: false,

  setExtraction: (extraction) => set({ extraction }),

  setContext: (context) =>
    set((state) => ({ context: { ...state.context, ...context } })),

  setSectionLoading: (section) =>
    set((state) => ({
      [section]: { ...state[section], status: "loading", error: null },
    })),

  setSectionData: (section, data) =>
    set({ [section]: { status: "done", data, error: null } }),

  setSectionError: (section, error) =>
    set({ [section]: { status: "error", data: null, error } }),

  resetSection: (section) =>
    set({ [section]: makeSection() }),

  setHighlights: (highlights) => set({ highlights }),

  addHighlight: (highlight) =>
    set((state) => ({
      highlights: [
        ...state.highlights.filter((h) => h.sourceId !== highlight.sourceId),
        highlight,
      ],
    })),

  setActiveHighlight: (id) => set({ activeHighlightId: id }),

  toggleChecklist: (item) =>
    set((state) => ({
      checklistState: {
        ...state.checklistState,
        [item]: !state.checklistState[item],
      },
    })),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message].slice(-16), // keep last 8 turns (16 messages)
    })),

  setChatLoading: (loading) => set({ chatLoading: loading }),

  clearChat: () => set({ chatMessages: [], chatLoading: false }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setShowSimpleSummary: (show) => set({ showSimpleSummary: show }),

  clearSession: () =>
    set({
      extraction: null,
      context: defaultContext,
      summary: makeSection<Summary>(),
      clauses: makeSection<ClausesResult>(),
      obligations: makeSection<ObligationsResult>(),
      action: makeSection<ActionPlan>(),
      highlights: [],
      activeHighlightId: null,
      checklistState: {},
      chatMessages: [],
      chatLoading: false,
      activeTab: "overview",
      showSimpleSummary: false,
    }),
}));

// ─── Compare store ─────────────────────────────────────────────────────────────

interface CompareStore {
  labelA: string;
  labelB: string;
  textA: string | null;
  textB: string | null;
  extractionA: ExtractionResult | null;
  extractionB: ExtractionResult | null;
  result: Section<CompareResult>;
  role: Role;
  language: Language;

  setLabel: (slot: "A" | "B", label: string) => void;
  setExtraction: (slot: "A" | "B", extraction: ExtractionResult | null) => void;
  setResultLoading: () => void;
  setResultData: (data: CompareResult) => void;
  setResultError: (error: string) => void;
  setRole: (role: Role) => void;
  setLanguage: (language: Language) => void;
  clearSession: () => void;
}

export const useCompareStore = create<CompareStore>((set) => ({
  labelA: "Document A",
  labelB: "Document B",
  textA: null,
  textB: null,
  extractionA: null,
  extractionB: null,
  result: makeSection<CompareResult>(),
  role: "Other",
  language: "English",

  setLabel: (slot, label) =>
    set(slot === "A" ? { labelA: label } : { labelB: label }),

  setExtraction: (slot, extraction) =>
    set(
      slot === "A"
        ? { extractionA: extraction, textA: extraction?.text ?? null }
        : { extractionB: extraction, textB: extraction?.text ?? null }
    ),

  setResultLoading: () =>
    set({ result: { status: "loading", data: null, error: null } }),

  setResultData: (data) =>
    set({ result: { status: "done", data, error: null } }),

  setResultError: (error) =>
    set({ result: { status: "error", data: null, error } }),

  setRole: (role) => set({ role }),
  setLanguage: (language) => set({ language }),

  clearSession: () =>
    set({
      labelA: "Document A",
      labelB: "Document B",
      textA: null,
      textB: null,
      extractionA: null,
      extractionB: null,
      result: makeSection<CompareResult>(),
    }),
}));
