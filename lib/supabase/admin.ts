import "server-only";

import { createClient } from "@supabase/supabase-js";

let adminClient: ReturnType<typeof createClient> | null = null;

export type PurchasedUserInput = {
  name: string;
  email: string;
  temporaryPassword: string;
  hotmartTransactionId: string;
};

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are not configured.");
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

export async function createPurchasedUser({
  name,
  email,
  temporaryPassword,
  hotmartTransactionId,
}: PurchasedUserInput) {
  const supabase = getSupabaseAdminClient();

  return supabase.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      name,
    },
    app_metadata: {
      hotmart_transaction_id: hotmartTransactionId,
      access_source: "hotmart",
    },
  });
}
