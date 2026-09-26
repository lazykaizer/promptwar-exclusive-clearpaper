import { z } from "zod";

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  GEMINI_MODEL_PRO: z.string().min(1).default("gemini-2.5-pro"),
  GOOGLE_GENAI_USE_VERTEXAI: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
  GOOGLE_CLOUD_LOCATION: z.string().optional().default("us-central1"),
  RATE_LIMIT_PER_MIN: z.coerce.number().default(20),
  RATE_LIMIT_PER_HOUR: z.coerce.number().default(60),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables. Check .env.example.");
  }

  const env = parsed.data;

  if (env.GOOGLE_GENAI_USE_VERTEXAI) {
    if (!env.GOOGLE_CLOUD_PROJECT) {
      throw new Error(
        "GOOGLE_CLOUD_PROJECT is required when GOOGLE_GENAI_USE_VERTEXAI=true"
      );
    }
  } else {
    if (!env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is required when GOOGLE_GENAI_USE_VERTEXAI=false"
      );
    }
  }

  return env;
}

export const env = validateEnv();
