import "server-only";
import { createServiceClient, hasSupabaseEnv, type DbClient } from "@fr/db";

let client: DbClient | null = null;

/** service_role 클라이언트 — 서버 컴포넌트/서버 액션에서만 사용 */
export function getDb(): DbClient {
  client ??= createServiceClient();
  return client;
}

export { hasSupabaseEnv };
