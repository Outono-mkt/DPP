import { NextResponse } from "next/server";

import { generateProductResultPdf } from "@/lib/pdf";
import {
  getAuthenticatedUser,
  getUserProductResult,
} from "@/lib/supabase/product-results";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Id do produto nao informado." },
        { status: 400 },
      );
    }

    const result = await getUserProductResult(user.id, id);

    if (!result) {
      return NextResponse.json(
        { error: "Produto nao encontrado." },
        { status: 404 },
      );
    }

    const pdf = await generateProductResultPdf({
      createdAt: result.created_at,
      result: result.generated_result,
      selectedFormat: result.selected_format,
      userDisplayName: user.email,
      whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL,
    });

    if (pdf.byteLength === 0) {
      throw new Error("PDF buffer is empty.");
    }

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Disposition": `attachment; filename="produto-pronto-${id}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel gerar o PDF." },
      { status: 500 },
    );
  }
}
