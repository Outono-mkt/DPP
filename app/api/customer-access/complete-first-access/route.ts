import { NextResponse } from "next/server";

import { markCustomerAccessPasswordChanged } from "@/lib/access/customer-access";
import { getAuthenticatedUser } from "@/lib/supabase/product-results";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    await markCustomerAccessPasswordChanged(user.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Nao foi possivel concluir o primeiro acesso." },
      { status: 401 },
    );
  }
}
