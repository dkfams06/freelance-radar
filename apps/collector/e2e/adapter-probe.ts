/**
 * 실제 사이트에서 Adapter 를 소량 실행해 raw/normalized 결과를 파일로 남긴다 (DB 저장 없음).
 *   pnpm --filter @fr/collector exec tsx e2e/adapter-probe.ts wishket 3 [page]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { isPlatformName } from "@fr/shared";
import { AdapterRegistry } from "../src/adapters";
import { AsideBrowserProvider } from "../src/browser/aside";
import { CollectorLogger } from "../src/core/logger";

const [platform = "wishket", countArg = "3", pageArg = "1"] = process.argv.slice(2);
if (!isPlatformName(platform)) throw new Error(`unknown platform ${platform}`);
const outDir = path.resolve(import.meta.dirname, "../.debug", platform);
mkdirSync(outDir, { recursive: true });

const logger = new CollectorLogger({}, null, "info");
const provider = new AsideBrowserProvider(logger);
await provider.start();
try {
  const adapter = await new AdapterRegistry(provider, logger).get(platform);
  console.log("login", await adapter.checkLogin());
  const list = await adapter.getProjectList({ page: Number(pageArg) });
  console.log("list", { page: list.page, items: list.items.length, hasNext: list.hasNextPage, total: list.totalCount });
  writeFileSync(path.join(outDir, `list-${pageArg}.json`), JSON.stringify(list, null, 2));
  for (const item of list.items.slice(0, Number(countArg))) {
    const t0 = Date.now();
    const raw = await adapter.getProjectDetail(item);
    const norm = await adapter.normalizeProject(raw);
    writeFileSync(path.join(outDir, `${item.externalId}.raw.json`), JSON.stringify(raw, null, 2));
    const { rawPayload, rawText, ...rest } = norm;
    writeFileSync(path.join(outDir, `${item.externalId}.normalized.json`), JSON.stringify(rest, null, 2));
    console.log(item.externalId, `${Date.now() - t0}ms`, JSON.stringify({ ...rest, extra: undefined, description: rest.description?.slice(0, 60) }));
  }
} finally {
  await provider.close();
}
