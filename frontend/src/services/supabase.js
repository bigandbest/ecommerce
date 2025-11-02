// src/services/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "customer-supabase-auth-token",
      persistSession: true,
    },
  });
} else {
  console.warn(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
  // supabase remains null - auth won't work until keys are provided
}

export default supabase;
