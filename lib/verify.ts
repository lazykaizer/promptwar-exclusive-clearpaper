/**
 * Quote verification module.
 * Verifies that AI-generated quotes actually appear in the source document.
 * Returns verification status and character offsets for highlighting.
 */

export type VerificationStatus = "verified" | "close" | "unverified";

export interface VerificationResult {
  status: VerificationStatus;
  startOffset: number | null;
  endOffset: number | null;
}

// ─── Text normalization ───────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    // Smart quotes → straight
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Em/en dashes → hyphen
    .replace(/[\u2013\u2014]/g, "-")
    // Soft hyphen (sometimes inserted for line breaks)
    .replace(/\u00AD/g, "")
    // Zero-width characters
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
    // Hyphenated line breaks (word-\nword → wordword)
    .replace(/-\s*\n\s*/g, "")
    // Collapse all whitespace (including newlines) to single space
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Build an index: normalized offset → original offset ──────────────────────

interface NormalizedIndex {
  normalized: string;
  // Maps each position in normalized string → position in original string
  offsetMap: Int32Array;
}

function buildNormalizedIndex(original: string): NormalizedIndex {
  let normalized = "";
  const offsetMap: number[] = [];

  let prevWasSpace = false;
  let i = 0;

  // Apply transformations character by character (simplified for mapping)
  const preprocessed = original
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00AD/g, " ") // replace soft hyphen with space (tracked)
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, " ") // zero-width → space
    .replace(/-\s*\n\s*/g, ""); // remove hyphenated line breaks

  for (; i < preprocessed.length; i++) {
    const ch = preprocessed[i].toLowerCase();
    const isSpace = /\s/.test(ch);

    if (isSpace) {
      if (!prevWasSpace && normalized.length > 0) {
        normalized += " ";
        offsetMap.push(i);
        prevWasSpace = true;
      }
    } else {
      normalized += ch;
      offsetMap.push(i);
      prevWasSpace = false;
    }
  }

  return {
    normalized: normalized.trim(),
    offsetMap: new Int32Array(offsetMap),
  };
}

// ─── Dice coefficient on word trigrams ────────────────────────────────────────

function wordNgrams(text: string, n: number): Set<string> {
  const words = text.split(" ").filter(Boolean);
  const ngrams = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(" "));
  }
  return ngrams;
}

function diceCoefficient(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }

  return (2 * intersection) / (a.size + b.size);
}

// ─── Find best fuzzy window in document ───────────────────────────────────────

function findFuzzyWindow(
  normalizedDoc: string,
  normalizedQuote: string,
  minSimilarity: number
): { start: number; end: number; similarity: number } | null {
  const quoteWords = normalizedQuote.split(" ").filter(Boolean);
  const docWords = normalizedDoc.split(" ").filter(Boolean);

  if (quoteWords.length === 0 || docWords.length === 0) return null;

  const windowSize = quoteWords.length;
  const quoteNgrams = wordNgrams(normalizedQuote, 3);

  let bestSimilarity = 0;
  let bestStart = -1;

  // Slide a window of quote length over the document words
  for (let i = 0; i <= docWords.length - windowSize; i++) {
    const window = docWords.slice(i, i + windowSize).join(" ");
    const windowNgrams = wordNgrams(window, 3);
    const sim = diceCoefficient(quoteNgrams, windowNgrams);

    if (sim > bestSimilarity) {
      bestSimilarity = sim;
      bestStart = i;
    }
  }

  if (bestSimilarity < minSimilarity || bestStart < -1) return null;

  // Map word index back to character index in normalized string
  let charStart = 0;
  for (let i = 0; i < bestStart; i++) {
    charStart += docWords[i].length + 1;
  }
  const window = docWords.slice(bestStart, bestStart + windowSize).join(" ");
  const charEnd = charStart + window.length;

  return { start: charStart, end: charEnd, similarity: bestSimilarity };
}

// ─── Map normalized offset back to original offset ────────────────────────────

function normalizedToOriginal(
  normalizedOffset: number,
  offsetMap: Int32Array
): number {
  if (normalizedOffset < 0) return 0;
  if (normalizedOffset >= offsetMap.length) return offsetMap[offsetMap.length - 1] ?? 0;
  return offsetMap[normalizedOffset];
}

// ─── Main verification function ───────────────────────────────────────────────

export function verifyQuote(
  quote: string,
  documentText: string
): VerificationResult {
  if (!quote || !documentText) {
    return { status: "unverified", startOffset: null, endOffset: null };
  }

  const { normalized: normDoc, offsetMap } = buildNormalizedIndex(documentText);
  const normQuote = normalize(quote);

  // 1. Exact match (substring)
  const exactIdx = normDoc.indexOf(normQuote);
  if (exactIdx !== -1) {
    const startOffset = normalizedToOriginal(exactIdx, offsetMap);
    const endOffset = normalizedToOriginal(exactIdx + normQuote.length - 1, offsetMap) + 1;
    return { status: "verified", startOffset, endOffset };
  }

  // 2. Fuzzy match (dice coefficient on 3-grams ≥ 0.85)
  const fuzzy = findFuzzyWindow(normDoc, normQuote, 0.85);
  if (fuzzy) {
    const startOffset = normalizedToOriginal(fuzzy.start, offsetMap);
    const endOffset = normalizedToOriginal(fuzzy.end - 1, offsetMap) + 1;
    return { status: "close", startOffset, endOffset };
  }

  return { status: "unverified", startOffset: null, endOffset: null };
}

// ─── Batch verification ───────────────────────────────────────────────────────

export function verifyQuotes(
  quotes: string[],
  documentText: string
): VerificationResult[] {
  return quotes.map((q) => verifyQuote(q, documentText));
}
