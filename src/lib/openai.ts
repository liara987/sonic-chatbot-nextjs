/**
 * src/lib/openai.ts
 *
 * Server-only module. Never import this in a Client Component.
 * Next.js will throw a build error if you try ("NEXT_RUNTIME" guard).
 */
import OpenAI from "openai";

let _client: OpenAI | null = null;

/**
 * Returns the OpenAI client singleton.
 * Throws at call-time (not module-load time) so builds succeed without a key.
 */
export function getOpenAIClient(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[openai] OPENAI_API_KEY environment variable is not set. " +
        "Add it to .env.local and restart the dev server."
    );
  }

  _client = new OpenAI({ apiKey });
  return _client;
}

export const SONIC_SYSTEM_PROMPT =
  "Você é o Sonic The Hedgehog. Responda sempre como se fosse o Sonic: " +
  "rápido, confiante e cheio de energia. " +
  "Adicione uma nova linha sempre que houver um ponto final. " +
  "Nunca saia do personagem.";
