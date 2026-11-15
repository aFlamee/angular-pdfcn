import type { BaseName } from "@/examples/__index__";
import type { BrandIconName } from "@/lib/brand-icons";

export const BASES = [
  {
    description:
      "Paged selectable-text PDF from Angular components via Takumi WASM.",
    logo: "takumi",
    name: "takumi",
    title: "Takumi",
  },
  {
    description:
      "Angular PDF components rendered with Forme's WASM layout engine, in the browser and on the server.",
    logo: "forme",
    name: "forme",
    title: "Forme",
  },
] as const satisfies readonly {
  name: BaseName;
  logo: BrandIconName;
  title: string;
  description: string;
}[];

export const DEFAULT_BASE: BaseName = BASES[0].name;

export const BASE_NAMES: readonly BaseName[] = BASES.map((base) => base.name);

export const getBase = (name: BaseName) =>
  BASES.find((base) => base.name === name);
