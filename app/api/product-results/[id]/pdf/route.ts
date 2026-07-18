import { NextResponse } from "next/server";

import { ProductResultPdfError, generateProductResultPdf } from "@/lib/pdf";
import {
  getAuthenticatedUser,
  getUserProductResult,
} from "@/lib/supabase/product-results";
import { WHATSAPP_URL } from "@/lib/whatsapp";

export const runtime = "nodejs";

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
    const filename = getPdfFilename(result.generated_result);

    stage = "render_pdf";
    const pdf = await generateProductResultPdf({
      createdAt: result.created_at,
      result: result.generated_result,
      selectedFormat: result.selected_format,
      userDisplayName: user.email,
      whatsappUrl: WHATSAPP_URL,
    });

    stage = "buffer";
    const buffer = Buffer.from(pdf);

    if (buffer.byteLength === 0 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new ProductResultPdfError("PDF buffer is empty.", stage, "renderToBuffer");
    }

    return new Response(buffer, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": 'attachment; filename="' + filename + '"',
        "Content-Length": String(buffer.byteLength),
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    const errorStage = error instanceof ProductResultPdfError ? error.stage : stage;
    const status = errorStage === "auth" ? 401 : 500;

    if (status === 500) {
      logPdfRouteError({ error, productId, stage: errorStage });
    }

    return NextResponse.json(
      {
        error:
          status === 401
            ? "Sua sessao expirou. Entre novamente para baixar o PDF."
            : getPdfRouteErrorMessage(error),
        code: status === 401 ? "UNAUTHORIZED" : "PDF_GENERATION_FAILED",
      },
      { status, headers: { "Cache-Control": "no-store" } },
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

function getPdfFilename(result: {
  ideia?: unknown;
  nomes?: unknown;
}) {
  const names = Array.isArray(result.nomes) ? result.nomes : [];
  const preferredName =
    names.find((name): name is string => typeof name === "string" && name.trim().length > 0) ??
    (typeof result.ideia === "string" ? result.ideia : "");
  const safeName = preferredName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .replace(/[^a-zA-Z0-9 -]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);

  return safeName ? "produto-pronto-" + safeName.toLowerCase() + ".pdf" : "produto-pronto.pdf";
}
