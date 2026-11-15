import { GITHUB } from "@/constants/links";

/** The repository's star count, or 0 when GitHub doesn't answer. */
export const getStargazerCount = async () => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB.org}/${GITHUB.repo}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const json = (await response.json()) as { stargazers_count?: number };
    return Number(json.stargazers_count) || 0;
  } catch {
    return 0;
  }
};
