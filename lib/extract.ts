/**
 * Document text extraction pipeline.
 * Supports PDF (text layer + OCR fallback), DOCX, images, and plain text.
 */

import type { ExtractionResult } from "./schemas";

const MAX_CHARS = 150000;
const MIN_CHARS_PER_PAGE = 200; // below this, treat PDF as scanned

// ─── PDF extraction ───────────────────────────────────────────────────────────

async function extractPDF(
  buffer: ArrayBuffer
): Promise<{ text: string; pageCount: number; method: "text-layer" | "ocr" }> {
  const { extractText } = await import("unpdf");

  const result = await extractText(new Uint8Array(buffer), {
    mergePages: true,
  });

  const text = result.text ?? "";
  const pageCount = result.totalPages ?? 1;

  const avgCharsPerPage = pageCount > 0 ? text.length / pageCount : text.length;

  if (avgCharsPerPage >= MIN_CHARS_PER_PAGE && text.trim().length > 50) {
    return { text, pageCount, method: "text-layer" };
  }

  // Scanned PDF: fall back to Groq OCR
  const ocrText = await ocrWithGroq(buffer, "application/pdf");
  return { text: ocrText, pageCount, method: "ocr" };
}

// ─── DOCX extraction ──────────────────────────────────────────────────────────

async function extractDOCX(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({
    buffer: Buffer.from(buffer),
  });
  return result.value;
}

// ─── Image OCR via Groq Vision ─────────────────────────────────────────────────────

async function ocrWithGroq(
  buffer: ArrayBuffer,
  mimeType: string
): Promise<string> {
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY for OCR");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Please transcribe the text in this document faithfully and verbatim. Output only the raw text." },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }
      ],
      temperature: 0,
      max_tokens: 4096
    })
  });

  if (!res.ok) throw new Error(`OCR failed: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Text normalization ───────────────────────────────────────────────────────

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[ \t]+$/gm, "") // trim trailing spaces per line
    .replace(/\n{4,}/g, "\n\n\n") // max 3 consecutive newlines
    .trim();
}

// ─── Magic bytes check ────────────────────────────────────────────────────────

function detectMimeFromBytes(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer.slice(0, 8));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hex.startsWith("25504446")) return "application/pdf"; // %PDF
  if (hex.startsWith("504b0304")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; // PK (DOCX/ZIP)
  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e47")) return "image/png";
  if (hex.startsWith("47494638")) return "image/gif";
  if (hex.startsWith("52494646")) return "image/webp";

  return null;
}

// ─── Main extraction function ─────────────────────────────────────────────────

export async function extractDocument(
  buffer: ArrayBuffer,
  filename: string,
  declaredMime: string
): Promise<ExtractionResult> {
  const warnings: string[] = [];

  // Validate mime type from magic bytes (override declared MIME)
  const detectedMime = detectMimeFromBytes(buffer) ?? declaredMime;

  let text = "";
  let pageCount = 0;
  let method: ExtractionResult["method"] = "plain";

  try {
    if (detectedMime === "application/pdf") {
      const result = await extractPDF(buffer);
      text = result.text;
      pageCount = result.pageCount;
      method = result.method;

      if (method === "ocr") {
        warnings.push(
          "This appears to be a scanned document. Text was extracted using AI transcription, which may not be 100% accurate."
        );
      }
    } else if (
      detectedMime.includes("wordprocessingml") ||
      filename.toLowerCase().endsWith(".docx")
    ) {
      text = await extractDOCX(buffer);
      method = "docx";
    } else if (
      detectedMime.startsWith("image/") ||
      filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) {
      text = await ocrWithGroq(buffer, detectedMime);
      method = "ocr";
      warnings.push(
        "Text was extracted from an image using AI transcription, which may not be 100% accurate."
      );
    } else {
      // Plain text
      const decoder = new TextDecoder("utf-8", { fatal: false });
      text = decoder.decode(buffer);
      method = "plain";
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to extract text from document: ${message}`);
  }

  text = normalizeText(text);

  if (text.length === 0) {
    throw new Error(
      "No text could be extracted from this document. The file may be corrupted or contain only images that could not be read."
    );
  }

  // Truncate if over limit
  if (text.length > MAX_CHARS) {
    warnings.push(
      `This document is very long. Analysis is based on the first ${MAX_CHARS.toLocaleString("en-US")} characters (approximately ${Math.round(MAX_CHARS / 500)} pages). The rest has been trimmed.`
    );
    text = text.slice(0, MAX_CHARS);
  }

  return {
    text,
    pageCount,
    method,
    warnings,
  };
}

// ─── Paste text processing ────────────────────────────────────────────────────

export function processPastedText(raw: string): ExtractionResult {
  const warnings: string[] = [];
  let text = normalizeText(raw);

  if (text.length > MAX_CHARS) {
    warnings.push(
      `The pasted text is very long. Analysis is based on the first ${MAX_CHARS.toLocaleString("en-US")} characters. The rest has been trimmed.`
    );
    text = text.slice(0, MAX_CHARS);
  }

  return {
    text,
    pageCount: 0,
    method: "plain",
    warnings,
  };
}
