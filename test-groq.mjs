import { generateText } from "./lib/ai/client.ts";

generateText('Return a JSON object with {"hello": "world"}', 'openai/gpt-oss-120b')
  .then(console.log)
  .catch(console.error);
