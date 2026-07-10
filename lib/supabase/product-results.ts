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
  const migrated = migrateLegacyProductResult(parsed);

  if (!isProductResult(migrated)) {
    throw new Error("Saved generated_result does not match the expected product schema.");
  }

  return migrated;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function migrateLegacyProductResult(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const result = value as Partial<ProductResult> & {
    cta_consultoria?: unknown;
  };
  const ideia = isFilledString(result.ideia) ? result.ideia : "produto digital";
  const promessa = isFilledString(result.promessa)
    ? result.promessa
    : "uma transformacao clara para o cliente certo";
  const primeiroModulo = Array.isArray(result.estrutura) && isFilledString(result.estrutura[0])
    ? result.estrutura[0]
    : "um caminho simples de execucao";

  return {
    ...result,
    mecanismo: isStringObject(result.mecanismo, ["nome", "explicacao"])
      ? result.mecanismo
      : {
          nome: "Metodo de execucao guiada",
          explicacao: `O produto organiza ${primeiroModulo.toLowerCase()} em um caminho pratico para entregar ${promessa.toLowerCase()}.`,
        },
    objecoes: isObjectArray(result.objecoes, ["objecao", "porque_aparece", "como_responder"], 5)
      ? result.objecoes
      : [
          {
            objecao: "Nao sei se isso e para mim",
            porque_aparece: "O cliente ainda nao conectou a propria dor com a proposta do produto.",
            como_responder: "Mostre claramente para quem o produto foi criado e qual problema ele resolve primeiro.",
          },
          {
            objecao: "Nao tenho tempo",
            porque_aparece: "A pessoa teme comprar algo que exija mais rotina do que consegue cumprir.",
            como_responder: "Explique o formato, o tempo de aplicacao e o primeiro ganho rapido esperado.",
          },
          {
            objecao: "Ja tentei antes e nao funcionou",
            porque_aparece: "Existe frustracao com solucoes anteriores ou tentativas sem orientacao.",
            como_responder: "Mostre o mecanismo do produto e por que a ordem da execucao evita o erro anterior.",
          },
          {
            objecao: "Esta caro para mim agora",
            porque_aparece: "O cliente ainda compara preco, nao custo do problema ou valor da transformacao.",
            como_responder: "Conecte o preco ao resultado pratico, ao tempo economizado e ao custo de continuar parado.",
          },
          {
            objecao: "Tenho medo de nao conseguir aplicar",
            porque_aparece: "A pessoa duvida da propria capacidade de transformar informacao em acao.",
            como_responder: "Reforce passos simples, exemplos e orientacao para sair da teoria com seguranca.",
          },
        ],
    como_vender: isStringObject(result.como_vender, [
      "angulo_principal",
      "problema_de_entrada",
      "transformacao_destacada",
      "prova_recomendada",
      "cta_recomendado",
    ])
      ? result.como_vender
      : {
          angulo_principal: `Venda ${ideia} como uma ponte pratica entre a dor atual e ${promessa.toLowerCase()}.`,
          problema_de_entrada: "A pessoa sabe que precisa mudar, mas ainda nao tem clareza do primeiro passo.",
          transformacao_destacada: promessa,
          prova_recomendada: "Use exemplos, bastidores, antes e depois ou uma pequena demonstracao do metodo.",
          cta_recomendado: "Convide a pessoa a dar o primeiro passo com uma decisao simples e direta.",
        },
    cta_consultoria: isStringObject(result.cta_consultoria, ["titulo", "contexto", "descricao", "botao"])
      ? result.cta_consultoria
      : {
          titulo: "Vamos transformar essa estrategia em um plano de acao?",
          contexto: `Agora que ${ideia} esta desenhado, o proximo passo e organizar prioridades, oferta e execucao.`,
          descricao:
            "Eu posso te ajudar em uma consultoria personalizada para montar um plano de acao de 30 dias e tirar essa estrategia do papel com clareza.",
          botao: "Quero montar meu plano de acao",
        },
  };
}

function isProductResult(value: unknown): value is ProductResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const result = value as Partial<ProductResult>;

  return (
    isFilledString(result.oportunidade) &&
    isFilledString(result.nicho) &&
    isFilledString(result.ideia) &&
    isStringArray(result.nomes) &&
    isFilledString(result.promessa) &&
    isStringObject(result.mecanismo, ["nome", "explicacao"]) &&
    isStringArray(result.beneficios) &&
    Array.isArray(result.perfis_clientes) &&
    result.perfis_clientes.length > 0 &&
    result.perfis_clientes.every(
      (profile) =>
        Boolean(profile) &&
        typeof profile === "object" &&
        isFilledString((profile as { titulo?: unknown }).titulo) &&
        isFilledString((profile as { descricao?: unknown }).descricao),
    ) &&
    isStringArray(result.frases_cliente) &&
    isStringArray(result.estrutura) &&
    isObjectArray(result.objecoes, ["objecao", "porque_aparece", "como_responder"], 5) &&
    isStringObject(result.como_vender, [
      "angulo_principal",
      "problema_de_entrada",
      "transformacao_destacada",
      "prova_recomendada",
      "cta_recomendado",
    ]) &&
    isFilledString(result.preco) &&
    isFilledString(result.proximo_passo) &&
    isStringObject(result.cta_consultoria, ["titulo", "contexto", "descricao", "botao"])
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isFilledString);
}

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringObject(value: unknown, keys: string[]) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    keys.every((key) => isFilledString((value as Record<string, unknown>)[key]))
  );
}

function isObjectArray(value: unknown, keys: string[], length?: number) {
  return (
    Array.isArray(value) &&
    (length === undefined || value.length === length) &&
    value.length > 0 &&
    value.every((item) => isStringObject(item, keys))
  );
}
