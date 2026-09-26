import { generateText } from "./lib/ai/client.ts";
import { SummarySchema } from "./lib/schemas.ts";

function cleanJsonText(raw) {
  return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

async function main() {
  const raw = await generateText(
    'Return a JSON summary analysis of this lease: Tenant pays 500 rent monthly. Landlord is John. Term 12 months.',
    'openai/gpt-oss-120b'
  );
  console.log("Raw (first 200):", raw.substring(0, 200));
  const cleaned = cleanJsonText(raw);
  const parsed = JSON.parse(cleaned);
  const result = SummarySchema.safeParse(parsed);
  console.log("Valid:", result.success);
  if (!result.success) {
    console.log("Errors:", JSON.stringify(result.error.issues.slice(0, 5)));
  } else {
    console.log("Data keys:", Object.keys(result.data));
  }
}
main().catch(console.error);
