/** Primary model identifier for standard analysis operations. */
export const MODEL = "openai/gpt-oss-120b";

/** Pro model identifier for complex comparison operations. */
export const MODEL_PRO = "openai/gpt-oss-120b";

/**
 * Sends a prompt to the Groq inference API and returns the raw text response.
 * @param prompt - The full prompt string to send as a user message.
 * @param modelName - The model identifier to use (MODEL or MODEL_PRO).
 * @returns The raw text content from the model's response.
 * @throws {Error} If the API key is missing, the request fails, or no text is returned.
 */

export async function generateText(prompt: string, modelName: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY in environment");
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";
  const body = {
    model: modelName,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 4096,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API Error: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  
  if (!text) {
    throw new Error("No text returned from Groq");
  }

  return text;
}
