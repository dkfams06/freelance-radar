import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/src/**/*.test.ts", "apps/collector/src/**/*.test.ts", "apps/analyzer/src/**/*.test.ts"],
    // 실제 브라우저 E2E는 별도 (apps/collector/e2e) — 기본 테스트에서 제외
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
