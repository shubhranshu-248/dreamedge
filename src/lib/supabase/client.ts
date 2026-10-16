import { createBrowserClient } from "@supabase/ssr";

// After running `npm run db:types`, uncomment to enable typed queries:
// import type { Database } from "@/types/supabase";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
