"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDocumentStore } from "@/store/useStore";
import { verifyQuote } from "@/lib/verify";
import { QuoteBlock } from "@/components/shared/QuoteBlock";
import { LoadingSpinner } from "@/components/shared/SectionState";
import type { ChatAnswer, ChatMessage } from "@/lib/schemas";
import {
  MessagesSquare,
  Send,
  Trash2,
  BookOpen,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AskTabProps {
  documentText: string;
  documentTitle: string;
  suggestedQuestions?: string[];
}

const CONFIDENCE_CONFIG = {
  clear: {
    label: "Clear from document",
    icon: CheckCircle,
    className: "text-[var(--risk-low)]",
  },
  partial: {
    label: "Partly addressed",
    icon: AlertCircle,
    className: "text-[var(--risk-medium)]",
  },
  not_addressed: {
    label: "Not addressed",
    icon: HelpCircle,
    className: "text-[var(--ink-faint)]",
  },
};

interface AnswerWithMeta {
  message: ChatMessage;
  answerData?: ChatAnswer;
}

export function AskTab({ documentText, documentTitle, suggestedQuestions = [] }: AskTabProps) {
  const { chatMessages, addChatMessage, chatLoading, setChatLoading, clearChat, context } = useDocumentStore();
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<AnswerWithMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [answers, chatLoading]);

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || chatLoading) return;
      setError(null);

      const userMessage: ChatMessage = { role: "user", content: question };
      addChatMessage(userMessage);
      setAnswers((prev) => [...prev, { message: userMessage }]);
      setChatLoading(true);
      setInput("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: documentText,
            messages: [...chatMessages, userMessage].slice(-16),
            role: context.role,
            language: context.language,
            jurisdiction: context.jurisdiction,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Failed to get answer." }));
          throw new Error(err.error || "Failed to get answer.");
        }

        const result = await res.json();
        const answerData: ChatAnswer = result.data;

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: answerData.answer,
        };
        addChatMessage(assistantMessage);
        setAnswers((prev) => [...prev, { message: assistantMessage, answerData }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to get answer.";
        setError(msg);
        setChatLoading(false);
      } finally {
        setChatLoading(false);
      }
    },
    [chatLoading, chatMessages, context, documentText, addChatMessage, setChatLoading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  function handleClear() {
    clearChat();
    setAnswers([]);
    setError(null);
  }

  // Group messages into pairs
  const messagePairs: { user: string; assistant?: AnswerWithMeta }[] = [];
  let i = 0;
  while (i < answers.length) {
    if (answers[i].message.role === "user") {
      const user = answers[i].message.content;
      const assistantEntry = answers[i + 1];
      messagePairs.push({ user, assistant: assistantEntry });
      i += 2;
    } else {
      i++;
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Suggested questions */}
      {answers.length === 0 && suggestedQuestions.length > 0 && (
        <div className="p-4 border-b border-[var(--border)]">
          <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide mb-2">
            Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 text-xs rounded-full border border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors"
                disabled={chatLoading}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" role="log" aria-label="Chat conversation" aria-live="polite">
        {answers.length === 0 && !chatLoading && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <MessagesSquare size={32} strokeWidth={1.2} className="text-[var(--ink-faint)]" aria-hidden="true" />
            <p className="text-sm text-[var(--ink-muted)] font-medium">Ask anything about your document</p>
            <p className="text-xs text-[var(--ink-faint)] max-w-xs">
              All answers are based only on the uploaded document text. Quotes are shown for every claim.
            </p>
          </div>
        )}

        {messagePairs.map((pair, idx) => (
          <div key={idx} className="space-y-4">
            {/* User question */}
            <div className="flex justify-end">
              <div className="max-w-xs rounded-2xl rounded-tr-sm bg-[var(--primary)] text-white px-4 py-2.5 text-sm leading-relaxed">
                {pair.user}
              </div>
            </div>

            {/* Assistant answer */}
            {pair.assistant && (
              <AssistantAnswer entry={pair.assistant} documentText={documentText} />
            )}
          </div>
        ))}

        {chatLoading && (
          <div className="flex items-center gap-2 text-[var(--ink-faint)]">
            <LoadingSpinner size={16} />
            <p className="text-sm">Looking through your document…</p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-[var(--risk-high-bg)] border border-[var(--border)]" role="alert">
            <p className="text-sm text-[var(--risk-high)]">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] p-4 space-y-2 bg-[var(--surface)]">
        {answers.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-[var(--ink-faint)] hover:text-[var(--risk-high)] transition-colors"
              aria-label="Clear conversation"
            >
              <Trash2 size={12} strokeWidth={1.5} aria-hidden="true" />
              Clear chat
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document…"
            rows={2}
            disabled={chatLoading}
            className={cn(
              "flex-1 resize-none rounded-[var(--radius-card)] border border-[var(--border-strong)] px-3 py-2",
              "text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
              "transition-colors duration-150 hover:border-[var(--primary)]",
              "disabled:opacity-60"
            )}
            aria-label="Ask a question about your document"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || chatLoading}
            className={cn(
              "flex-shrink-0 p-2.5 rounded-[var(--radius-card)] transition-colors",
              "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            aria-label="Send question"
          >
            <Send size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <p className="text-xs text-[var(--ink-faint)]">
          Answers are grounded in your document only. Press Enter to send.
        </p>
      </div>
    </div>
  );
}

function AssistantAnswer({ entry, documentText }: { entry: AnswerWithMeta; documentText: string }) {
  const { setActiveHighlight, addHighlight } = useDocumentStore();
  const { answerData, message } = entry;
  const [copied, setCopied] = useState(false);

  if (!answerData) {
    return (
      <div className="rounded-2xl rounded-tl-sm bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--ink-muted)] leading-relaxed max-w-prose">
        {message.content}
      </div>
    );
  }

  const confidenceConfig = CONFIDENCE_CONFIG[answerData.confidence];
  const ConfidenceIcon = confidenceConfig.icon;

  async function handleCopy() {
    await navigator.clipboard.writeText(answerData?.answer ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/* Answer bubble */}
      <div className="rounded-2xl rounded-tl-sm bg-[var(--surface-muted)] px-4 py-3 space-y-3 border border-[var(--border)] max-w-prose">
        <p className="text-sm text-[var(--ink)] leading-relaxed">{answerData.answer}</p>

        {/* General info note */}
        {answerData.general_info_note && (
          <div className="border-l-2 border-[var(--ink-faint)] pl-3">
            <p className="text-xs text-[var(--ink-faint)] italic">
              <span className="font-medium">General information (not from your document): </span>
              {answerData.general_info_note}
            </p>
          </div>
        )}

        {/* Lawyer suggestion */}
        {answerData.suggest_lawyer && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-[var(--primary-soft)]">
            <BookOpen size={13} strokeWidth={1.5} className="text-[var(--primary)] mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-xs text-[var(--primary)]">
              This is worth a quick conversation with a lawyer before making a decision.
            </p>
          </div>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-3 px-1">
        <span className={cn("flex items-center gap-1 text-xs", confidenceConfig.className)}>
          <ConfidenceIcon size={12} strokeWidth={1.5} aria-hidden="true" />
          {confidenceConfig.label}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors"
          aria-label="Copy answer to clipboard"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Citations */}
      {answerData.citations.length > 0 && (
        <div className="space-y-2 pl-1">
          <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wide">
            Supporting quotes
          </p>
          {answerData.citations?.map((citation, i) => {
            const verification = verifyQuote(citation.quote, documentText);
            const highlightId = `chat-citation-${Date.now()}-${i}`;

            function handleHighlight() {
              addHighlight({
                quoteText: citation.quote,
                status: verification.status,
                startOffset: verification.startOffset,
                endOffset: verification.endOffset,
                sourceId: highlightId,
              });
              if (verification.status !== "unverified") {
                setActiveHighlight(highlightId);
              }
            }

            return (
              <QuoteBlock
                key={i}
                quote={citation.quote}
                verificationStatus={verification.status}
                onClickHighlight={verification.status !== "unverified" ? handleHighlight : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
