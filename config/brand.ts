import { getBrand } from "./brands";
export type { Brand, BrandKey } from "./brands";

export const brand = getBrand(process.env.BRAND_KEY ?? "diageo");
