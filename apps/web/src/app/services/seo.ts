import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";

import { LINK, ORIGINAL } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

export interface PageMetadata {
  title?: string;
  description?: string;
  ogType?: "article" | "website";
  path: string;
  noIndex?: boolean;
}

/** The reference's `baseMetadata`. Icons, manifest, and theme-color live in `index.html`. */
const BASE_TAGS: [string, string, string][] = [
  ["name", "application-name", SITE.NAME],
  ["name", "author", ORIGINAL.AUTHOR],
  ["name", "creator", ORIGINAL.AUTHOR],
  ["name", "keywords", SITE.KEYWORDS.join(",")],
  ["name", "category", "technology"],
  ["name", "mobile-web-app-capable", "yes"],
  ["name", "apple-mobile-web-app-title", SITE.NAME],
  ["name", "apple-mobile-web-app-status-bar-style", "default"],
  ["property", "og:site_name", SITE.NAME],
  ["property", "og:locale", "en_US"],
  ["property", "og:image", SITE.OG_IMAGE],
  ["property", "og:image:width", "1200"],
  ["property", "og:image:height", "630"],
  ["name", "twitter:card", "summary_large_image"],
  ["name", "twitter:image", SITE.OG_IMAGE],
];

/** `rel` and `href` of the head links. The api-catalog links replace the reference's `Link` header. */
const BASE_LINKS: [string, string][] = [
  ["author", ORIGINAL.AUTHOR_URL],
  ["api-catalog", ROUTES.API_CATALOG],
  ["service-desc", ROUTES.OPENAPI],
  ["service-doc", ROUTES.DOCS],
  ["service-doc", LINK.SHADCN_MCP_DOCS],
  ["describedby", ROUTES.AGENT_SKILLS_INDEX],
];

/** The reference's `createPageMetadata` and `baseMetadata`, applied to the document head. */
@Injectable({ providedIn: "root" })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  constructor() {
    for (const [key, name, content] of BASE_TAGS) {
      this.meta.updateTag({ [key]: name, content });
    }
    for (const [rel, href] of BASE_LINKS) {
      this.findOrCreateLink(`link[rel="${rel}"][href="${href}"]`, rel).href =
        href;
    }
  }

  setPage({
    title,
    description = SITE.DESCRIPTION.LONG,
    ogType = "website",
    path,
    noIndex = false,
  }: PageMetadata) {
    const fullTitle = title
      ? `${title} | ${SITE.NAME}`
      : `${SITE.NAME} - ${SITE.DESCRIPTION.SHORT}`;
    const url = `${SITE.URL}${path}`;
    this.title.setTitle(fullTitle);
    const tags: [string, string, string][] = [
      ["name", "description", description],
      ["property", "og:title", title ?? SITE.NAME],
      ["property", "og:description", description],
      ["property", "og:type", ogType],
      ["property", "og:url", url],
      ["property", "og:image:alt", title ?? SITE.NAME],
      ["name", "twitter:title", title ?? SITE.NAME],
      ["name", "twitter:description", description],
    ];
    for (const [key, name, content] of tags) {
      this.meta.updateTag({ [key]: name, content });
    }
    if (noIndex) {
      this.meta.updateTag({ content: "noindex, nofollow", name: "robots" });
    } else {
      this.meta.removeTag('name="robots"');
    }
    this.setLink("canonical", url);
    const isDocs = path === ROUTES.DOCS || path.startsWith(`${ROUTES.DOCS}/`);
    this.setLink(
      "alternate",
      isDocs ? `${SITE.URL}${path}.md` : null,
      "text/markdown"
    );
  }

  private setLink(rel: string, href: string | null, type?: string) {
    const selector = type
      ? `link[rel="${rel}"][type="${type}"]`
      : `link[rel="${rel}"]`;
    if (!href) {
      this.document.head.querySelector(selector)?.remove();
      return;
    }
    const link = this.findOrCreateLink(selector, rel);
    if (type) {
      link.type = type;
    }
    link.href = href;
  }

  private findOrCreateLink(selector: string, rel: string) {
    let link = this.document.head.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = this.document.createElement("link");
      link.rel = rel;
      // oxlint-disable-next-line unicorn/prefer-dom-node-append -- Domino has no `append`.
      this.document.head.appendChild(link);
    }
    return link;
  }
}
