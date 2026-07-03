import "server-only";

import type { ProductGenerationInput, ProductGenerationResult } from "@/types";

export async function generateWithOpenAI(
  input: ProductGenerationInput,
): Promise<ProductGenerationResult> {
  void input;

  throw new Error("OpenAI provider is reserved for future implementation.");
}
