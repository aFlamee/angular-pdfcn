import { defineEventHandler, setResponseHeader } from "h3";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { loadDocs } from "@/lib/content/source";

interface SitemapEntry {
  changeFrequency: "monthly" | "weekly";
  priority: number;
  url: string;
}

const STATIC_PAGES: SitemapEntry[] = [
  { changeFrequency: "monthly", priority: 1, url: SITE.URL },
  {
    changeFrequency: "monthly",
    priority: 0.5,
    url: `${SITE.URL}${ROUTES.SPONSOR}`,
  },
  {
    changeFrequency: "weekly",
    priority: 0.8,
    url: `${SITE.URL}${ROUTES.THEME_BUILDER_FORME}`,
  },
  {
    changeFrequency: "weekly",
    priority: 0.8,
    url: `${SITE.URL}${ROUTES.THEME_BUILDER_TAKUMI}`,
  },
];

export default defineEventHandler((event) => {
  const lastModified = new Date().toISOString();
  const docPages = loadDocs().pages.map(
    (page): SitemapEntry => ({
      changeFrequency: "weekly",
      priority: page.url === ROUTES.DOCS ? 0.9 : 0.8,
      url: `${SITE.URL}${page.url}`,
    })
  );
  const urls = [...STATIC_PAGES, ...docPages].map(
    (entry) => `<url>
<loc>${entry.url}</loc>
<lastmod>${lastModified}</lastmod>
<changefreq>${entry.changeFrequency}</changefreq>
<priority>${entry.priority}</priority>
</url>`
  );

  setResponseHeader(event, "content-type", "application/xml");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
});
