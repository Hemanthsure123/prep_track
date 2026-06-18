import "server-only";

import { GoogleGenAI, Type } from "@google/genai";

let cached: GoogleGenAI | null = null;

function client(): GoogleGenAI {
  if (!cached) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to your .env.local — see .env.example.",
      );
    }
    cached = new GoogleGenAI({ apiKey });
  }
  return cached;
}

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL ?? "gemini-2.5-pro";

// Gemini 2.5 Pro per-million-token pricing (prompts ≤ 200K).
// Source of truth: https://ai.google.dev/gemini-api/docs/pricing
export const INPUT_COST_PER_MTOK = 1.25;
export const OUTPUT_COST_PER_MTOK = 10.0;

export type CallGeminiResult = {
  text: string;
  inputTokens: number;
  outputTokens: number;
};

/**
 * JSON-schema-shaped response definition. Gemini 2.5 supports
 * `responseSchema` to force the model into a JSON shape matching this spec,
 * which removes the "did it forget the fence?" failure mode entirely.
 */
export const EXTRACTION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: ["rounds"],
  properties: {
    rounds: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          "roundNumber",
          "roundName",
          "roundType",
          "mode",
          "outcome",
          "topicCoverages",
        ],
        properties: {
          roundNumber: { type: Type.INTEGER },
          roundName: { type: Type.STRING },
          roundType: {
            type: Type.STRING,
            enum: [
              "ONLINE_ASSESSMENT",
              "TECHNICAL_1",
              "TECHNICAL_2",
              "TECHNICAL_3",
              "SYSTEM_DESIGN",
              "MANAGERIAL",
              "HR",
              "DIRECTOR",
              "BEHAVIORAL",
              "CODING_ROUND",
              "OTHER",
            ],
          },
          durationMinutes: { type: Type.INTEGER, nullable: true },
          mode: {
            type: Type.STRING,
            enum: [
              "ONLINE",
              "OFFLINE",
              "ON_PAPER",
              "GOOGLE_DOCS",
              "CODING_PLATFORM",
              "HYBRID",
            ],
          },
          outcome: {
            type: Type.STRING,
            enum: ["CLEARED", "REJECTED", "PENDING", "NO_SHOW"],
          },
          interviewStyle: { type: Type.STRING, nullable: true },
          keyLearnings: { type: Type.STRING, nullable: true },
          topicCoverages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["topicAreaName", "subTopicCount", "entries"],
              properties: {
                topicAreaName: { type: Type.STRING },
                subTopicCount: { type: Type.INTEGER },
                entries: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["subTopicName"],
                    properties: {
                      subTopicName: { type: Type.STRING },
                      exactQuestionText: {
                        type: Type.STRING,
                        nullable: true,
                      },
                      referenceUrl: {
                        type: Type.STRING,
                        nullable: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
): Promise<CallGeminiResult> {
  const response = await client().models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: EXTRACTION_RESPONSE_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 8000,
      // Gemini 2.5 uses dynamic thinking by default; cap the budget so a single
      // extraction can't blow up cost on a reasoning loop.
      thinkingConfig: { thinkingBudget: 2048 },
    },
  });

  const text = response.text ?? "";
  const inputTokens = response.usageMetadata?.promptTokenCount ?? 0;
  // candidatesTokenCount covers visible output; reasoning tokens are billed too.
  const outputTokens =
    (response.usageMetadata?.candidatesTokenCount ?? 0) +
    (response.usageMetadata?.thoughtsTokenCount ?? 0);

  return { text, inputTokens, outputTokens };
}

export function estimateCostUsd(
  inputTokens: number,
  outputTokens: number,
): number {
  return (
    (inputTokens / 1_000_000) * INPUT_COST_PER_MTOK +
    (outputTokens / 1_000_000) * OUTPUT_COST_PER_MTOK
  );
}
