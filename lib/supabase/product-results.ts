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
    .select("id, generated_result, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(PRODUCT_LIMIT_PER_USER);

  if (error) {
    throw error;
  }

  return (data ?? []) as SavedProductSummary[];
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

  return data as SavedProductResult | null;
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

  return data as SavedProductResult;
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
