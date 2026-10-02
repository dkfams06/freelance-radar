import type { AdapterFactory, FreelancePlatformAdapter, PlatformName } from "@fr/shared";
import { createWishketAdapter } from "@fr/platform-wishket";
import { createFreemoaAdapter } from "@fr/platform-freemoa";
import type { BrowserProvider } from "./browser/provider";
import type { CollectorLogger } from "./core/logger";

/** 플랫폼 → Adapter 팩토리. 플랫폼 이름을 아는 곳은 이 레지스트리뿐이다. */
const FACTORIES: Record<PlatformName, AdapterFactory> = {
  wishket: createWishketAdapter,
  freemoa: createFreemoaAdapter,
};

function credentialsFromEnv(platform: PlatformName) {
  const prefix = platform.toUpperCase();
  const username = process.env[`${prefix}_LOGIN_ID`];
  const password = process.env[`${prefix}_LOGIN_PASSWORD`];
  return username && password ? { username, password } : null;
}

export class AdapterRegistry {
  private readonly cache = new Map<PlatformName, FreelancePlatformAdapter>();

  constructor(
    private readonly browser: BrowserProvider,
    private readonly logger: CollectorLogger,
  ) {}

  async get(platform: PlatformName): Promise<FreelancePlatformAdapter> {
    const cached = this.cache.get(platform);
    if (cached) return cached;
    const page = await this.browser.getPage(platform);
    const log = this.logger.child({ platform });
    const adapter = FACTORIES[platform]({
      page,
      credentials: credentialsFromEnv(platform),
      log: (message, data) => log.debug(message, data),
    });
    this.cache.set(platform, adapter);
    return adapter;
  }
}
