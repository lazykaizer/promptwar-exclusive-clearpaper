"use client";

import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Search, ZoomIn, ZoomOut, X } from "lucide-react";
import { useDocumentStore } from "@/store/useStore";

interface DocumentViewerProps {
  text: string;
  className?: string;
}

interface HighlightRange {
  start: number;
  end: number;
  id: string;
  isActive: boolean;
}

export const DocumentViewer = React.memo(function DocumentViewer({ text, className }: DocumentViewerProps) {
  const { highlights, activeHighlightId, setActiveHighlight } = useDocumentStore();
  const [fontSize, setFontSize] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Build highlight ranges from verified quotes
  const highlightRanges: HighlightRange[] = useMemo(() => {
    return highlights
      .filter((h) => h.status !== "unverified" && h.startOffset !== null && h.endOffset !== null)
      .map((h) => ({
        start: h.startOffset!,
        end: h.endOffset!,
        id: h.sourceId,
        isActive: h.sourceId === activeHighlightId,
      }));
  }, [highlights, activeHighlightId]);

  // Build rendered segments with highlights
  const segments = useMemo(() => {
    if (highlightRanges.length === 0 && !searchQuery.trim()) {
      return [{ text, type: "plain" as const, id: null }];
    }

    const allRanges: { start: number; end: number; id: string; isSearch: boolean; isActive: boolean }[] = [
      ...highlightRanges.map(h => ({ ...h, isSearch: false }))
    ];

    if (searchQuery.trim()) {
      const lowerText = text.toLowerCase();
      const lowerQuery = searchQuery.trim().toLowerCase();
      let startIdx = 0;
      let matchIdx = lowerText.indexOf(lowerQuery, startIdx);
      let matchCounter = 0;
      
      while (matchIdx !== -1) {
        allRanges.push({
          start: matchIdx,
          end: matchIdx + lowerQuery.length,
          id: `search-${matchCounter++}`,
          isSearch: true,
          isActive: false
        });
        startIdx = matchIdx + lowerQuery.length;
        matchIdx = lowerText.indexOf(lowerQuery, startIdx);
      }
    }

    const events: { pos: number; type: "start" | "end"; id: string }[] = [];
    for (const range of allRanges) {
      if (range.start < text.length && range.end <= text.length && range.start < range.end) {
        events.push({ pos: range.start, type: "start", id: range.id });
        events.push({ pos: range.end, type: "end", id: range.id });
      }
    }
    events.sort((a, b) => a.pos - b.pos || (a.type === "end" ? -1 : 1));

    const result: { text: string; type: "plain" | "highlight" | "search"; id: string | null; isActive?: boolean }[] = [];
    let cursor = 0;
    const activeIds = new Set<string>();

    for (const event of events) {
      if (event.pos > cursor) {
        const activeRanges = Array.from(activeIds)
          .map(id => allRanges.find(r => r.id === id))
          .filter(Boolean) as typeof allRanges;
        
        if (activeRanges.length === 0) {
          result.push({ text: text.slice(cursor, event.pos), type: "plain", id: null });
        } else {
          const isSearch = activeRanges.some(r => r.isSearch);
          const highlightRange = activeRanges.find(r => !r.isSearch);
          
          result.push({
            text: text.slice(cursor, event.pos),
            type: isSearch ? "search" : "highlight",
            id: highlightRange ? highlightRange.id : null,
            isActive: highlightRange ? highlightRange.isActive : false,
          });
        }
      }

      if (event.type === "start") {
        activeIds.add(event.id);
      } else {
        activeIds.delete(event.id);
      }
      cursor = event.pos;
    }

    if (cursor < text.length) {
      result.push({ text: text.slice(cursor), type: "plain", id: null });
    }

    return result;
  }, [text, highlightRanges, searchQuery]);

  // Scroll active highlight into view
  useEffect(() => {
    if (activeHighlightId && containerRef.current) {
      const mark = containerRef.current.querySelector(`[data-highlight-id="${activeHighlightId}"]`);
      if (mark) {
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeHighlightId]);

  // Scroll search match into view
  useEffect(() => {
    if (searchQuery.trim() && containerRef.current) {
      const mark = containerRef.current.querySelector(`mark[data-search="true"]`);
      if (mark) {
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [searchQuery, segments]);

  const handleMarkClick = useCallback(
    (id: string) => {
      setActiveHighlight(id === activeHighlightId ? null : id);
    },
    [activeHighlightId, setActiveHighlight]
  );

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
        {/* Search */}
        <div className="flex items-center gap-1.5 flex-1 max-w-xs">
          <Search size={14} strokeWidth={1.5} className="text-[var(--ink-faint)]" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search in document…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs bg-transparent border-0 focus:outline-none text-[var(--ink)] placeholder:text-[var(--ink-faint)] w-full"
            aria-label="Search in document"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search">
              <X size={12} className="text-[var(--ink-faint)] hover:text-[var(--ink)]" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <p className="text-xs text-[var(--ink-faint)] mr-2 hidden sm:block">
            {highlights.filter((h) => h.status !== "unverified").length} highlights
          </p>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.max(12, s - 1))}
            className="p-1 rounded hover:bg-[var(--surface-muted)] text-[var(--ink-muted)]"
            aria-label="Decrease font size"
          >
            <ZoomOut size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.min(20, s + 1))}
            className="p-1 rounded hover:bg-[var(--surface-muted)] text-[var(--ink-muted)]"
            aria-label="Increase font size"
          >
            <ZoomIn size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Document content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ fontSize, lineHeight: 1.8, maxWidth: "75ch", margin: "0 auto", width: "100%" }}
        role="document"
        aria-label="Document text"
      >
        <pre
          className="font-sans whitespace-pre-wrap break-words text-[var(--ink)]"
          style={{ fontSize: "inherit" }}
        >
          {segments.map((seg, i) => {
            if (seg.type === "plain") {
              return <span key={i}>{seg.text}</span>;
            }
            if (seg.type === "search") {
              return (
                <mark key={i} data-search="true" className="bg-yellow-300 text-black px-1 rounded shadow-sm font-medium">
                  {seg.text}
                </mark>
              );
            }
            return (
              <mark
                key={i}
                data-highlight-id={seg.id}
                className={cn("doc-highlight", seg.isActive && "active")}
                onClick={() => seg.id && handleMarkClick(seg.id)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && seg.id) {
                    e.preventDefault();
                    handleMarkClick(seg.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={seg.isActive}
                aria-label={`Highlighted clause — click to view details`}
              >
                {seg.text}
              </mark>
            );
          })}
        </pre>
      </div>
    </div>
  );
});
