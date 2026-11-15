/** The site origin for build-time code. The app reads it as `SITE.URL`. */
export const buildSiteUrl = () =>
  (process.env["SITE_URL"] ?? "http://localhost:5173").replace(/\/$/, "");
