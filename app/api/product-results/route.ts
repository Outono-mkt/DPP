import { NextResponse } from "next/server";

import {
  getAuthenticatedUser,
  listUserProductResults,
  PRODUCT_LIMIT_MESSAGE,
  ProductLimitError,
  saveUserProductResult,
} from "@/lib/supabase/product-results";
import type { FinalGenerationInput, ProductResult } from "@/types";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const results = await listUserProductResults(user.id);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel carregar seus produtos criados." },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const input = await request.json();

    if (!isSaveProductResultInput(input)) {
      return NextResponse.json(
        { error: "Nao foi possivel salvar este produto porque os dados estao incompletos." },
        { status: 400 },
      );
    }

    const result = await saveUserProductResult(user.id, input);

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    if (error instanceof ProductLimitError) {
      return NextResponse.json({ error: PRODUCT_LIMIT_MESSAGE }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Nao foi possivel salvar este produto agora." },
      { status: 500 },
    );
  }
}

function isSaveProductResultInput(
  value: unknown,
): value is FinalGenerationInput & { generatedResult: ProductResult } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<
    Record<keyof FinalGenerationInput, unknown> & { generatedResult: unknown }
  >;

  return (
    isFilledString(candidate.profile) &&
    isFilledString(candidate.targetAudienceDescription) &&
    isFilledString(candidate.selectedAudience) &&
    isFilledString(candidate.selectedPain) &&
    isFilledString(candidate.selectedTransformation) &&
    isFilledString(candidate.experienceLevel) &&
    isFilledString(candidate.selectedFormat) &&
    Boolean(candidate.generatedResult) &&
    typeof candidate.generatedResult === "object" &&
    !Array.isArray(candidate.generatedResult)
  );
}

function isFilledString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
