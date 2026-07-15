import "server-only";

import { createClient } from "@supabase/supabase-js";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Database = {
  public: {
    Tables: {
      product_results: {
        Row: {
          id: string;
          user_id: string;
          profile: string;
          target_audience_description: string;
          selected_audience: string;
          selected_pain: string;
          selected_transformation: string;
          experience_level: string;
          selected_format: string;
          generated_result: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile: string;
          target_audience_description: string;
          selected_audience: string;
          selected_pain: string;
          selected_transformation: string;
          experience_level: string;
          selected_format: string;
          generated_result: Json;
          created_at?: string;
        };
        Update: Partial<{
          profile: string;
          target_audience_description: string;
          selected_audience: string;
          selected_pain: string;
          selected_transformation: string;
          experience_level: string;
          selected_format: string;
          generated_result: Json;
        }>;
        Relationships: [];
      };
      customer_access: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          buyer_name: string | null;
          provider: string;
          product_id: string;
          offer_code: string | null;
          transaction_id: string;
          access_status: "active" | "refunded" | "chargeback" | "canceled" | "blocked";
          must_change_password: boolean;
          purchased_at: string | null;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          buyer_name?: string | null;
          provider?: string;
          product_id: string;
          offer_code?: string | null;
          transaction_id: string;
          access_status?: "active" | "refunded" | "chargeback" | "canceled" | "blocked";
          must_change_password?: boolean;
          purchased_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          email: string;
          buyer_name: string | null;
          provider: string;
          product_id: string;
          offer_code: string | null;
          transaction_id: string;
          access_status: "active" | "refunded" | "chargeback" | "canceled" | "blocked";
          must_change_password: boolean;
          purchased_at: string | null;
          revoked_at: string | null;
          updated_at: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

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
    adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
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
