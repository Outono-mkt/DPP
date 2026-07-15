import "server-only";

import { randomBytes } from "crypto";
import type { User } from "@supabase/supabase-js";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type CustomerAccessInput = {
  buyerName: string | null;
  email: string;
  productId: string;
  offerCode: string | null;
  transactionId: string;
  purchasedAt: string | null;
};

export type CustomerAccessResult =
  | { status: "already_processed"; userId: string }
  | { status: "created"; userId: string; createdUser: boolean };

export async function processApprovedCustomerAccess(
  input: CustomerAccessInput,
): Promise<CustomerAccessResult> {
  const existingAccess = await findCustomerAccessByTransaction(input.transactionId);

  if (existingAccess) {
    return { status: "already_processed", userId: existingAccess.user_id };
  }

  const { user, createdUser } = await findOrCreatePurchasedUser(input);
  const insertResult = await insertCustomerAccess(user.id, input);

  if (insertResult === "duplicate") {
    return { status: "already_processed", userId: user.id };
  }

  return { status: "created", userId: user.id, createdUser };
}

export async function markCustomerAccessPasswordChanged(userId: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("customer_access")
    .update({
      must_change_password: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("provider", "hotmart")
    .eq("access_status", "active");

  if (error) {
    throw error;
  }
}

async function findCustomerAccessByTransaction(transactionId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("customer_access")
    .select("user_id, transaction_id")
    .eq("transaction_id", transactionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function insertCustomerAccess(userId: string, input: CustomerAccessInput) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("customer_access").insert({
    user_id: userId,
    email: input.email,
    buyer_name: input.buyerName,
    provider: "hotmart",
    product_id: input.productId,
    offer_code: input.offerCode,
    transaction_id: input.transactionId,
    access_status: "active",
    must_change_password: true,
    purchased_at: input.purchasedAt,
    revoked_at: null,
  });

  if (!error) return "inserted";

  if (error.code === "23505") {
    return "duplicate";
  }

  throw error;
}

async function findOrCreatePurchasedUser(input: CustomerAccessInput) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    return { user: existingUser, createdUser: false };
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: generateTemporaryPassword(),
    email_confirm: true,
    user_metadata: {
      name: input.buyerName,
      source: "hotmart",
      hotmart_transaction_id: input.transactionId,
    },
    app_metadata: {
      access_source: "hotmart",
      hotmart_transaction_id: input.transactionId,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("Supabase did not return the created user.");
  }

  return { user: data.user, createdUser: true };
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

    const user = data.users.find((item: User) => item.email?.toLowerCase() === email);

    if (user) return user;
    if (data.users.length < 100) return null;

    page += 1;
  }

  return null;
}

function generateTemporaryPassword() {
  return `${randomBytes(18).toString("base64url")}Aa1!`;
}
