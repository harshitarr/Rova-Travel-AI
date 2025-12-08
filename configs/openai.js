
// OpenRouter integration using OpenAI SDK
// Set OPENROUTER_API_KEY and OPENROUTER_BASE_URL in your environment (.env.local)
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1", // Use default endpoint
});

