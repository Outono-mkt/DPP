import "server-only";

import type { DiscoveryInput, DiscoveryResult, FinalGenerationInput, ProductResult } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";

export async function generateDiscoveryWithGemini(
  input: DiscoveryInput,
): Promise<DiscoveryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await callGemini(apiKey, buildDiscoveryPrompt(input), 0.7);

  if (!response.ok) {
    throw new Error("Gemini discovery request failed.");
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty discovery response.");
  }

  return parseDiscoveryResult(text);
}

export async function generateProductWithGemini(
  input: FinalGenerationInput,
): Promise<ProductResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await callGemini(apiKey, buildProductPrompt(input), 0.7);

  if (!response.ok) {
    throw new Error("Gemini product request failed.");
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty product response.");
  }

  return parseProductResult(text);
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

export function buildDiscoveryPrompt(input: DiscoveryInput): string {
  return `Voce e um estrategista de infoprodutos especialista em transformar conhecimento em produtos digitais simples e vendaveis para o mercado brasileiro.

Com base nas respostas abaixo, gere sugestoes estruturadas para guiar a criacao do produto.

RESPOSTAS DO USUARIO:
- Quem e a pessoa, profissao, o que faz bem e gostaria de ensinar: ${input.profile}
- Quem gostaria de ajudar ou transformar: ${input.targetAudienceDescription}

Retorne somente JSON valido neste formato exato:
{
  "especialidades": [
    { "titulo": "", "descricao": "" },
    { "titulo": "", "descricao": "" },
    { "titulo": "", "descricao": "" }
  ],
  "publicos": [
    { "titulo": "", "motivo": "" },
    { "titulo": "", "motivo": "" },
    { "titulo": "", "motivo": "" }
  ],
  "dores": [
    { "titulo": "", "explicacao": "" },
    { "titulo": "", "explicacao": "" },
    { "titulo": "", "explicacao": "" },
    { "titulo": "", "explicacao": "" }
  ],
  "transformacoes": [
    { "titulo": "", "resultado": "" },
    { "titulo": "", "resultado": "" },
    { "titulo": "", "resultado": "" }
  ],
  "formatos": [
    { "nome": "", "motivo": "" },
    { "nome": "", "motivo": "" },
    { "nome": "", "motivo": "" }
  ]
}

Regras:
- Retornar 3 especialidades.
- Retornar 3 publicos.
- Retornar 4 dores.
- Retornar 3 transformacoes.
- Retornar 3 formatos.
- As sugestoes devem ser especificas para as respostas do usuario.
- Nao use exemplos genericos.
- Use linguagem simples, direta e brasileira.
- Responda apenas com JSON valido. Sem texto adicional.`;
}

export function buildProductPrompt(input: FinalGenerationInput): string {
  return `Voce e um estrategista de infoprodutos especialista em criar produtos digitais de alta conversao para o mercado brasileiro.

Com base nas informacoes abaixo, crie um produto digital completo e viavel para essa pessoa.

INFORMACOES DO USUARIO:
- Quem e a pessoa, profissao, o que faz bem e gostaria de ensinar: ${input.profile}
- Quem ela gostaria de ajudar ou transformar: ${input.targetAudienceDescription}
- Publico escolhido: ${input.selectedAudience}
- Dor principal escolhida: ${input.selectedPain}
- Transformacao escolhida: ${input.selectedTransformation}
- Nivel de experiencia com infoprodutos: ${input.experienceLevel}
- Formato escolhido: ${input.selectedFormat}

Retorne somente JSON valido neste formato exato:
{
  "nicho": "descricao especifica do nicho em uma frase",
  "ideia": "descricao do produto em uma frase clara e objetiva",
  "nomes": ["nome 1", "nome 2", "nome 3"],
  "promessa": "promessa principal com prazo, resultado e diferencial",
  "estrutura": ["modulo 1", "modulo 2", "modulo 3", "modulo 4", "modulo 5"],
  "preco": "faixa de preco sugerida com justificativa em uma linha",
  "proximo_passo": "texto motivacional de 2 linhas incentivando o usuario a comecar agora"
}

Regras:
- Seja especifico, nunca generico.
- Use linguagem simples e direta.
- O produto deve ser viavel para criar em poucos dias.
- A promessa deve ter prazo, resultado concreto e diferencial.
- Responda apenas com JSON. Sem texto adicional.`;
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

function parseDiscoveryResult(text: string): DiscoveryResult {
  const parsed = parseJsonObject(text);

  if (!parsed) {
    throw new Error("Gemini discovery response is not valid JSON.");
  }

  if (
    !isObjectArray(parsed.especialidades, 3, ["titulo", "descricao"]) ||
    !isObjectArray(parsed.publicos, 3, ["titulo", "motivo"]) ||
    !isObjectArray(parsed.dores, 4, ["titulo", "explicacao"]) ||
    !isObjectArray(parsed.transformacoes, 3, ["titulo", "resultado"]) ||
    !isObjectArray(parsed.formatos, 3, ["nome", "motivo"])
  ) {
    throw new Error("Gemini discovery response does not match the expected schema.");
  }

  return parsed as DiscoveryResult;
}

function parseProductResult(text: string): ProductResult {
  const parsed = parseJsonObject(text);

  if (!parsed) {
    throw new Error("Gemini product response is not valid JSON.");
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
    throw new Error("Gemini product response does not match the expected schema.");
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

function isObjectArray(value: unknown, length: number, keys: string[]) {
  return (
    Array.isArray(value) &&
    value.length === length &&
    value.every((item) =>
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      keys.every((key) => typeof (item as Record<string, unknown>)[key] === "string"),
    )
  );
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
