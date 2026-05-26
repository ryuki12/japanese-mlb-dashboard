import { createClient } from "@supabase/supabase-js";

export type SupabaseConfig =
  | {
      ok: true;
      url: string;
      anonKey: string;
    }
  | {
      ok: false;
      message: string;
    };

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      ok: false,
      message: "Supabaseの環境変数が設定されていません。",
    };
  }

  return { ok: true, url, anonKey };
}

export function createSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config.ok) {
    return config;
  }

  return {
    ok: true as const,
    client: createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
  };
}
