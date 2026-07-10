import { NextResponse } from "next/server";

import { ProductResultPdfError, generateProductResultPdf } from "@/lib/pdf";
import {
  getAuthenticatedUser,
  getUserProductResult,
} from "@/lib/supabase/product-results";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  let productId = "unknown";
  let stage = "params";

  try {
    const { id } = await context.params;
    productId = id || "missing";

    if (!id) {
      return NextResponse.json(
        { error: "Id do produto nao informado." },
        { status: 400 },
      );
    }

    stage = "auth";
    const user = await getAuthenticatedUser(request);

    stage = "load_product";
    const result = await getUserProductResult(user.id, id);

    if (!result) {
      return NextResponse.json(
        { error: "Produto nao encontrado." },
        { status: 404 },
      );
    }

    stage = "render_pdf";
    const pdf = await generateProductResultPdf({
      createdAt: result.created_at,
      result: result.generated_result,
      selectedFormat: result.selected_format,
      userDisplayName: user.email,
      whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL,
    });

    stage = "buffer";
    if (pdf.byteLength === 0) {
      throw new ProductResultPdfError("PDF buffer is empty.", stage, "renderToBuffer");
    }

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Disposition": `attachment; filename="produto-pronto-${id}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    logPdfRouteError({
      error,
      productId,
      stage: error instanceof ProductResultPdfError ? error.stage : stage,
    });

    return NextResponse.json(
      {
        error: getPdfRouteErrorMessage(error),
        code: "PDF_GENERATION_FAILED",
        stage: error instanceof ProductResultPdfError ? error.stage : stage,
      },
      { status: 500 },
    );
  }
}

function getPdfRouteErrorMessage(error: unknown) {
  if (error instanceof ProductResultPdfError) {
    if (error.stage === "normalization" || error.stage === "validation") {
      return "Nao foi possivel preparar os dados deste produto para o PDF.";
    }

    if (error.stage === "render" || error.stage === "buffer") {
      return "Nao foi possivel renderizar o PDF deste produto agora.";
    }
  }

  return "Nao foi possivel gerar o PDF agora.";
}

function logPdfRouteError({
  error,
  productId,
  stage,
}: {
  error: unknown;
  productId: string;
  stage: string;
}) {
  const originalError = error instanceof ProductResultPdfError ? error.originalError : error;
  const message = originalError instanceof Error ? originalError.message : String(originalError);
  const stack = originalError instanceof Error ? originalError.stack : undefined;

  console.error("Product PDF generation failed", {
    field: error instanceof ProductResultPdfError ? error.field : undefined,
    message,
    productId,
    stack,
    stage,
  });
}
