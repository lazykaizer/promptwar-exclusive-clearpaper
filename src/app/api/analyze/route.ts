import { NextResponse } from "next/server";
import { AnalyzeRequestSchema, SummarySchema, ClausesResultSchema, ObligationsResultSchema, ActionPlanSchema } from "@/lib/schemas";
import { runAI } from "@/lib/ai/run";
import {
  buildSummaryPrompt,
  buildClausesPrompt,
  buildObligationsPrompt,
  buildActionPrompt,
} from "@/lib/ai/prompts";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((e: any) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return NextResponse.json(
      { error: `Invalid request: ${errors}` },
      { status: 400 }
    );
  }

  const { text, section, role, language, jurisdiction, clauseIds } = parsed.data;

  console.log(`[API ANALYZE] Received request for section: ${section}`);
  console.log(`[API ANALYZE] GROQ_API_KEY is defined: ${!!process.env.GROQ_API_KEY}`);

  try {
    let result;

    switch (section) {
      case "summary": {
        const prompt = buildSummaryPrompt(text, role, language, jurisdiction);
        result = await runAI({ prompt, schema: SummarySchema });
        break;
      }
      case "clauses": {
        const prompt = buildClausesPrompt(text, role, language, jurisdiction);
        result = await runAI({ prompt, schema: ClausesResultSchema });
        break;
      }
      case "obligations": {
        const prompt = buildObligationsPrompt(text, role, language, jurisdiction);
        result = await runAI({ prompt, schema: ObligationsResultSchema });
        break;
      }
      case "action": {
        const prompt = buildActionPrompt(
          text,
          role,
          language,
          jurisdiction,
          clauseIds ?? []
        );
        result = await runAI({ prompt, schema: ActionPlanSchema });
        break;
      }
      default:
        return NextResponse.json(
          { error: "Invalid section." },
          { status: 400 }
        );
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error.userMessage },
        { status: 200 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (err) {
    // removed console.error to avoid crashing Next.js
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 200 }
    );
  }
}
