import "server-only";

import type { AiProvider, DiscoveryInput, DiscoveryResult, FinalGenerationInput, ProductResult } from "@/types";
import { generateDiscoveryWithGemini, generateProductWithGemini } from "./gemini";
import { mockDiscoveryResult, mockProductResult } from "./mock";
import { generateDiscoveryWithOpenAI, generateProductWithOpenAI } from "./openai";

export function getAiProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER;

  if (provider === "openai") {
    return "openai";
  }

  return "gemini";
}

export async function generateDiscovery(input: DiscoveryInput): Promise<DiscoveryResult> {
  const provider = getAiProvider();

  if (!process.env.GEMINI_API_KEY && provider === "gemini") {
    return mockDiscoveryResult;
  }

  if (provider === "openai") {
    return generateDiscoveryWithOpenAI(input);
  }

  return generateDiscoveryWithGemini(input);
}

export async function generateProduct(input: FinalGenerationInput): Promise<ProductResult> {
  const provider = getAiProvider();

  if (!process.env.GEMINI_API_KEY && provider === "gemini") {
    return mockProductResult;
  }

  if (provider === "openai") {
    return generateProductWithOpenAI(input);
  }

  return generateProductWithGemini(input);
}
