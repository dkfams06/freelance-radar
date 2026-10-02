/** 목록 페이지별 등록일 범위 확인: tsx e2e/list-dates.ts wishket 100 500 1000 */
import { isPlatformName } from "@fr/shared";
import { AdapterRegistry } from "../src/adapters";
import { AsideBrowserProvider } from "../src/browser/aside";
import { CollectorLogger } from "../src/core/logger";

const [platform = "wishket", ...pages] = process.argv.slice(2);
if (!isPlatformName(platform)) throw new Error("platform");
const logger = new CollectorLogger({}, null, "warn");
const provider = new AsideBrowserProvider(logger);
await provider.start();
try {
  const adapter = await new AdapterRegistry(provider, logger).get(platform);
  for (const p of pages.map(Number)) {
    const list = await adapter.getProjectList({ page: p });
    const dates = list.items.map((i) => i.registeredAt?.toISOString().slice(0, 10));
    console.log(p, list.items.length, dates[0], "→", dates.at(-1), "ids", list.items[0]?.externalId, list.items.at(-1)?.externalId, "total", list.totalCount);
  }
} finally {
  await provider.close();
}
