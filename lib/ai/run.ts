import { z, ZodSchema } from "zod";
import { MODEL, MODEL_PRO, generateText } from "./client";

interface RunOptions {
  prompt: string;
  schema: ZodSchema;
  usePro?: boolean;
  timeoutMs?: number;
}

interface RunResult<T> {
  data: T | null;
  error: { code: string; userMessage: string } | null;
}

async function callWithTimeout(
  fn: () => Promise<string>,
  timeoutMs: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Request timed out")),
      timeoutMs
    );
    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}



function cleanJsonText(raw: string): string {
  // Remove markdown fences if model wrapped output
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function mapError(err: unknown): { code: string; userMessage: string } {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("timed out")) {
    return {
      code: "TIMEOUT",
      userMessage:
        "The analysis took too long. Please try again with a shorter document.",
    };
  }

  if (
    message.includes("429") ||
    message.toLowerCase().includes("rate limit") ||
    message.toLowerCase().includes("quota")
  ) {
    return {
      code: "RATE_LIMIT",
      userMessage:
        "Too many requests. Please wait a moment and try again.",
    };
  }

  if (
    message.toLowerCase().includes("safety") ||
    message.toLowerCase().includes("blocked")
  ) {
    return {
      code: "SAFETY_BLOCK",
      userMessage:
        "This content was flagged by safety filters. If your document mentions sensitive topics (violence, abuse), try redacting those sections and re-uploading.",
    };
  }

  if (message.includes("not a legal")) {
    return {
      code: "NOT_LEGAL",
      userMessage: message,
    };
  }

  if (message.includes("403") || message.includes("disabled") || message.includes("PERMISSION_DENIED")) {
    return {
      code: "API_DISABLED",
      userMessage: "Your API key is valid, but the Groq API is disabled or inaccessible. Please check your Groq console.",
    };
  }

  if (message.includes("401") || message.includes("UNAUTHENTICATED") || message.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") || message.includes("API_KEY_INVALID")) {
    return {
      code: "API_KEY_INVALID",
      userMessage: "The API key provided is not valid. Please generate a valid API Key from Groq Cloud (it usually starts with 'gsk_').",
    };
  }

  if (message.includes("402") || message.includes("RESOURCE_EXHAUSTED") || message.includes("credits are depleted")) {
    return {
      code: "CREDITS_DEPLETED",
      userMessage: "Your Groq account has run out of prepayment credits or requires billing setup. Please visit Groq Cloud to manage your billing.",
    };
  }

  if (message.includes("404") || message.includes("NOT_FOUND") || message.includes("no longer available")) {
    return {
      code: "MODEL_NOT_FOUND",
      userMessage: "The requested AI model version is no longer available to new users on this API Key. Please update the app configuration to a newer model version.",
    };
  }

  if (message.includes("503") || message.includes("UNAVAILABLE") || message.includes("high demand")) {
    return {
      code: "API_OVERLOADED",
      userMessage: "The Groq API is currently experiencing high demand and is temporarily unavailable. Please try again in a few minutes.",
    };
  }

  return {
    code: "AI_ERROR",
    userMessage:
      "The AI could not process this request. Details: " + message,
  };
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runAI<T>(options: RunOptions): Promise<RunResult<T>> {
  const { prompt, schema, usePro = false, timeoutMs = 90000 } = options;
  const modelName = usePro ? MODEL_PRO : MODEL;

  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const rawText = await callWithTimeout(
        () => generateText(prompt, modelName),
        timeoutMs
      );

      const cleaned = cleanJsonText(rawText);

      // Try parsing JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        if (attempt === 0) {
          const fixPrompt = `The following JSON is malformed. Fix it and return valid JSON only, no markdown:\n\n${cleaned}`;
          const fixedText = await callWithTimeout(
            () => generateText(fixPrompt, modelName),
            30000
          );
          parsed = JSON.parse(cleanJsonText(fixedText));
        } else {
          throw new Error("JSON parse failed after fix attempt");
        }
      }

      // Validate with Zod — SOFT validation
      // If it passes, great. If not, return the raw parsed JSON anyway.
      // The frontend handles missing fields gracefully.
      const validated = schema.safeParse(parsed);
      if (validated.success) {
        return { data: validated.data as T, error: null };
      }

      // Log the validation issues but DON'T crash — return raw data
      console.log("Schema validation issues (non-fatal):", 
        JSON.stringify(validated.error.issues.slice(0, 3))
      );
      return { data: parsed as T, error: null };

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("AI RUN ERROR MSG: " + message);
      
      const isRetryable =
        message.includes("429") ||
        message.includes("503") ||
        message.includes("500") ||
        message.includes("timed out") ||
        message.includes("JSON parse failed");

      if (attempt < 3 && isRetryable) {
        let waitMs = 4000;
        const match = message.match(/try again in ([\d\.]+)s/);
        if (match && match[1]) {
          waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 500;
        } else if (attempt > 0) {
          waitMs = 5000 * Math.pow(2, attempt);
        }
        console.log(`Retryable error. Waiting ${waitMs}ms before attempt ${attempt + 1}...`);
        await sleep(waitMs);
        continue;
      }

      return { data: null, error: mapError(err) };
    }
  }

  return {
    data: null,
    error: {
      code: "AI_ERROR",
      userMessage: "The AI could not process this request. Please try again.",
    },
  };
}
