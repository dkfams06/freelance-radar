import type { AdapterContext, FreelancePlatformAdapter } from "@fr/shared";
import { WishketAdapter } from "./adapter";

export { WishketAdapter } from "./adapter";
export { normalizeWishket } from "./normalize";
export type * from "./types";

export function createWishketAdapter(ctx: AdapterContext): FreelancePlatformAdapter {
  return new WishketAdapter(ctx);
}
