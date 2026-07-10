import "server-only";

import {
  formatMethodologyForPrompt,
  getProductFormatMethodology,
} from "@/lib/product-engine/helpers";
import type { DiscoveryInput, DiscoveryResult, FinalGenerationInput, ProductResult } from "@/types";
import { buildDiscoveryPrompt } from "./prompts/discovery";
import { buildProductPrompt } from "./prompts/generate";
import { PRODUCT_STRATEGY_SYSTEM_PROMPT } from "./prompts/system";

const GEMINI_MODEL = "gemini-2.5-flash";

export async function generateDiscoveryWithGemini(
  input: DiscoveryInput,
): Promise<DiscoveryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await callGemini(
    apiKey,
    buildDiscoveryPrompt(input),
    0.7,
    PRODUCT_STRATEGY_SYSTEM_PROMPT,
  );

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

  const productFormat = getProductFormatMethodology(input.selectedFormat);
  const response = await callGemini(
    apiKey,
    buildProductPrompt(input, formatMethodologyForPrompt(productFormat)),
    0.7,
    PRODUCT_STRATEGY_SYSTEM_PROMPT,
  );

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

function callGemini(
  apiKey: string,
  prompt: string,
  temperature: number,
  systemInstruction?: string,
) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(systemInstruction
          ? {
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
            }
          : {}),
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
    !isObjectArray(parsed.publicos, 3, ["titulo", "descricao", "porque", "tradeoff"]) ||
    !isPainArray(parsed.dores) ||
    !isObjectArray(parsed.transformacoes, 3, ["titulo", "descricao", "porque", "tradeoff"]) ||
    !isFormatArray(parsed.formatos)
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
    typeof parsed.oportunidade !== "string" ||
    typeof parsed.nicho !== "string" ||
    typeof parsed.ideia !== "string" ||
    !isThreeStringArray(parsed.nomes) ||
    typeof parsed.promessa !== "string" ||
    !isStringObject(parsed.mecanismo, ["nome", "explicacao"]) ||
    !isTenStringArray(parsed.beneficios) ||
    !isObjectArray(parsed.perfis_clientes, 3, ["titulo", "descricao"]) ||
    !isFiveStringArray(parsed.frases_cliente) ||
    !isStringArray(parsed.estrutura) ||
    !isObjectArray(parsed.objecoes, 5, ["objecao", "porque_aparece", "como_responder"]) ||
    !isStringObject(parsed.como_vender, [
      "angulo_principal",
      "problema_de_entrada",
      "transformacao_destacada",
      "prova_recomendada",
      "cta_recomendado",
    ]) ||
    typeof parsed.preco !== "string" ||
    typeof parsed.proximo_passo !== "string" ||
    !isExecutionPlanArray(parsed.plano_execucao) ||
    !isProjectStatusArray(parsed.status_projeto) ||
    !isStringObject(parsed.cta_consultoria, ["titulo", "contexto", "descricao", "botao"])
  ) {
    throw new Error("Gemini product response does not match the expected schema.");
  }

  return {
    oportunidade: parsed.oportunidade,
    nicho: parsed.nicho,
    ideia: parsed.ideia,
    nomes: parsed.nomes,
    promessa: parsed.promessa,
    mecanismo: parsed.mecanismo as ProductResult["mecanismo"],
    beneficios: parsed.beneficios,
    perfis_clientes: parsed.perfis_clientes as ProductResult["perfis_clientes"],
    frases_cliente: parsed.frases_cliente,
    estrutura: parsed.estrutura,
    objecoes: parsed.objecoes as ProductResult["objecoes"],
    como_vender: parsed.como_vender as ProductResult["como_vender"],
    preco: parsed.preco,
    proximo_passo: parsed.proximo_passo,
    plano_execucao: parsed.plano_execucao as ProductResult["plano_execucao"],
    status_projeto: parsed.status_projeto as ProductResult["status_projeto"],
    cta_consultoria: parsed.cta_consultoria as ProductResult["cta_consultoria"],
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

function isStringObject(value: unknown, keys: string[]) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    keys.every((key) => typeof (value as Record<string, unknown>)[key] === "string")
  );
}

function isPainArray(value: unknown) {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return false;
      }

      const pain = item as Record<string, unknown>;
      return (
        typeof pain.titulo === "string" &&
        typeof pain.descricao === "string" &&
        typeof pain.porque === "string" &&
        typeof pain.tradeoff === "string" &&
        isThreeStringArray(pain.frases_reais)
      );
    })
  );
}

function isFormatArray(value: unknown) {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return false;
      }

      const format = item as Record<string, unknown>;
      return (
        typeof format.nome === "string" &&
        typeof format.titulo === "string" &&
        typeof format.descricao === "string" &&
        typeof format.porque === "string" &&
        typeof format.tradeoff === "string" &&
        typeof format.tempo_medio === "string" &&
        typeof format.dificuldade === "string" &&
        typeof format.ticket_recomendado === "string" &&
        typeof format.perfil_ideal === "string" &&
        typeof format.potencial_escala === "string" &&
        typeof format.avaliacao === "number"
      );
    })
  );
}

function isExecutionPlanArray(value: unknown) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return false;
      }

      const group = item as Record<string, unknown>;
      return typeof group.etapa === "string" && isStringArray(group.itens);
    })
  );
}

function isProjectStatusArray(value: unknown) {
  const validStatus = ["concluido", "em_andamento", "pendente"];

  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return false;
      }

      const status = item as Record<string, unknown>;
      return (
        typeof status.etapa === "string" &&
        typeof status.status === "string" &&
        validStatus.includes(status.status)
      );
    })
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isString);
}

function isThreeStringArray(value: unknown): value is [string, string, string] {
  return Array.isArray(value) && value.length === 3 && value.every(isString);
}

function isFiveStringArray(
  value: unknown,
): value is [string, string, string, string, string] {
  return Array.isArray(value) && value.length === 5 && value.every(isString);
}

function isTenStringArray(
  value: unknown,
): value is [string, string, string, string, string, string, string, string, string, string] {
  return Array.isArray(value) && value.length === 10 && value.every(isString);
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
