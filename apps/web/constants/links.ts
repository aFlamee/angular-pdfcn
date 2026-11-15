export const GITHUB = {
  branch: "main",
  org: "aFlamee",
  repo: "angular-pdfcn",
} as const;

const githubUrl = `https://github.com/${GITHUB.org}/${GITHUB.repo}`;

/** Maintainer of this port. */
export const OWNER = {
  NAME: GITHUB.org,
  URL: `https://github.com/${GITHUB.org}`,
} as const;

/** The original pdfcn this site ports, credited on the site. */
export const ORIGINAL = {
  AUTHOR: "Aniket Pawar",
  AUTHOR_URL: "https://aniketpawar.com",
  CONTRIBUTORS: "https://github.com/shadcn-labs/pdfcn/graphs/contributors",
  GITHUB: "https://github.com/shadcn-labs/pdfcn",
  NAME: "pdfcn",
} as const;

export const LINK = {
  GITHUB: githubUrl,
  LICENSE: `${githubUrl}/blob/${GITHUB.branch}/LICENSE`,
  SHADCN_MCP_DOCS: "https://ui.shadcn.com/docs/mcp",
  SPONSOR: `https://github.com/sponsors/${GITHUB.org}`,
} as const;
