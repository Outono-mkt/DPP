import "server-only";

import type { ProductGenerationInput, ProductGenerationResult } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";

export async function generateWithGemini(
  input: ProductGenerationInput,
): Promise<ProductGenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await callGemini(apiKey, buildProductPrompt(input), 0.7);

  if (!response.ok) {
    throw new Error("Gemini request failed.");
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return parseProductGenerationResult(text);
}

export async function testGeminiConnection(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await callGemini(apiKey, 'Responda apenas com {"status":"ok"}.', 0);

  if (!response.ok) {
    throw new Error("Gemini test request failed.");
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = text ? parseJsonObject(text) : null;

  if (!parsed || parsed.status !== "ok") {
    throw new Error("Gemini test response is invalid.");
  }
}

export function buildProductPrompt(input: ProductGenerationInput): string {
  return `Voce e um estrategista de infoprodutos especialista em criar produtos digitais de alta conversao para o mercado brasileiro.

Com base nas informacoes abaixo, crie um produto digital completo e viavel para essa pessoa.

INFORMACOES DO USUARIO:
- O que sabe fazer: ${input.skill}
- Publico que quer ajudar: ${input.audience}
- Maior dor do publico: ${input.audiencePain}
- Transformacao entregue: ${input.transformation}
- Formato preferido: ${input.preferredFormat}
- Nivel de experiencia: ${input.experienceLevel}

Gere exatamente isso, em formato JSON:
{
  "nicho": "descricao especifica do nicho em uma frase",
  "ideia": "descricao do produto em uma frase clara e objetiva",
  "nomes": [
    "nome 1",
    "nome 2",
    "nome 3"
  ],
  "promessa": "promessa principal do produto com prazo, resultado e diferencial",
  "estrutura": [
    "capitulo ou modulo 1",
    "capitulo ou modulo 2",
    "capitulo ou modulo 3",
    "capitulo ou modulo 4",
    "capitulo ou modulo 5"
  ],
  "preco": "faixa de preco sugerida com justificativa em uma linha",
  "proximo_passo": "texto motivacional de 2 linhas incentivando o usuario a comecar agora"
}

Regras:
- Seja especifico. Nunca generico.
- Use linguagem simples e direta.
- O produto deve ser viavel para criar em poucos dias.
- A promessa deve ter prazo, resultado concreto e diferencial.
- Responda apenas com o JSON. Sem texto adicional.`;
}

function callGemini(apiKey: string, prompt: string, temperature: number) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
          responseMimeType: "application/json",
        },
      }),
    },
  );
}

function parseProductGenerationResult(text: string): ProductGenerationResult {
  const parsed = parseJsonObject(text);

  if (!parsed) {
    throw new Error("Gemini response is not valid JSON.");
  }

  if (
    typeof parsed.nicho !== "string" ||
    typeof parsed.ideia !== "string" ||
    !isThreeStringArray(parsed.nomes) ||
    typeof parsed.promessa !== "string" ||
    !isFiveStringArray(parsed.estrutura) ||
    typeof parsed.preco !== "string" ||
    typeof parsed.proximo_passo !== "string"
  ) {
    throw new Error("Gemini response does not match the expected schema.");
  }

  return {
    nicho: parsed.nicho,
    ideia: parsed.ideia,
    nomes: parsed.nomes,
    promessa: parsed.promessa,
    estrutura: parsed.estrutura,
    preco: parsed.preco,
    proximo_passo: parsed.proximo_passo,
  };
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    const parsed: unknown = JSON.parse(cleaned);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function isThreeStringArray(value: unknown): value is [string, string, string] {
  return Array.isArray(value) && value.length === 3 && value.every(isString);
}

function isFiveStringArray(
  value: unknown,
): value is [string, string, string, string, string] {
  return Array.isArray(value) && value.length === 5 && value.every(isString);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};
