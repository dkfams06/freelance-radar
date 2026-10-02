import type { CollectorLogger } from "../core/logger";
import type { BrowserProvider } from "./provider";

export type { BrowserProvider } from "./provider";

/** Phase 4 에서 Aside 연결 구현 */
export async function createBrowserProvider(_logger: CollectorLogger): Promise<BrowserProvider> {
  throw new Error("Aside browser provider is not configured yet");
}
