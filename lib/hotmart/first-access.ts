import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function generateFirstAccessLink(email: string, redirectTo: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}
