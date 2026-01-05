/**
 * GitHub Releases Scraper
 *
 * Fetches latest releases from Claude Code GitHub repository using gh CLI.
 *
 * Usage:
 *   import { GitHubReleasesScraper } from "./scrapers/github-releases.ts";
 *   const findings = await GitHubReleasesScraper.scrape(source);
 */

import { Finding } from "../types.ts";
import crypto from "crypto";

export interface GitHubRelease {
  tagName: string;
  name: string;
  publishedAt: string;
  url: string;
  body: string;
  isLatest: boolean;
  isPrerelease: boolean;
}

export interface ScrapeOptions {
  maxReleases?: number;
  includePrerelease?: boolean;
  since?: string; // ISO date string
}

/**
 * Scrape GitHub releases using gh CLI
 *
 * @param repo - Repository in format "owner/repo"
 * @param options - Scraping options
 * @returns Array of Finding objects
 */
export async function scrapeGitHubReleases(
  repo: string,
  sourceId: string,
  options: ScrapeOptions = {}
): Promise<Finding[]> {
  const { maxReleases = 10, includePrerelease = false } = options;

  try {
    // Step 1: Fetch list of releases
    const listCmd = `gh release list --repo ${repo} --limit ${maxReleases} --json tagName,name,publishedAt,isLatest,isPrerelease,createdAt`;

    const listResult = await Bun.$`bash -c ${listCmd}`.text();
    const releases: GitHubRelease[] = JSON.parse(listResult);

    // Filter out prereleases if not included
    const filteredReleases = includePrerelease
      ? releases
      : releases.filter(r => !r.isPrerelease);

    // Step 2: Fetch detailed release notes for each release
    const detailedReleases: GitHubRelease[] = [];
    for (const release of filteredReleases) {
      const viewCmd = `gh release view ${release.tagName} --repo ${repo} --json body,tagName,name,publishedAt,url`;
      const viewResult = await Bun.$`bash -c ${viewCmd}`.text();
      const detailed = JSON.parse(viewResult);

      detailedReleases.push({
        ...release,
        body: detailed.body || "",
        url: detailed.url
      });
    }

    // Step 3: Convert to Finding objects
    return processGitHubReleases(detailedReleases, sourceId);

  } catch (error) {
    console.error(`Error scraping GitHub releases: ${error}`);
    return [];
  }
}

/**
 * Convert GitHub releases to Finding objects
 */
export function processGitHubReleases(
  releases: GitHubRelease[],
  sourceId: string
): Finding[] {
  return releases.map(release => {
    const relevance = calculateRelevance(release);
    const category = categorizeRelease(release);
    const features = extractFeatures(release.body);

    return {
      id: generateFindingId(release.url),
      source: sourceId,
      type: "release" as const,
      date: release.publishedAt,
      url: release.url,
      title: `${release.name} - ${release.tagName}`,
      summary: generateSummary(release.body, features),
      relevance: relevance.score,
      category,
      keywords: extractKeywords(release.body),
      action_items: generateActionItems(release, relevance, category, features),
      metadata: {
        version: release.tagName,
        isLatest: release.isLatest,
        isPrerelease: release.isPrerelease,
        featureCount: features.length
      }
    };
  });
}

/**
 * Calculate relevance score based on release content
 */
function calculateRelevance(release: GitHubRelease): {
  score: "high" | "medium" | "low";
  reasoning: string;
} {
  const content = (release.name + " " + release.body).toLowerCase();

  // HIGH priority keywords - directly applicable to PAI
  const highKeywords = [
    "skill", "skills", "agent", "agents", "hook", "hooks",
    "mcp", "model context protocol", "tool", "prompt",
    "constitution", "memory", "protocol"
  ];

  for (const keyword of highKeywords) {
    if (content.includes(keyword)) {
      return {
        score: "high",
        reasoning: `Contains PAI-critical feature: "${keyword}"`
      };
    }
  }

  // MEDIUM priority - useful improvements
  const mediumKeywords = [
    "fix", "improve", "add", "feature", "command",
    "performance", "bug", "update", "support"
  ];

  for (const keyword of mediumKeywords) {
    if (content.includes(keyword)) {
      return {
        score: "medium",
        reasoning: `Contains improvement: "${keyword}"`
      };
    }
  }

  // Latest release is always at least medium priority
  if (release.isLatest) {
    return {
      score: "medium",
      reasoning: "Latest Claude Code release"
    };
  }

  return {
    score: "low",
    reasoning: "Minor update or patch"
  };
}

/**
 * Categorize release by type
 */
function categorizeRelease(release: GitHubRelease): Finding["category"] {
  const content = (release.name + " " + release.body).toLowerCase();

  if (content.includes("skill") || content.includes("agent")) return "skills";
  if (content.includes("prompt") || content.includes("constitution")) return "prompting";
  if (content.includes("tool") || content.includes("mcp") || content.includes("api")) return "tools";
  if (content.includes("architecture") || content.includes("system")) return "architecture";
  if (content.includes("security") || content.includes("safety")) return "security";

  return "general";
}

/**
 * Extract features from release notes
 */
function extractFeatures(body: string): string[] {
  const features: string[] = [];

  // Match lines starting with "- Added", "- Fixed", "- Improved"
  const lines = body.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- Added")) {
      features.push(trimmed.substring(8)); // Remove "- Added "
    } else if (trimmed.startsWith("- Fixed")) {
      features.push(trimmed.substring(8)); // Remove "- Fixed "
    } else if (trimmed.startsWith("- Improved")) {
      features.push(trimmed.substring(11)); // Remove "- Improved "
    }
  }

  return features;
}

/**
 * Extract keywords from release body
 */
function extractKeywords(body: string): string[] {
  const keywords: string[] = [];
  const content = body.toLowerCase();

  const relevantKeywords = [
    "skill", "skills", "agent", "agents", "hook", "hooks",
    "mcp", "tool", "tools", "prompt", "prompting",
    "lsp", "language server", "cli", "command",
    "terminal", "theme", "syntax", "highlighting"
  ];

  for (const keyword of relevantKeywords) {
    if (content.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Generate summary from release body
 */
function generateSummary(body: string, features: string[]): string {
  if (features.length === 0) {
    return "Release with bug fixes and improvements";
  }

  const topFeatures = features.slice(0, 2);
  if (topFeatures.length === 1) {
    return `Release with: ${topFeatures[0]}`;
  }

  return `Release with ${features.length} changes including: ${topFeatures[0]}`;
}

/**
 * Generate action items based on release
 */
function generateActionItems(
  release: GitHubRelease,
  relevance: { score: string },
  category: string,
  features: string[]
): string[] {
  const items: string[] = [];

  // Only generate action items for high relevance
  if (relevance.score !== "high") {
    return [];
  }

  // Always check if update needed
  items.push(`Check if PAI is using Claude Code ${release.tagName}`);

  // Category-specific actions
  switch (category) {
    case "skills":
      items.push("Review new skill features for PAI applicability");
      items.push("Check if existing PAI skills need updates");
      break;

    case "tools":
      items.push("Evaluate new tool capabilities");
      items.push("Check if PAI workflows can be enhanced");
      break;

    case "prompting":
      items.push("Review prompt improvements for PAI skills");
      items.push("Update constitution if relevant");
      break;

    case "architecture":
      items.push("Assess architectural changes impact on PAI");
      items.push("Update PAI structure if needed");
      break;
  }

  // Feature-specific actions
  for (const feature of features.slice(0, 3)) {
    const featureLower = feature.toLowerCase();
    if (featureLower.includes("lsp")) {
      items.push("Explore LSP integration for PAI development");
    }
    if (featureLower.includes("hook")) {
      items.push("Review hook changes for PAI hooks");
    }
    if (featureLower.includes("mcp")) {
      items.push("Check MCP server compatibility");
    }
  }

  return items;
}

/**
 * Generate unique ID for finding
 */
function generateFindingId(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").substring(0, 16);
}

// Export all functions as GitHubReleasesScraper namespace
export const GitHubReleasesScraper = {
  scrape: scrapeGitHubReleases,
  processReleases: processGitHubReleases,
  calculateRelevance,
  categorizeRelease,
  extractFeatures,
  extractKeywords,
  generateSummary,
  generateActionItems,
  generateFindingId
};
