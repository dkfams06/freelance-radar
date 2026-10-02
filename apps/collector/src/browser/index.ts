import type { CollectorLogger } from "../core/logger";
import { AsideBrowserProvider } from "./aside";
import type { BrowserProvider } from "./provider";

export type { BrowserProvider } from "./provider";

export async function createBrowserProvider(logger: CollectorLogger): Promise<BrowserProvider> {
  const provider = new AsideBrowserProvider(logger, {
    account: process.env.ASIDE_ACCOUNT || null,
    cliPath: process.env.ASIDE_CLI_PATH || undefined,
    assistedLogin: process.env.ASIDE_ASSISTED_LOGIN === "1",
  });
  await provider.start();
  return provider;
}
