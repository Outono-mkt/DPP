import "server-only";

import type {
  DiscoveryInput,
  DiscoveryResult,
  FinalGenerationInput,
  ProductRecommendationInput,
  ProductRecommendationResult,
  ProductResult,
} from "@/types";

export async function generateDiscoveryWithOpenAI(
  input: DiscoveryInput,
): Promise<DiscoveryResult> {
  void input;

  throw new Error("OpenAI provider is reserved for future implementation.");
}

export async function generateProductWithOpenAI(
  input: FinalGenerationInput,
): Promise<ProductResult> {
  void input;

  throw new Error("OpenAI provider is reserved for future implementation.");
}

export async function generateProductRecommendationsWithOpenAI(
  input: ProductRecommendationInput,
): Promise<ProductRecommendationResult> {
  void input;

  throw new Error("OpenAI provider is reserved for future implementation.");
}
