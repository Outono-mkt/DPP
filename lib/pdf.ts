import "server-only";

import type { ProductGenerationResult } from "@/types";

export async function generateProductResultPdf(
  result: ProductGenerationResult,
): Promise<Uint8Array> {
  void result;

  throw new Error("PDF generation is not implemented yet.");
}
