/**
 * 실제 Aside Browser 연결 확인용 E2E (vitest 기본 실행에서 제외).
 *   pnpm --filter @fr/collector exec tsx e2e/aside-smoke.ts
 */
import { pageFetch } from "@fr/shared";
import { AsideBrowserProvider } from "../src/browser/aside";
import { CollectorLogger } from "../src/core/logger";

const logger = new CollectorLogger({}, null, (process.env.COLLECTOR_LOG_LEVEL as "debug") ?? "info");
const provider = new AsideBrowserProvider(logger);
await provider.start();
try {
  const page = await provider.getPage("wishket");
  const nav = await page.goto("https://www.wishket.com/project/");
  console.log("goto", nav);
  const title = await page.evaluate<string>("document.title");
  console.log("title", title);
  const d = await page.evaluate<string>("encodeURIComponent(LZString.compressToBase64('srt=new&page=1'))");
  const res = await pageFetch<{ count: number; result: string }>(page, `/project/?d=${d}`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  console.log("list", res.status, res.json?.count, res.json?.result.length);
} finally {
  await provider.close();
}
