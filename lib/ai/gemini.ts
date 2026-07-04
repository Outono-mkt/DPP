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

Com base nas respostas abaixo, gere uma descoberta estrategica para guiar a criacao do produto. Considere o conhecimento da pessoa, o publico descrito, possiveis oportunidades de mercado, formatos adequados e simplicidade de execucao rapida.

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
- Para formatos, considere internamente: mentoria em grupo, mentoria individual, curso gravado, curso ao vivo, ebook, template ou kit pronto, consultoria, comunidade paga, workshop, servico feito para o cliente, agente GPT, mini-SaaS ou ferramenta web, planilha pronta, checklist e desafio.
- Exiba apenas os 3 formatos mais adequados para execucao rapida, baixa friccao e clareza de venda.
- Considere oportunidades de mercado provaveis a partir do contexto informado, sem afirmar que fez pesquisa real.
- As sugestoes devem ser especificas para as respostas do usuario.
- Nao use exemplos genericos.
- Use linguagem simples, direta e brasileira.
- Responda apenas com JSON valido. Sem texto adicional.`;
}

export function buildProductPrompt(input: FinalGenerationInput): string {
  return `Voce e um estrategista de infoprodutos especialista em criar estrategias iniciais de produto para o mercado brasileiro.

Com base nas informacoes abaixo, crie uma Estrategia Inicial de Produto simples, concreta e viavel para essa pessoa vender em poucos dias.

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
  "oportunidade": "2 ou 3 linhas explicando por que essa ideia faz sentido com base no contexto informado",
  "nicho": "descricao especifica do nicho em uma frase",
  "ideia": "descricao do produto em uma frase clara e objetiva",
  "nomes": ["nome 1", "nome 2", "nome 3"],
  "promessa": "promessa principal com prazo, resultado e diferencial",
  "beneficios": [
    "beneficio concreto 1",
    "beneficio concreto 2",
    "beneficio concreto 3",
    "beneficio concreto 4",
    "beneficio concreto 5",
    "beneficio concreto 6",
    "beneficio concreto 7",
    "beneficio concreto 8",
    "beneficio concreto 9",
    "beneficio concreto 10"
  ],
  "perfis_clientes": [
    { "titulo": "perfil ideal 1", "descricao": "descricao especifica" },
    { "titulo": "perfil ideal 2", "descricao": "descricao especifica" },
    { "titulo": "perfil ideal 3", "descricao": "descricao especifica" }
  ],
  "frases_cliente": [
    "frase real 1",
    "frase real 2",
    "frase real 3",
    "frase real 4",
    "frase real 5"
  ],
  "estrutura": ["modulo 1", "modulo 2", "modulo 3", "modulo 4", "modulo 5"],
  "preco": "faixa de preco sugerida com justificativa em uma linha",
  "proximo_passo": "proximas acoes praticas para comecar agora",
  "cta_consultoria": "CTA contextual para falar com Gabriel e construir esse produto"
}

Regras:
- Seja especifico, nunca generico.
- Use linguagem simples e direta.
- O produto deve ser viavel para criar em poucos dias.
- A oportunidade deve explicar em 2 ou 3 linhas por que essa ideia faz sentido, sem dizer que foi feita pesquisa real de mercado.
- A promessa deve ter resultado concreto e preferir numero, prazo ou situacao especifica.
- A promessa nao deve usar ponto de exclamacao.
- A promessa nao deve usar travessao.
- Nao use frases como "jornada de transformacao", "desbloquear potencial" ou "mudar sua vida".
- Gere 10 beneficios concretos, misturando dinheiro, tempo, confianca, reputacao e crescimento.
- Cada beneficio deve estar conectado ao nicho, dor e transformacao escolhidos, sem repetir a mesma ideia com outras palavras.
- Gere 3 perfis ideais de cliente, cada um com recorte diferente do publico.
- Nao crie perfis iguais com nomes diferentes.
- Gere 5 frases que o cliente real diria em Instagram, WhatsApp, YouTube ou conversa com cliente.
- As frases devem soar reais e nascer das respostas do usuario, nao de frases genericas prontas.
- O CTA de consultoria deve adaptar esta ideia ao produto gerado: agora que a estrategia esta desenhada, Gabriel pode ajudar a transformar isso em um produto pronto para vender, com posicionamento, oferta, pagina e plano de lancamento.
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
    typeof parsed.oportunidade !== "string" ||
    typeof parsed.nicho !== "string" ||
    typeof parsed.ideia !== "string" ||
    !isThreeStringArray(parsed.nomes) ||
    typeof parsed.promessa !== "string" ||
    !isTenStringArray(parsed.beneficios) ||
    !isObjectArray(parsed.perfis_clientes, 3, ["titulo", "descricao"]) ||
    !isFiveStringArray(parsed.frases_cliente) ||
    !isFiveStringArray(parsed.estrutura) ||
    typeof parsed.preco !== "string" ||
    typeof parsed.proximo_passo !== "string" ||
    typeof parsed.cta_consultoria !== "string"
  ) {
    throw new Error("Gemini product response does not match the expected schema.");
  }

  return {
    oportunidade: parsed.oportunidade,
    nicho: parsed.nicho,
    ideia: parsed.ideia,
    nomes: parsed.nomes,
    promessa: parsed.promessa,
    beneficios: parsed.beneficios,
    perfis_clientes: parsed.perfis_clientes as ProductResult["perfis_clientes"],
    frases_cliente: parsed.frases_cliente,
    estrutura: parsed.estrutura,
    preco: parsed.preco,
    proximo_passo: parsed.proximo_passo,
    cta_consultoria: parsed.cta_consultoria,
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
