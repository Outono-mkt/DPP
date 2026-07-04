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
    const result = await getUserProductResult(user.id, id);

    if (!result) {
      return NextResponse.json(
        { error: "Produto nao encontrado." },
        { status: 404 },
      );
    }

    const pdf = generateProductResultPdf({
      createdAt: result.created_at,
      result: result.generated_result,
      whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL,
    });

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
