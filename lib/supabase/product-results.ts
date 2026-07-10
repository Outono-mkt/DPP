import "server-only";

import type {
  FinalGenerationInput,
  ProductResult,
  SavedProductResult,
  SavedProductSummary,
} from "@/types";
import { getSupabaseAdminClient } from "./admin";

export const PRODUCT_LIMIT_PER_USER = 2;
export const PRODUCT_LIMIT_MESSAGE =
  "Você já criou seus 2 produtos disponíveis neste acesso. Para criar mais produtos, fale comigo.";

export type SaveProductResultInput = FinalGenerationInput & {
  generatedResult: ProductResult;
};

export async function getAuthenticatedUser(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    throw new Error("Missing auth token.");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Invalid auth token.");
  }

  return data.user;
}

export async function listUserProductResults(userId: string): Promise<SavedProductSummary[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_results")
    .select("id, selected_format, generated_result, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(PRODUCT_LIMIT_PER_USER);

  if (error) {
    throw error;
  }

  return (data ?? []).map(normalizeSavedProductSummary);
}

export async function getUserProductResult(
  userId: string,
  resultId: string,
): Promise<SavedProductResult | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_results")
    .select("*")
    .eq("id", resultId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeSavedProductResult(data) : null;
}

export async function deleteUserProductResult(userId: string, resultId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("product_results")
    .delete()
    .eq("id", resultId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function saveUserProductResult(
  userId: string,
  input: SaveProductResultInput,
): Promise<SavedProductResult> {
  const supabase = getSupabaseAdminClient();
  const { count, error: countError } = await supabase
    .from("product_results")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) >= PRODUCT_LIMIT_PER_USER) {
    throw new ProductLimitError();
  }

  const { data, error } = await supabase
    .from("product_results")
    .insert({
      user_id: userId,
      profile: input.profile,
      target_audience_description: input.targetAudienceDescription,
      selected_audience: input.selectedAudience,
      selected_pain: input.selectedPain,
      selected_transformation: input.selectedTransformation,
      experience_level: input.experienceLevel,
      selected_format: input.selectedFormat,
      generated_result: input.generatedResult as never,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return normalizeSavedProductResult(data);
}

export class ProductLimitError extends Error {
  constructor() {
    super(PRODUCT_LIMIT_MESSAGE);
    this.name = "ProductLimitError";
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice("bearer ".length).trim();
}

function normalizeSavedProductSummary(value: unknown): SavedProductSummary {
  const row = value as SavedProductSummary;

  return {
    id: row.id,
    selected_format: row.selected_format,
    created_at: row.created_at,
    generated_result: normalizeProductResult(row.generated_result),
  };
}

function normalizeSavedProductResult(value: unknown): SavedProductResult {
  const row = value as SavedProductResult;

  return {
    ...row,
    generated_result: normalizeProductResult(row.generated_result),
  };
}

function normalizeProductResult(value: unknown): ProductResult {
  const parsed = typeof value === "string" ? parseJson(value) : value;
  return migrateLegacyProductResult(parsed);
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function migrateLegacyProductResult(value: unknown): ProductResult {
  const result = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Partial<ProductResult>)
    : {};
  const ideia = asString(result.ideia, "Produto digital pronto para validar");
  const promessa = asString(result.promessa, "Uma transformacao clara para o cliente certo");
  const estrutura = toStringArray(result.estrutura);
  const primeiroModulo = estrutura[0] ?? "um caminho simples de execucao";

  return {
    oportunidade: asString(
      result.oportunidade,
      "Existe uma oportunidade de transformar conhecimento pratico em uma oferta simples, especifica e vendavel.",
    ),
    nicho: asString(result.nicho, "Publico especifico que precisa resolver uma dor clara."),
    ideia,
    nomes: toStringArray(result.nomes) as ProductResult["nomes"],
    promessa,
    mecanismo: normalizeStringObject(result.mecanismo, {
      nome: "Execucao Guiada",
      explicacao: `O produto organiza ${primeiroModulo.toLowerCase()} em um caminho pratico para entregar ${promessa.toLowerCase()}.`,
    }),
    beneficios: toStringArray(result.beneficios) as ProductResult["beneficios"],
    perfis_clientes: normalizeProfileArray(result.perfis_clientes),
    frases_cliente: toStringArray(result.frases_cliente) as ProductResult["frases_cliente"],
    estrutura,
    objecoes: normalizeObjectionArray(result.objecoes),
    como_vender: normalizeStringObject(result.como_vender, {
      angulo_principal: `Venda ${ideia} como uma ponte pratica entre a dor atual e ${promessa.toLowerCase()}.`,
      problema_de_entrada: "A pessoa sabe que precisa mudar, mas ainda nao tem clareza do primeiro passo.",
      transformacao_destacada: promessa,
      prova_recomendada: "Use exemplos, bastidores, antes e depois ou uma pequena demonstracao do metodo.",
      cta_recomendado: "Convide a pessoa a dar o primeiro passo com uma decisao simples e direta.",
    }),
    preco: asString(result.preco, "Faixa de preco a validar com os primeiros compradores."),
    proximo_passo: asString(result.proximo_passo, "Validar a promessa, montar a primeira entrega e fazer a primeira oferta."),
    plano_execucao: isExecutionPlanArray(result.plano_execucao)
      ? result.plano_execucao
      : buildDefaultExecutionPlan(ideia),
    status_projeto: isProjectStatusArray(result.status_projeto)
      ? result.status_projeto
      : buildDefaultProjectStatus(),
    cta_consultoria: normalizeStringObject(result.cta_consultoria, buildDefaultConsultingCta()),
  };
}

function buildDefaultExecutionPlan(idea: string) {
  return [
    {
      etapa: "Preparacao",
      itens: [
        "Escolher o nome final",
        "Fechar a promessa principal",
        `Organizar a primeira versao de ${idea}`,
      ],
    },
    {
      etapa: "Criacao",
      itens: [
        "Criar a estrutura da entrega",
        "Produzir o conteudo principal",
        "Revisar a entrega antes de publicar",
      ],
    },
    {
      etapa: "Venda",
      itens: [
        "Configurar checkout",
        "Montar uma pagina simples de oferta",
        "Fazer a primeira oferta para compradores potenciais",
      ],
    },
  ];
}

function buildDefaultConsultingCta() {
  return {
    titulo: "Seu produto ja esta estruturado.",
    contexto: "Agora começa a etapa mais importante: transformar essa estrategia em vendas reais.",
    descricao:
      "Na Consultoria Plano de Acao de 30 dias, eu monto com voce um plano personalizado para construir, lancar e vender esse produto da forma mais rapida e organizada possivel.",
    botao: "Quero montar meu Plano de Acao de 30 dias",
  };
}

function buildDefaultProjectStatus(): ProductResult["status_projeto"] {
  return [
    { etapa: "Ideia", status: "concluido" },
    { etapa: "Produto", status: "concluido" },
    { etapa: "Estrutura", status: "concluido" },
    { etapa: "Conteudo", status: "em_andamento" },
    { etapa: "Pagina de vendas", status: "pendente" },
    { etapa: "Primeiras vendas", status: "pendente" },
    { etapa: "Escala", status: "pendente" },
  ];
}

function normalizeStringObject<T extends Record<string, string>>(
  value: unknown,
  defaults: T,
): T {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [key, asString(source[key], fallback)]),
  ) as T;
}

function normalizeProfileArray(value: unknown): ProductResult["perfis_clientes"] {
  if (!Array.isArray(value)) {
    return [] as unknown as ProductResult["perfis_clientes"];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const profile = item as Record<string, unknown>;
      return {
        titulo: asString(profile.titulo, "Perfil sem titulo"),
        descricao: asString(profile.descricao, "Descricao nao informada."),
      };
    }) as ProductResult["perfis_clientes"];
}

function normalizeObjectionArray(value: unknown): ProductResult["objecoes"] {
  if (!Array.isArray(value)) {
    return [] as unknown as ProductResult["objecoes"];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const objection = item as Record<string, unknown>;
      return {
        objecao: asString(objection.objecao, "Objecao nao informada"),
        porque_aparece: asString(objection.porque_aparece, "Motivo nao informado."),
        como_responder: asString(objection.como_responder, "Responder com clareza e prova simples."),
      };
    }) as ProductResult["objecoes"];
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isFilledString).map((item) => item.trim());
}

function asString(value: unknown, fallback = "") {
  return isFilledString(value) ? value.trim() : fallback;
}

function isExecutionPlanArray(value: unknown): value is ProductResult["plano_execucao"] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        Boolean(item) &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        isFilledString((item as { etapa?: unknown }).etapa) &&
        isStringArray((item as { itens?: unknown }).itens),
    )
  );
}

function isProjectStatusArray(value: unknown): value is ProductResult["status_projeto"] {
  const validStatus = ["concluido", "em_andamento", "pendente"];

  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        Boolean(item) &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        isFilledString((item as { etapa?: unknown }).etapa) &&
        isFilledString((item as { status?: unknown }).status) &&
        validStatus.includes((item as { status: string }).status),
    )
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isFilledString);
}

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
