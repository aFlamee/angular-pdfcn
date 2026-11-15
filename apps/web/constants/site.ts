const baseUrl = "https://pdfcn-angular.com";

export const SITE = {
  DESCRIPTION: {
    LONG: "A collection of beautifully designed, accessible, and customizable PDF components for Angular. Built on Takumi and Forme. Works with the shadcn CLI.",
    SHORT: "Beautiful PDFs, made simple",
  },
  KEYWORDS: [
    "angular",
    "shadcn",
    "shadcn registry",
    "pdf components",
    "takumi-pdf",
    "forme",
    "angular pdf",
    "npx shadcn add",
  ] as const,
  NAME: "angular-pdfcn",
  OG_IMAGE: `${baseUrl}/og.png`,
  REGISTRY: "@angular-pdfcn",
  URL: baseUrl,
};

export const META_THEME_COLORS = {
  dark: "#09090b",
  light: "#ffffff",
};
