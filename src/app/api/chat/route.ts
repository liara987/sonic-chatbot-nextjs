import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getOpenAIClient, SONIC_SYSTEM_PROMPT } from "@/lib/openai";
import { chatRequestSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimiter";
import type { ChatApiResponse, ChatApiError } from "@/types/chat";

type ApiResponse = ChatApiResponse | ChatApiError;

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  // ── 1. Rate limiting ──────────────────────────────────────
  const { allowed, remaining } = checkRateLimit(request);
  if (!allowed) {
    return NextResponse.json<ChatApiError>(
      { error: "Muitas requisições. Tente novamente em breve." },
      {
        status: 429,
        headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
      }
    );
  }

  // ── 2. Parse & validate body ──────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json<ChatApiError>(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  let parsed: ReturnType<typeof chatRequestSchema.parse>;
  try {
    parsed = chatRequestSchema.parse(rawBody);
  } catch (err) {
    if (err instanceof ZodError) {
      const firstIssue = err.issues[0];
      return NextResponse.json<ChatApiError>(
        { error: firstIssue?.message ?? "Dados inválidos." },
        { status: 422 }
      );
    }
    return NextResponse.json<ChatApiError>(
      { error: "Dados inválidos." },
      { status: 422 }
    );
  }

  const { message, history } = parsed;

  // ── 3. Call OpenAI (server-side only) ────────────────────
  try {
    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SONIC_SYSTEM_PROMPT },
        ...history,
        { role: "user", content: message },
      ],
      max_tokens: 1024,
      temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      console.error("[api/chat] OpenAI returned an empty response");
      return NextResponse.json<ChatApiError>(
        { error: "Não recebi resposta do Sonic. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json<ChatApiResponse>(
      { reply },
      {
        status: 200,
        headers: { "X-RateLimit-Remaining": String(remaining) },
      }
    );
  } catch (err: unknown) {
    // Log full error server-side; return generic message to client
    console.error("[api/chat] OpenAI error:", err);

    const isAuthError =
      err instanceof Error && err.message.includes("OPENAI_API_KEY");

    return NextResponse.json<ChatApiError>(
      {
        error: isAuthError
          ? "Configuração do servidor inválida. Contate o administrador."
          : "Algo deu errado. Tente novamente mais tarde.",
      },
      { status: 502 }
    );
  }
}

export function GET(): NextResponse {
  return NextResponse.json({ error: "Método não permitido." }, { status: 405 });
}
