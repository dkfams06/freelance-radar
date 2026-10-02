import type { BrowserPage, PlatformName } from "@fr/shared";

/**
 * Collector 가 사용하는 브라우저 공급자.
 * 플랫폼마다 로그인 세션이 유지되는 탭(페이지)을 하나씩 재사용한다.
 */
export interface BrowserProvider {
  readonly name: string;
  getPage(platform: PlatformName): Promise<BrowserPage>;
  close(): Promise<void>;
}
