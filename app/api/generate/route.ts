import { NextResponse } from "next/server";

import { generateProduct } from "@/lib/ai";
import type { FinalGenerationInput } from "@/types";

export async function POST(request: Request) {
  try {
    const input = await request.json();

    if (!isFinalGenerationInput(input)) {
      return NextResponse.json(
        { error: "As respostas do onboarding estao incompletas." },
        { status: 400 },
      );
    }

    const result = await generateProduct(input);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel gerar seu produto agora. Tente novamente em alguns instantes." },
      { status: 500 },
    );
  }
}

function isFinalGenerationInput(value: unknown): value is FinalGenerationInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<keyof FinalGenerationInput, unknown>;

  return (
    isFilledString(candidate.profile) &&
    isFilledString(candidate.targetAudienceDescription) &&
    isFilledString(candidate.selectedAudience) &&
    isFilledString(candidate.selectedPain) &&
    isFilledString(candidate.selectedTransformation) &&
    isFilledString(candidate.experienceLevel) &&
    isFilledString(candidate.selectedFormat)
  );
}

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
