import { generateText } from "./lib/ai/client.ts";

async function main() {
  const r = await generateText('Return ONLY valid JSON with no extra text: {"hello": "world"}', 'openai/gpt-oss-120b');
  console.log("Raw result:", r.substring(0, 300));
  const cleaned = r.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    JSON.parse(cleaned);
    console.log("JSON parse: SUCCESS");
  } catch (e) {
    console.log("JSON parse: FAILED -", e.message);
  }
}
main().catch(console.error);
