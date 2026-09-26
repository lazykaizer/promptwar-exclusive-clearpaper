import { generateText } from "./lib/ai/client.ts";
import { buildSummaryPrompt } from "./lib/ai/prompts.ts";

const prompt = buildSummaryPrompt("This is a test lease agreement. The tenant must pay $500 rent.", "Tenant", "English", "US");

async function main() {
  try {
    console.log("Starting generation...");
    const text = await generateText(prompt, "openai/gpt-oss-120b");
    console.log("Generated:", text);
  } catch (e) {
    console.error("Error generating text:", e);
  }
}
main();
