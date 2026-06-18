import "server-only";

import { z } from "zod";

import { callLLMWithFallback } from "./providers";

export type ParsedCsvRow = Record<string, string>;

export const EXTRACTION_SYSTEM_PROMPT = `You are an extraction agent for an interview-experience platform. Your job is to read a freeform description of a company's interview rounds and convert it into strict JSON matching the schema below.

CRITICAL RULES:
1. You extract ONLY what is explicitly stated in the input. Do not invent topics, questions, difficulty levels, or URLs that aren't in the source text.
2. If a field is uncertain or absent, return null. Never guess.
3. Sub-topic names must be terse and reusable across companies. Prefer "Graphs" over "Graph problems including BFS and DFS". Prefer "Dynamic Programming" over "Hard DP question on knapsack".
4. Match each sub-topic to one of the 15 TopicAreas: DSA Easy, DSA Medium-Hard, Frontend Concepts, Frontend Coding, Backend Concepts, Backend Coding, DBMS, AI / ML / GenAI / Agents, System Design, OOPs, Core CS, Operating Systems, Linux, Communication Skills, Scenario / Situational.
5. When the source mentions a specific question with prose like "they asked X" or "the problem was Y", capture that verbatim in exactQuestionText. Otherwise leave it null.
6. Extract any URLs you see and attach them to the most relevant sub-topic entry as referenceUrl. Recognize platforms: leetcode.com, geeksforgeeks.org, hackerrank.com, codeforces.com, codingninjas.com, interviewbit.com.
7. Round types must map to one of: ONLINE_ASSESSMENT, TECHNICAL_1, TECHNICAL_2, TECHNICAL_3, SYSTEM_DESIGN, MANAGERIAL, HR, DIRECTOR, BEHAVIORAL, CODING_ROUND, OTHER. Use fuzzy intent: "OA" -> ONLINE_ASSESSMENT, "Tech 1" -> TECHNICAL_1, "Manager round" -> MANAGERIAL, etc.
8. Interview modes must map to one of: ONLINE, OFFLINE, ON_PAPER, GOOGLE_DOCS, CODING_PLATFORM, HYBRID. Default to ONLINE if not stated.
9. Return ONLY valid JSON. No prose before or after. No markdown code fences. Just the JSON object.

OUTPUT SCHEMA (return exactly this shape):

{
  "rounds": [
    {
      "roundNumber": 1,
      "roundName": "string",
      "roundType": "TECHNICAL_1",
      "durationMinutes": 60 | null,
      "mode": "ONLINE",
      "outcome": "CLEARED",
      "interviewStyle": "string" | null,
      "keyLearnings": "string" | null,
      "topicCoverages": [
        {
          "topicAreaName": "DSA Medium-Hard",
          "subTopicCount": 2,
          "entries": [
            {
              "subTopicName": "Graphs",
              "exactQuestionText": "Find shortest path in unweighted graph" | null,
              "referenceUrl": "https://leetcode.com/..." | null
            },
            {
              "subTopicName": "Dynamic Programming",
              "exactQuestionText": null,
              "referenceUrl": null
            }
          ]
        }
      ]
    }
  ]
}`;

export function buildUserPrompt(row: ParsedCsvRow): string {
  const rounds = [1, 2, 3, 4, 5]
    .map((n) => {
      const context = row[`round_${n}_context`];
      if (!context || context === "NA" || context.trim() === "") return null;
      return `
ROUND ${n}:
  Name: ${row[`round_${n}_name`] ?? "NA"}
  Type hint: ${row[`round_${n}_type`] ?? "NA"}
  Duration: ${row[`round_${n}_duration_min`] ?? "NA"}
  Mode: ${row[`round_${n}_mode`] ?? "NA"}
  Outcome: ${row[`round_${n}_outcome`] ?? "NA"}
  Context:
${context}
`;
    })
    .filter(Boolean)
    .join("\n");

  return `Company: ${row.company_name}
Role: ${row.role}
Role Level: ${row.role_level}
Year: ${row.year}

The candidate experiences for this company are summarized below. Extract structured data per round.

${rounds}

Return only the JSON object per the schema. No preamble.`;
}

export const ROUND_TYPES = [
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
] as const;
export const INTERVIEW_MODES = [
  "ONLINE",
  "OFFLINE",
  "ON_PAPER",
  "GOOGLE_DOCS",
  "CODING_PLATFORM",
  "HYBRID",
] as const;
export const ROUND_OUTCOMES = [
  "CLEARED",
  "REJECTED",
  "PENDING",
  "NO_SHOW",
] as const;

export const llmEntrySchema = z.object({
  subTopicName: z.string().min(1),
  exactQuestionText: z.string().nullish(),
  referenceUrl: z.string().url().nullish(),
});

export const llmTopicCoverageSchema = z.object({
  topicAreaName: z.string().min(1),
  subTopicCount: z.number().int().min(0),
  entries: z.array(llmEntrySchema),
});

export const llmRoundSchema = z.object({
  roundNumber: z.number().int().min(1),
  roundName: z.string().min(1),
  roundType: z.enum(ROUND_TYPES),
  durationMinutes: z.number().int().nullish(),
  mode: z.enum(INTERVIEW_MODES),
  outcome: z.enum(ROUND_OUTCOMES),
  interviewStyle: z.string().nullish(),
  keyLearnings: z.string().nullish(),
  topicCoverages: z.array(llmTopicCoverageSchema),
});

export const llmOutputSchema = z.object({
  rounds: z.array(llmRoundSchema),
});

export type LlmExtraction = z.infer<typeof llmOutputSchema>;

export type ExtractionResult = {
  extracted: LlmExtraction;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  /** Which backend actually answered (gemini | openai | mistral | groq). */
  provider: string;
  model: string;
};

export async function extractInterviewFromRow(
  row: ParsedCsvRow,
): Promise<ExtractionResult> {
  const userPrompt = buildUserPrompt(row);
  // Tries Gemini first, then falls back to OpenAI / Mistral / Groq (whichever
  // are configured) when a provider is quota-exhausted (429) or otherwise fails.
  const { text, inputTokens, outputTokens, costUsd, provider, model } =
    await callLLMWithFallback(EXTRACTION_SYSTEM_PROMPT, userPrompt);

  // Providers with structured output return clean JSON, but fence-strip anyway
  // in case a model wraps it in a markdown code block.
  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `LLM (${provider}/${model}) returned invalid JSON. First 500 chars: ${cleaned.slice(0, 500)}`,
    );
  }

  const validated = llmOutputSchema.parse(parsed);

  return {
    extracted: validated,
    inputTokens,
    outputTokens,
    costUsd,
    provider,
    model,
  };
}
