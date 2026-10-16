import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// WARNING: This client uses the SERVICE ROLE key which bypasses RLS.
// It must ONLY be used in server actions — never expose it to the client.
// Set SUPABASE_SERVICE_ROLE_KEY in your .env.local (never commit the actual key).
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
