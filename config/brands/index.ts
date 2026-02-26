import { brand as diageoBrand } from "./diageo";
import { brand as meridianBrand } from "./meridian";
import { brand as solaraBrand } from "./solara";

const brands = {
  diageo: diageoBrand,
  meridian: meridianBrand,
  solara: solaraBrand,
} as const;

export type BrandKey = keyof typeof brands;
export type Brand = (typeof brands)[BrandKey];

export function getBrand(key?: string): Brand {
  return brands[key as BrandKey] ?? brands.diageo;
}
