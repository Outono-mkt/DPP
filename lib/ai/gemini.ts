import "server-only";

import type { ProductGenerationInput, ProductGenerationResult } from "@/types";

export async function generateWithGemini(
  input: ProductGenerationInput,
): Promise<ProductGenerationResult> {
  void input;

  throw new Error("Gemini provider is not implemented yet.");
}
