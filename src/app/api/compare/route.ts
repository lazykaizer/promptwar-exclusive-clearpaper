import { NextResponse } from "next/server";
import { CompareRequestSchema, CompareResultSchema } from "@/lib/schemas";
import { runAI } from "@/lib/ai/run";
import { buildComparePrompt } from "@/lib/ai/prompts";
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

  const parsed = CompareRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((e: any) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    return NextResponse.json(
      { error: `Invalid request: ${errors}` },
      { status: 400 }
    );
  }

  const { textA, textB, labelA, labelB, role, language } = parsed.data;

  const prompt = buildComparePrompt(textA, labelA, textB, labelB, role, language);

  const result = await runAI({
    prompt,
    schema: CompareResultSchema,
    usePro: true, // Use more capable model for comparison
    timeoutMs: 120000,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error.userMessage },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: result.data });
}
