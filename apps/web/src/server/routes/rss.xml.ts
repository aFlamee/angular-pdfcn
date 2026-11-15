import { defineEventHandler, setResponseHeader } from "h3";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { changelogDate, getChangelogPages } from "@/lib/changelog";
import { loadDocs } from "@/lib/content/source";

export default defineEventHandler((event) => {
  const items = getChangelogPages(loadDocs().pages)
    .map((page) => {
      const link = `${SITE.URL}${page.url}`;

      return `    <item>
      <title><![CDATA[${page.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description><![CDATA[${page.description || ""}]]></description>
      <pubDate>${changelogDate(page).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  setResponseHeader(
    event,
    "content-type",
    "application/rss+xml; charset=utf-8"
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE.NAME} Changelog</title>
    <link>${SITE.URL}</link>
    <description>${SITE.DESCRIPTION.LONG}</description>
    <language>en-us</language>
    <atom:link href="${SITE.URL}${ROUTES.RSS}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
});
