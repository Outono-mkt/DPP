import { NextResponse } from "next/server";

import { testGeminiConnection } from "@/lib/ai/gemini";

export async function GET() {
  try {
    await testGeminiConnection();

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json(
      { status: "error", error: "Nao foi possivel conectar com a Gemini." },
      { status: 500 },
    );
  }
}
