import { DOCUMENT } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
} from "@angular/core";

import { LINK, ORIGINAL } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

const ORIGINAL_AUTHOR = {
  "@type": "Person",
  name: ORIGINAL.AUTHOR,
  url: ORIGINAL.AUTHOR_URL,
};

const SITE_JSON_LD: Record<string, Record<string, unknown>> = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    logo: SITE.OG_IMAGE,
    name: SITE.NAME,
    sameAs: [LINK.GITHUB],
    url: SITE.URL,
  },
  "software-source-code": {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    applicationCategory: "DeveloperApplication",
    author: ORIGINAL_AUTHOR,
    codeRepository: LINK.GITHUB,
    description: SITE.DESCRIPTION.LONG,
    isAccessibleForFree: true,
    isBasedOn: ORIGINAL.GITHUB,
    keywords: SITE.KEYWORDS,
    license: LINK.LICENSE,
    name: SITE.NAME,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    programmingLanguage: ["TypeScript", "Angular"],
    runtimePlatform: "Node.js",
    url: SITE.URL,
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: SITE.DESCRIPTION.LONG,
    inLanguage: "en-US",
    name: SITE.NAME,
    url: SITE.URL,
  },
};

/** Writes one JSON-LD script into the head, reusing the prerendered one on the client. */
const writeJsonLd = (
  document: Document,
  id: string,
  data: Record<string, unknown>
) => {
  const elementId = `json-ld-${id}`;
  let script = document.querySelector(`#${elementId}`);
  if (!script) {
    script = document.createElement("script");
    script.id = elementId;
    script.setAttribute("type", "application/ld+json");
    // oxlint-disable-next-line unicorn/prefer-dom-node-append -- Domino has no `append`.
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

/** The site's WebSite, SoftwareSourceCode, and Organization JSON-LD. Mount it once in the app root. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-json-ld",
  template: "",
})
export class JsonLd {
  constructor() {
    const document = inject(DOCUMENT);
    for (const [id, data] of Object.entries(SITE_JSON_LD)) {
      writeJsonLd(document, id, data);
    }
  }
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** A BreadcrumbList for the current page. Removed when the page leaves. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-breadcrumb-json-ld",
  template: "",
})
export class BreadcrumbJsonLd {
  readonly items = input.required<BreadcrumbItem[]>();

  constructor() {
    const document = inject(DOCUMENT);
    effect(() => {
      writeJsonLd(document, "breadcrumb", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: this.items().map((item, index) => ({
          "@type": "ListItem",
          item: `${SITE.URL}${item.path.startsWith(ROUTES.HOME) ? item.path : `${ROUTES.HOME}${item.path}`}`,
          name: item.name,
          position: index + 1,
        })),
      });
    });
    inject(DestroyRef).onDestroy(() =>
      document.querySelector("#json-ld-breadcrumb")?.remove()
    );
  }
}
