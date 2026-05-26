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

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    return {
      ok: false as const,
      message: "Supabaseのサーバー用環境変数が設定されていません。",
    };
  }

  return {
    ok: true as const,
    client: createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
  };
}
