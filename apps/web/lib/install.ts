/** The registry namespace users add to `components.json`. */
export const REGISTRY_NAMESPACE = "@angular-pdfcn";

/** The one-time `components.json` an Angular app needs before `shadcn add`. */
export const componentsJson = (registryUrl: string) => ({
  $schema: "https://ui.shadcn.com/schema.json",
  aliases: {
    components: "@/components",
    hooks: "@/hooks",
    lib: "@/lib",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  registries: {
    [REGISTRY_NAMESPACE]: `${registryUrl}/r/{name}.json`,
  },
  rsc: false,
  style: "new-york",
  tailwind: {
    baseColor: "neutral",
    config: "",
    css: "src/styles.css",
    cssVariables: true,
  },
  tsx: true,
});

/** The `paths` entry that resolves the `@/` imports in installed files. */
export const TSCONFIG_PATHS = { "@/*": ["./src/*"] };

export const addCommand = (...names: string[]) =>
  `npx shadcn@latest add ${names.map((name) => `${REGISTRY_NAMESPACE}/${name}`).join(" ")}`;
