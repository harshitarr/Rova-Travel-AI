import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

// Throw an error if the key is missing to help debug immediately
if (!apiKey) {
  throw new Error("GROQ_API_KEY is not set in environment variables");
}

export const groq = new Groq({
  apiKey: apiKey,
});