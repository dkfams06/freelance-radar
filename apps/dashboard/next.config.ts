import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import path from "node:path";

// 모노레포 루트 .env 공유 (Vercel 에서는 프로젝트 환경변수 사용)
const rootEnv = path.join(import.meta.dirname, "../../.env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const nextConfig: NextConfig = {
  transpilePackages: ["@fr/db", "@fr/shared"],
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
};

export default nextConfig;
