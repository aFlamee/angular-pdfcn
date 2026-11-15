export const GITHUB = {
  branch: "main",
  org: "aFlamee",
  repo: "angular-pdfcn",
} as const;

const githubUrl = `https://github.com/${GITHUB.org}/${GITHUB.repo}`;

/** The original pdfcn this site ports, credited on the site. */
export const ORIGINAL = {
  AUTHOR: "Aniket Pawar",
  AUTHOR_URL: "https://aniketpawar.com",
  CONTRIBUTORS: "https://github.com/shadcn-labs/pdfcn/graphs/contributors",
  GITHUB: "https://github.com/shadcn-labs/pdfcn",
  NAME: "pdfcn",
  SPONSOR: "https://github.com/sponsors/Aniket-508",
} as const;

export const LINK = {
  GITHUB: githubUrl,
  LICENSE: `${githubUrl}/blob/${GITHUB.branch}/LICENSE`,
  SHADCN_MCP_DOCS: "https://ui.shadcn.com/docs/mcp",
  SPONSOR: ORIGINAL.SPONSOR,
} as const;
