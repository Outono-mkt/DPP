import { NextResponse } from "next/server";

import { generateDiscovery } from "@/lib/ai";
import type { DiscoveryInput } from "@/types";

export async function POST(request: Request) {
  try {
    const input = await request.json();

    if (!isDiscoveryInput(input)) {
      return NextResponse.json(
        { error: "As primeiras respostas do onboarding estao incompletas." },
        { status: 400 },
      );
    }

    const result = await generateDiscovery(input);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel gerar suas sugestoes agora. Tente novamente em alguns instantes." },
      { status: 500 },
    );
  }
}

function isDiscoveryInput(value: unknown): value is DiscoveryInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<keyof DiscoveryInput, unknown>;

  return (
    isFilledString(candidate.profile) &&
    isFilledString(candidate.targetAudienceDescription) &&
    isValidRegeneration(candidate.regeneration)
  );
}

function isValidRegeneration(value: unknown) {
  if (value === undefined) {
    return true;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const regeneration = value as NonNullable<DiscoveryInput["regeneration"]>;
  const validStages = ["audience", "pain", "transformation", "format"];

  return (
    Boolean(regeneration) &&
    validStages.includes(regeneration.stage) &&
    Array.isArray(regeneration.previousSuggestions) &&
    regeneration.previousSuggestions.every((item) => typeof item === "string")
  );
}

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
