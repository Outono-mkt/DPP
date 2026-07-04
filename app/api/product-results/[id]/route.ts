import { NextResponse } from "next/server";

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

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel carregar este produto." },
      { status: 401 },
    );
  }
}
