import "server-only";

import {
  formatMethodologyForPrompt,
  getProductFormatMethodology,
} from "@/lib/product-engine/helpers";
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

  const productFormat = getProductFormatMethodology(input.selectedFormat);
  const response = await callGemini(
    apiKey,
    buildProductPrompt(input, formatMethodologyForPrompt(productFormat)),
    0.7,
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

export function buildDiscoveryPrompt(input: DiscoveryInput): string {
  const regeneration = input.regeneration
    ? `
REGENERACAO SOLICITADA:
- Etapa: ${input.regeneration.stage}
- Publico ja escolhido: ${input.regeneration.selectedAudience ?? "ainda nao escolhido"}
- Dor ja escolhida: ${input.regeneration.selectedPain ?? "ainda nao escolhida"}
- Transformacao ja escolhida: ${input.regeneration.selectedTransformation ?? "ainda nao escolhida"}
- Sugestoes anteriores: ${input.regeneration.previousSuggestions.join(" | ")}

Regra obrigatoria para esta etapa:
Gere tres sugestoes completamente diferentes das anteriores.
Nao apenas troque palavras.
Evite repetir mecanismos, posicionamentos ou publicos.
`
    : "";

  return `Voce e um estrategista de posicionamento e copywriter de produtos digitais para o mercado brasileiro.

Sua tarefa e recomendar caminhos comerciais, nao reorganizar respostas.
Cada recomendacao deve parecer a opiniao curta de um consultor experiente.
Evite linguagem corporativa. Evite palavras genericas. Escreva simples, pratico e vendavel.

RESPOSTAS DO USUARIO:
- Quem e a pessoa, profissao, o que faz bem e gostaria de ensinar: ${input.profile}
- Quem gostaria de ajudar ou transformar: ${input.targetAudienceDescription}
${regeneration}

Retorne somente JSON valido neste formato exato:
{
  "publicos": [
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" },
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" },
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" }
  ],
  "dores": [
    {
      "titulo": "",
      "descricao": "",
      "porque": "",
      "tradeoff": "",
      "frases_reais": ["", "", ""]
    },
    {
      "titulo": "",
      "descricao": "",
      "porque": "",
      "tradeoff": "",
      "frases_reais": ["", "", ""]
    },
    {
      "titulo": "",
      "descricao": "",
      "porque": "",
      "tradeoff": "",
      "frases_reais": ["", "", ""]
    }
  ],
  "transformacoes": [
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" },
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" },
    { "titulo": "", "descricao": "", "porque": "", "tradeoff": "" }
  ],
  "formatos": [
    { "nome": "", "titulo": "", "descricao": "", "porque": "", "tradeoff": "", "tempo_medio": "", "dificuldade": "", "ticket_recomendado": "", "perfil_ideal": "", "potencial_escala": "", "avaliacao": 4 },
    { "nome": "", "titulo": "", "descricao": "", "porque": "", "tradeoff": "", "tempo_medio": "", "dificuldade": "", "ticket_recomendado": "", "perfil_ideal": "", "potencial_escala": "", "avaliacao": 3 },
    { "nome": "", "titulo": "", "descricao": "", "porque": "", "tradeoff": "", "tempo_medio": "", "dificuldade": "", "ticket_recomendado": "", "perfil_ideal": "", "potencial_escala": "", "avaliacao": 3 }
  ]
}

Regras:
- Retornar 3 publicos.
- Retornar 3 dores.
- Retornar 3 transformacoes.
- Retornar 3 formatos.
- Em toda recomendacao, "porque" deve explicar por que voce esta recomendando aquilo.
- Em toda recomendacao, "tradeoff" deve explicar o que a pessoa perde ou complica se escolher outro caminho.
- A primeira opcao de cada lista deve ser a sua recomendacao mais forte.
- Cada dor precisa cruzar o conhecimento da pessoa com o publico especifico. Pense: se eu fosse vender para esse publico, qual dor seria mais facil vender?
- Cada dor deve ter 3 frases reais que parecam comentarios de Instagram, WhatsApp, YouTube ou conversa com cliente.
- As transformacoes devem soar como headline de pagina de vendas.
- Nunca use nas transformacoes: otimizar, potencializar, maximizar, desenvolver, crescimento sustentavel, alta performance, ecossistema, transformacao significativa.
- Para formatos, considere internamente: mentoria em grupo, mentoria individual, curso gravado, curso ao vivo, ebook, template ou kit pronto, consultoria, comunidade paga, workshop, servico feito para o cliente, agente GPT, mini-SaaS ou ferramenta web, planilha pronta, checklist e desafio.
- Exiba apenas os 3 formatos mais adequados para execucao rapida, baixa friccao e clareza de venda.
- Em cada formato, explique por que faz sentido, tempo medio para produzir, dificuldade, ticket recomendado, perfil ideal e potencial de escala.
- "avaliacao" deve ser um numero inteiro de 1 a 5.
- Considere oportunidades de mercado provaveis a partir do contexto informado, sem afirmar que fez pesquisa real.
- As sugestoes devem ser especificas para as respostas do usuario.
- Nao use exemplos genericos.
- Use linguagem simples, direta e brasileira.
- Responda apenas com JSON valido. Sem texto adicional.`;
}

export function buildProductPrompt(input: FinalGenerationInput, formatMethodology: string): string {
  return `Voce e um copywriter estrategista de produtos digitais para o mercado brasileiro.

Voce deve pensar como alguem que esta construindo um produto real para vender.
Nunca escreva como relatorio.
Nunca escreva como consultoria empresarial.
Evite linguagem corporativa, palavras genericas e textos longos.
Escreva simples, pratico, comercial e facil de entender.

INFORMACOES DO USUARIO:
- Quem e a pessoa, profissao, o que faz bem e gostaria de ensinar: ${input.profile}
- Quem ela gostaria de ajudar ou transformar: ${input.targetAudienceDescription}
- Publico escolhido: ${input.selectedAudience}
- Dor principal escolhida: ${input.selectedPain}
- Transformacao escolhida: ${input.selectedTransformation}
- Nivel de experiencia com infoprodutos: ${input.experienceLevel}
- Formato escolhido: ${input.selectedFormat}

METODOLOGIA DO FORMATO ESCOLHIDO DEFINIDA PELO SISTEMA:
${formatMethodology}

Retorne somente JSON valido neste formato exato:
{
  "oportunidade": "maximo 5 linhas, simples, explicando por que essa ideia faz sentido",
  "nicho": "descricao especifica do nicho em uma frase",
  "ideia": "descricao do produto em uma frase clara e objetiva",
  "nomes": ["nome 1", "nome 2", "nome 3"],
  "promessa": "headline de ate 2 linhas com vontade imediata de comprar",
  "mecanismo": {
    "nome": "nome curto e especifico do mecanismo",
    "explicacao": "poucas linhas explicando como o produto entrega a transformacao"
  },
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
  "estrutura": ["etapa personalizada seguindo exatamente a metodologia do formato escolhido"],
  "objecoes": [
    { "objecao": "", "porque_aparece": "", "como_responder": "" },
    { "objecao": "", "porque_aparece": "", "como_responder": "" },
    { "objecao": "", "porque_aparece": "", "como_responder": "" },
    { "objecao": "", "porque_aparece": "", "como_responder": "" },
    { "objecao": "", "porque_aparece": "", "como_responder": "" }
  ],
  "como_vender": {
    "angulo_principal": "Comece dizendo...",
    "problema_de_entrada": "Mostre...",
    "transformacao_destacada": "Explique...",
    "prova_recomendada": "Use como prova...",
    "cta_recomendado": "Convide..."
  },
  "preco": "faixa de preco sugerida com justificativa em uma linha",
  "proximo_passo": "Semana 1: ... Semana 2: ... Semana 3: ... Semana 4: ...",
  "plano_execucao": [
    { "etapa": "Preparacao", "itens": ["item 1", "item 2"] },
    { "etapa": "Criacao", "itens": ["item 1", "item 2"] },
    { "etapa": "Venda", "itens": ["item 1", "item 2"] }
  ],
  "status_projeto": [
    { "etapa": "Ideia", "status": "concluido" },
    { "etapa": "Produto", "status": "concluido" },
    { "etapa": "Estrutura", "status": "concluido" },
    { "etapa": "Conteudo", "status": "em_andamento" },
    { "etapa": "Pagina de vendas", "status": "pendente" },
    { "etapa": "Primeiras vendas", "status": "pendente" },
    { "etapa": "Escala", "status": "pendente" }
  ],
  "cta_consultoria": {
    "titulo": "Seu produto ja esta estruturado.",
    "contexto": "Agora começa a etapa mais importante: transformar essa estrategia em vendas reais.",
    "descricao": "Na Consultoria Plano de Acao de 30 dias, eu monto com voce um plano personalizado para construir, lancar e vender esse produto da forma mais rapida e organizada possivel.",
    "botao": "Quero montar meu Plano de Acao de 30 dias"
  }
}

Regras:
- Seja especifico, nunca generico.
- Use linguagem simples e direta.
- Antes de finalizar, reescreva qualquer resposta que pareca texto de IA.
- O produto deve ser viavel para criar em poucos dias.
- A estrutura do produto deve obrigatoriamente seguir a metodologia do formato escolhido.
- Use a quantidade ideal, o tipo de estrutura e os nomes das etapas definidos pelo sistema.
- A IA deve apenas personalizar os titulos das etapas conforme nicho, dor e transformacao.
- Nao transforme Ebook em Curso.
- Nao transforme Mentoria em Ebook.
- Nao transforme Workshop em Curso.
- Nao crie modulos quando o formato utiliza encontros.
- Nao crie capitulos quando o formato utiliza funcionalidades.
- Nao crie uma estrutura completamente nova.
- Respeite completamente o formato.
- A oportunidade deve ter no maximo 5 linhas e nao pode soar academica.
- O mecanismo deve ser curto, especifico e explicar como o produto entrega a transformacao.
- O mecanismo deve ser coerente com nicho, dor, transformacao, formato e estrutura.
- Nao invente nome sofisticado sem sentido para o mecanismo.
- A promessa deve ter resultado concreto e preferir numero, prazo ou situacao especifica.
- A promessa deve parecer headline de pagina de vendas e ter no maximo 2 linhas.
- A promessa nao deve usar ponto de exclamacao.
- A promessa nao deve usar travessao.
- Nao use frases como "jornada de transformacao", "desbloquear potencial" ou "mudar sua vida".
- Nao use nomes genericos como "Metodo Lucro da Construcao". Os nomes devem parecer produtos reais, curtos e vendaveis.
- Prefira nomes no estilo: Metodo Margem Limpa, Projeto Caixa Positivo, Obra Sem Prejuizo, Metodo Prato Certo.
- Gere 10 beneficios concretos, misturando dinheiro, tempo, confianca, reputacao e crescimento.
- Beneficios devem ser extremamente especificos, com resultado concreto.
- Cada beneficio deve estar conectado ao nicho, dor e transformacao escolhidos, sem repetir a mesma ideia com outras palavras.
- Gere 3 perfis ideais de cliente, cada um com recorte diferente do publico.
- Nao crie perfis iguais com nomes diferentes.
- Gere 5 frases que o cliente real diria em Instagram, WhatsApp, YouTube ou conversa com cliente.
- As frases devem soar reais e nascer das respostas do usuario, nao de frases genericas prontas.
- Gere exatamente 5 objecoes especificas para o produto criado.
- Cada objecao deve considerar preco, tempo, aplicacao, tentativas anteriores, confianca no formato, experiencia do usuario ou dificuldade especifica do nicho quando fizer sentido.
- Cada resposta de objecao deve ser curta, pratica e util para vendas.
- Em como_vender, transforme em roteiro. Cada campo deve comecar com a acao indicada no schema.
- Proximos passos deve ser um plano semanal com Semana 1, Semana 2, Semana 3 e Semana 4, com tarefas claras.
- Plano de Execucao deve ser checklist adaptado ao formato escolhido. Curso usa roteiro, gravacao, edicao, publicacao e checkout. Ebook usa sumario, escrita, diagramacao e checkout. Mentoria usa encontros, material, grupo e primeira turma. Mini SaaS usa MVP, wireframe, desenvolvimento, teste e lancamento.
- Status do projeto deve usar apenas: concluido, em_andamento ou pendente.
- O CTA da consultoria deve usar exatamente os textos do schema.
- Nunca mencione acompanhamento de 6 meses.
- Nao use "Fale comigo" como CTA principal.
- Use portugues do Brasil, linguagem concreta, sem lero-lero e sem respostas genericas.
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
