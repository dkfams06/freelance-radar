import type { AdapterContext, FreelancePlatformAdapter } from "@fr/shared";
import { FreemoaAdapter } from "./adapter";

export { FreemoaAdapter } from "./adapter";
export { normalizeFreemoa, workTypeLabel } from "./normalize";
export type * from "./types";

export function createFreemoaAdapter(ctx: AdapterContext): FreelancePlatformAdapter {
  return new FreemoaAdapter(ctx);
}
