import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type DbClient = SupabaseClient;

/**
 * service_role 클라이언트. 서버(Collector, Next.js 서버 코드)에서만 사용한다.
 * 브라우저 번들에 포함되면 안 된다.
 */
export function createServiceClient(
  url = process.env.SUPABASE_URL,
  serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY,
): DbClient {
  if ("window" in globalThis) {
    throw new Error("createServiceClient must not be used in the browser");
  }
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasSupabaseEnv(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
