import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import {
  registerProdutoProntoUser,
  RegistrationEmailExistsError,
} from "@/lib/access/registration";

const MAX_BODY_SIZE = 8_192;
const MAX_FAILED_CODE_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const failedCodeAttempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return response({ ok: false, error: "N\u00e3o foi poss\u00edvel processar este cadastro." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_SIZE) {
    return response({ ok: false, error: "N\u00e3o foi poss\u00edvel processar este cadastro." }, 413);
  }

  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return response(
      { ok: false, error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
      429,
      { "Retry-After": "600" },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return response({ ok: false, error: "N\u00e3o foi poss\u00edvel processar este cadastro." }, 400);
  }

  const validation = validateRegistrationPayload(payload);

  if (!validation.ok) {
    return response({ ok: false, error: validation.error }, 400);
  }

  const configuredCode = process.env.DPP_REGISTRATION_ACCESS_CODE;

  if (!configuredCode) {
    return response(
      { ok: false, error: "O cadastro est\u00e1 temporariamente indispon\u00edvel." },
      503,
    );
  }

  if (!codesMatch(validation.data.challengeCode, configuredCode)) {
    registerFailedCodeAttempt(clientKey);
    return response(
      {
        ok: false,
        error:
          "C\u00f3digo do Desafio inv\u00e1lido. Confira o c\u00f3digo dispon\u00edvel na primeira aula da Hotmart e tente novamente.",
      },
      401,
    );
  }

  clearFailedCodeAttempts(clientKey);

  try {
    await registerProdutoProntoUser({
      email: validation.data.email,
      name: validation.data.name,
      password: validation.data.password,
    });

    return response({ ok: true }, 201);
  } catch (error) {
    if (error instanceof RegistrationEmailExistsError) {
      return response(
        {
          ok: false,
          error:
            "Este e-mail j\u00e1 possui uma conta. Entre com sua senha ou utilize a recupera\u00e7\u00e3o de senha.",
        },
        409,
      );
    }

    return response(
      { ok: false, error: "N\u00e3o foi poss\u00edvel criar sua conta agora. Tente novamente em instantes." },
      500,
    );
  }
}

function validateRegistrationPayload(value: unknown):
  | {
      ok: true;
      data: { challengeCode: string; email: string; name: string; password: string };
    }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "N\u00e3o foi poss\u00edvel processar este cadastro." };
  }

  const candidate = value as Record<string, unknown>;
  const name = asString(candidate.name);
  const email = asString(candidate.email).toLowerCase();
  const challengeCode = asString(candidate.challengeCode);
  const password = typeof candidate.password === "string" ? candidate.password : "";
  const passwordConfirmation =
    typeof candidate.passwordConfirmation === "string" ? candidate.passwordConfirmation : "";

  if (!name) return { ok: false, error: "Informe seu nome." };
  if (name.length > 120) return { ok: false, error: "Informe um nome v\u00e1lido." };
  if (!isValidEmail(email)) return { ok: false, error: "Informe um e-mail v\u00e1lido." };
  if (!challengeCode) return { ok: false, error: "Informe o C\u00f3digo do Desafio." };
  if (challengeCode.length > 128) {
    return { ok: false, error: "C\u00f3digo do Desafio inv\u00e1lido." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Crie uma senha com pelo menos 8 caracteres." };
  }
  if (password.length > 128) return { ok: false, error: "Informe uma senha v\u00e1lida." };
  if (password !== passwordConfirmation) {
    return { ok: false, error: "As senhas n\u00e3o conferem." };
  }

  return { ok: true, data: { challengeCode, email, name, password } };
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function codesMatch(received: string, expected: string) {
  const receivedHash = createHash("sha256").update(received).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(receivedHash, expectedHash);
}

function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function isRateLimited(clientKey: string) {
  const attempt = failedCodeAttempts.get(clientKey);

  if (!attempt) return false;
  if (attempt.resetAt <= Date.now()) {
    failedCodeAttempts.delete(clientKey);
    return false;
  }

  return attempt.count >= MAX_FAILED_CODE_ATTEMPTS;
}

function registerFailedCodeAttempt(clientKey: string) {
  const current = failedCodeAttempts.get(clientKey);
  const now = Date.now();

  if (!current || current.resetAt <= now) {
    failedCodeAttempts.set(clientKey, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return;
  }

  failedCodeAttempts.set(clientKey, { ...current, count: current.count + 1 });
}

function clearFailedCodeAttempts(clientKey: string) {
  failedCodeAttempts.delete(clientKey);
}

function response(
  payload: { ok: boolean; error?: string },
  status: number,
  headers?: Record<string, string>,
) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}
