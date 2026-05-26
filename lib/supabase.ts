import { createClient } from "@supabase/supabase-js";

export type SupabaseConfig =
  | {
      ok: true;
      url: string;
      publishableKey: string;
    }
  | {
      ok: false;
      message: string;
    };

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return {
      ok: false,
      message: "Supabaseの環境変数が設定されていません。",
    };
  }

  return { ok: true, url, publishableKey };
}

export function createSupabaseClient() {
  const config = getSupabaseConfig();

  if (!config.ok) {
    return config;
  }

  return {
    ok: true as const,
    client: createClient(config.url, config.publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
  };
}
