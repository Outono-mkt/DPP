import "server-only";

import type { DiscoveryInput, DiscoveryResult, FinalGenerationInput, ProductResult } from "@/types";

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
