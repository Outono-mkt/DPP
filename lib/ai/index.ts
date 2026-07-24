import "server-only";

import type {
  AiProvider,
  DiscoveryInput,
  DiscoveryResult,
  FinalGenerationInput,
  ProductRecommendationInput,
  ProductRecommendationResult,
  ProductResult,
} from "@/types";
import {
  generateDiscoveryWithGemini,
  generateProductRecommendationsWithGemini,
  generateProductWithGemini,
} from "./gemini";
import { mockDiscoveryResult, mockProductRecommendationResult, mockProductResult } from "./mock";
import {
  generateDiscoveryWithOpenAI,
  generateProductRecommendationsWithOpenAI,
  generateProductWithOpenAI,
} from "./openai";

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

export async function generateProductRecommendations(
  input: ProductRecommendationInput,
): Promise<ProductRecommendationResult> {
  const provider = getAiProvider();

  if (!process.env.GEMINI_API_KEY && provider === "gemini") {
    return mockProductRecommendationResult;
  }

  if (provider === "openai") {
    return generateProductRecommendationsWithOpenAI(input);
  }

  return generateProductRecommendationsWithGemini(input);
}
