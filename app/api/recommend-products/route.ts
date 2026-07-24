import { NextResponse } from "next/server";

import { generateProductRecommendations } from "@/lib/ai";
import type { ProductRecommendationInput, ProductStrategy } from "@/types";

export async function POST(request: Request) {
  try {
    const input = await request.json();

    if (!isProductRecommendationInput(input)) {
      return NextResponse.json(
        { error: "As informacoes para recomendar produtos estao incompletas." },
        { status: 400 },
      );
    }

    const result = await generateProductRecommendations(input);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel gerar recomendacoes agora. Tente novamente em alguns instantes." },
      { status: 500 },
    );
  }
}

function isProductRecommendationInput(value: unknown): value is ProductRecommendationInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<Record<keyof ProductRecommendationInput, unknown>>;

  return (
    isFilledString(candidate.profile) &&
    isFilledString(candidate.targetAudienceDescription) &&
    isProductStrategy(candidate.selectedStrategy) &&
    isFilledString(candidate.experienceLevel) &&
    isValidRegeneration(candidate.regeneration)
  );
}

function isProductStrategy(value: unknown): value is ProductStrategy {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const strategy = value as Partial<Record<keyof ProductStrategy, unknown>>;

  return (
    isFilledString(strategy.nome) &&
    isFilledString(strategy.resumo) &&
    isFilledString(strategy.publico) &&
    isFilledString(strategy.dor_principal) &&
    isFilledString(strategy.transformacao) &&
    isFilledString(strategy.justificativa) &&
    isFilledString(strategy.tradeoffs) &&
    typeof strategy.recomendada === "boolean"
  );
}

function isValidRegeneration(value: unknown) {
  if (value === undefined) {
    return true;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const regeneration = value as NonNullable<ProductRecommendationInput["regeneration"]>;

  return (
    Array.isArray(regeneration.previousSuggestions) &&
    regeneration.previousSuggestions.every((item) => typeof item === "string")
  );
}

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
