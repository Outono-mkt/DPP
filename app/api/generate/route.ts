import { NextResponse } from "next/server";

import { generateProductDraft } from "@/lib/ai";
import type { ProductGenerationInput } from "@/types";

export async function POST(request: Request) {
  try {
    const input = await request.json();

    if (!isProductGenerationInput(input)) {
      return NextResponse.json(
        { error: "As respostas do onboarding estao incompletas." },
        { status: 400 },
      );
    }

    const result = await generateProductDraft(input);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel gerar seu produto agora. Tente novamente em alguns instantes." },
      { status: 500 },
    );
  }
}

function isProductGenerationInput(value: unknown): value is ProductGenerationInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<keyof ProductGenerationInput, unknown>;

  return (
    isFilledString(candidate.skill) &&
    isFilledString(candidate.audience) &&
    isFilledString(candidate.audiencePain) &&
    isFilledString(candidate.transformation) &&
    isFilledString(candidate.preferredFormat) &&
    isFilledString(candidate.experienceLevel)
  );
}

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
