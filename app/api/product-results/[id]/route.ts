import { NextResponse } from "next/server";

import {
  deleteUserProductResult,
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

export async function DELETE(
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

    await deleteUserProductResult(user.id, id);

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel excluir este produto." },
      { status: 500 },
    );
  }
}
