import "server-only";

import {
  callGemini,
  GEMINI_MODEL,
  estimateCostUsd as estimateGeminiCost,
} from "./gemini";

/**
 * Unified result returned by any LLM provider. `provider`/`model` record which
 * backend actually answered, so callers (and the import UI) can see whether a
 * fallback kicked in.
 */
export type LlmResult = {
  text: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  provider: string;
  model: string;
};

type ProviderSpec = {
  name: string;
  /** Only providers with a configured API key are attempted. */
  isConfigured: () => boolean;
  call: (systemPrompt: string, userPrompt: string) => Promise<LlmResult>;
};

/**
 * A quota / rate-limit failure — the signal to fall back to the next provider.
 * Gemini reports this as HTTP 429 / RESOURCE_EXHAUSTED; the OpenAI-compatible
 * providers report it as HTTP 429.
 */
export function isQuotaError(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  if (status === 429) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /\b429\b|RESOURCE_EXHAUSTED|quota|rate.?limit|exhausted|too many requests|overloaded/i.test(
    msg,
  );
}

// ---------------------------------------------------------------------------
// OpenAI-compatible chat completions (OpenAI, Mistral, Groq share this API)
// ---------------------------------------------------------------------------

type OpenAICompatConfig = {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  inputCostPerMTok: number;
  outputCostPerMTok: number;
};

async function callOpenAICompatible(
  cfg: OpenAICompatConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<LlmResult> {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 8000,
      // All three providers honour json_object mode. The system prompt already
      // instructs "return only valid JSON", which OpenAI requires to be present.
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(
      `${cfg.provider} (${cfg.model}) HTTP ${res.status}: ${body.slice(0, 300)}`,
    );
    (err as { status?: number }).status = res.status;
    throw err;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content ?? "";
  const inputTokens = data.usage?.prompt_tokens ?? 0;
  const outputTokens = data.usage?.completion_tokens ?? 0;
  const costUsd =
    (inputTokens / 1_000_000) * cfg.inputCostPerMTok +
    (outputTokens / 1_000_000) * cfg.outputCostPerMTok;

  return {
    text,
    inputTokens,
    outputTokens,
    costUsd,
    provider: cfg.provider,
    model: cfg.model,
  };
}

// ---------------------------------------------------------------------------
// Provider registry — tried in order; only configured ones are attempted.
// ---------------------------------------------------------------------------

const PROVIDERS: ProviderSpec[] = [
  {
    name: "gemini",
    isConfigured: () => !!process.env.GEMINI_API_KEY,
    call: async (system, user) => {
      const r = await callGemini(system, user);
      return {
        ...r,
        costUsd: estimateGeminiCost(r.inputTokens, r.outputTokens),
        provider: "gemini",
        model: GEMINI_MODEL,
      };
    },
  },
  {
    name: "openai",
    isConfigured: () => !!process.env.OPENAI_API_KEY,
    call: (system, user) =>
      callOpenAICompatible(
        {
          provider: "openai",
          baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
          apiKey: process.env.OPENAI_API_KEY as string,
          model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          inputCostPerMTok: 0.15,
          outputCostPerMTok: 0.6,
        },
        system,
        user,
      ),
  },
  {
    name: "mistral",
    isConfigured: () => !!process.env.MISTRAL_API_KEY,
    call: (system, user) =>
      callOpenAICompatible(
        {
          provider: "mistral",
          baseUrl: process.env.MISTRAL_BASE_URL ?? "https://api.mistral.ai/v1",
          apiKey: process.env.MISTRAL_API_KEY as string,
          model: process.env.MISTRAL_MODEL ?? "mistral-large-latest",
          inputCostPerMTok: 2.0,
          outputCostPerMTok: 6.0,
        },
        system,
        user,
      ),
  },
  {
    name: "groq",
    isConfigured: () => !!process.env.GROQ_API_KEY,
    call: (system, user) =>
      callOpenAICompatible(
        {
          provider: "groq",
          baseUrl:
            process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1",
          apiKey: process.env.GROQ_API_KEY as string,
          model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
          inputCostPerMTok: 0.59,
          outputCostPerMTok: 0.79,
        },
        system,
        user,
      ),
  },
];

/**
 * Calls the first configured provider; on a quota/429 (or any provider error)
 * it falls back to the next configured provider in the chain
 * (Gemini → OpenAI → Mistral → Groq). Throws only if every provider fails.
 */
export async function callLLMWithFallback(
  systemPrompt: string,
  userPrompt: string,
): Promise<LlmResult> {
  const active = PROVIDERS.filter((p) => p.isConfigured());

  if (active.length === 0) {
    throw new Error(
      "No LLM provider is configured. Set at least one of GEMINI_API_KEY, " +
        "OPENAI_API_KEY, MISTRAL_API_KEY or GROQ_API_KEY in your .env.local.",
    );
  }

  let lastErr: unknown;
  for (let i = 0; i < active.length; i++) {
    const provider = active[i];
    try {
      return await provider.call(systemPrompt, userPrompt);
    } catch (err) {
      lastErr = err;
      const next = active[i + 1]?.name;
      const reason = isQuotaError(err)
        ? "quota/rate-limit (429)"
        : err instanceof Error
          ? err.message
          : "unknown error";
      if (next) {
        console.warn(
          `[ai] provider "${provider.name}" failed (${reason}); falling back to "${next}".`,
        );
      } else {
        console.error(
          `[ai] provider "${provider.name}" failed (${reason}); no more providers to try.`,
        );
      }
    }
  }

  const attempted = active.map((p) => p.name).join(", ");
  const detail = lastErr instanceof Error ? lastErr.message : String(lastErr);
  throw new Error(
    `All configured LLM providers failed (tried: ${attempted}). Last error: ${detail}`,
  );
}
