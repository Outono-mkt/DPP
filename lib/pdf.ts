import "server-only";

import type { ProductResult } from "@/types";

export async function generateProductResultPdf(
  result: ProductResult,
): Promise<Uint8Array> {
  void result;

  throw new Error("PDF generation is not implemented yet.");
}

