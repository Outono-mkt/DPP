import "server-only";

import type { AiProvider, ProductGenerationInput, ProductGenerationResult } from "@/types";
import { generateWithGemini } from "./gemini";
import { mockProductGenerationResult } from "./mock";
import { generateWithOpenAI } from "./openai";

export function getAiProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER;

  if (provider === "openai") {
    return "openai";
  }

  return "gemini";
}

export async function generateProductDraft(
  input: ProductGenerationInput,
): Promise<ProductGenerationResult> {
  const provider = getAiProvider();

  if (!process.env.GEMINI_API_KEY && provider === "gemini") {
    return mockProductGenerationResult;
  }

  if (provider === "openai") {
    return generateWithOpenAI(input);
  }

  return generateWithGemini(input);
}
