import "server-only";

import type { User } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const REGISTRATION_PROVIDER = "dpp";
const REGISTRATION_PRODUCT_ID = "produto-pronto";

export class RegistrationEmailExistsError extends Error {
  constructor() {
    super("Registration email already exists.");
    this.name = "RegistrationEmailExistsError";
  }
}

export async function registerProdutoProntoUser({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}) {
  const supabase = getSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new RegistrationEmailExistsError();
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      name: normalizedName,
      source: "dpp_registration",
    },
    app_metadata: {
      access_source: "dpp_registration",
    },
  });

  if (error || !data.user) {
    if (isEmailAlreadyRegisteredError(error)) {
      throw new RegistrationEmailExistsError();
    }

    throw error ?? new Error("Supabase did not return the created user.");
  }

  try {
    await ensureRegistrationAccess(data.user, normalizedName);
  } catch (accessError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    throw accessError;
  }

  return { userId: data.user.id };
}

async function ensureRegistrationAccess(user: User, buyerName: string) {
  const supabase = getSupabaseAdminClient();
  const transactionId = `dpp-registration:${user.id}`;
  const { error } = await supabase.from("customer_access").upsert(
    {
      user_id: user.id,
      email: user.email?.toLowerCase() ?? "",
      buyer_name: buyerName,
      provider: REGISTRATION_PROVIDER,
      product_id: REGISTRATION_PRODUCT_ID,
      offer_code: null,
      transaction_id: transactionId,
      access_status: "active",
      must_change_password: false,
      purchased_at: null,
      revoked_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "transaction_id" },
  );

  if (error) {
    throw error;
  }
}

async function findUserByEmail(email: string) {
  const supabase = getSupabaseAdminClient();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find((item) => item.email?.toLowerCase() === email);

    if (user) return user;
    if (data.users.length < 100) return null;

    page += 1;
  }

  return null;
}

function isEmailAlreadyRegisteredError(error: { message?: string; status?: number } | null) {
  if (!error) return false;

  const message = error.message?.toLowerCase() ?? "";
  return error.status === 422 || message.includes("already") || message.includes("registered");
}
