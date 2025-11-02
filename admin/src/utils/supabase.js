import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// Use global variable to ensure single instance across hot reloads
const SUPABASE_GLOBAL_KEY = "__admin_supabase_client__";
const SUPABASE_ADMIN_GLOBAL_KEY = "__admin_supabase_admin_client__";

// Create regular client with anon key (singleton with global check)
const getSupabaseClient = () => {
  if (!window[SUPABASE_GLOBAL_KEY]) {
    window[SUPABASE_GLOBAL_KEY] = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: window.localStorage,
        storageKey: "big-best-admin-auth-token",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          "X-Client-Info": "big-best-admin",
        },
      },
      db: {
        schema: "public",
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return window[SUPABASE_GLOBAL_KEY];
};

// Create admin client with service role key (singleton with global check)
const getSupabaseAdminClient = () => {
  if (!window[SUPABASE_ADMIN_GLOBAL_KEY]) {
    window[SUPABASE_ADMIN_GLOBAL_KEY] = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          storage: window.localStorage,
          storageKey: "big-best-admin-service-role-token",
        },
        global: {
          headers: {
            "X-Client-Info": "big-best-admin-service",
          },
        },
      }
    );
  }
  return window[SUPABASE_ADMIN_GLOBAL_KEY];
};

// Export singleton instances
const supabase = getSupabaseClient();
const supabaseAdmin = getSupabaseAdminClient();

export default supabase;
export { supabase, supabaseAdmin };
