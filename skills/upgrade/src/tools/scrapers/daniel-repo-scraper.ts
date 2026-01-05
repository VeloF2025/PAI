/**
 * Daniel's PAI Repository Scraper
 *
 * Monitors commits and changes to Daniel Miessler's Personal_AI_Infrastructure repository.
 * Focuses on features, improvements, and patterns that could enhance our PAI implementation.
 *
 * Usage:
 *   import { DanielRepoScraper } from "./scrapers/daniel-repo-scraper.ts";
 *   const findings = await DanielRepoScraper.scrape(repo, sourceId);
 */

import { Finding } from "../types.ts";
import crypto from "crypto";

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
  }>;
}

export interface ScrapeOptions {
  maxCommits?: number;
  since?: string; // ISO date string
  includeFiles?: boolean;
}

/**
 * Scrape Daniel's PAI repository for recent commits using gh CLI
 *
 * @param repo - Repository in format "owner/repo"
 * @param sourceId - Source identifier
 * @param options - Scraping options
 * @returns Array of Finding objects
 */
export async function scrapeDanielRepo(
  repo: string,
  sourceId: string,
  options: ScrapeOptions = {}
): Promise<Finding[]> {
  const { maxCommits = 20, since, includeFiles = true } = options;

  try {
    // Build gh API command
    let apiPath = `repos/${repo}/commits?per_page=${maxCommits}`;
    if (since) {
      apiPath += `&since=${since}`;
    }

    // Fetch commits using gh CLI
    const commitsJson = await Bun.$`bash -c "gh api ${apiPath}"`.text();
    const commits: GitHubCommit[] = JSON.parse(commitsJson);

    // Optionally fetch file details for each commit
    if (includeFiles) {
      for (let i = 0; i < commits.length; i++) {
        const sha = commits[i].sha;
        try {
          const commitDetailJson = await Bun.$`bash -c "gh api repos/${repo}/commits/${sha}"`.text();
          const commitDetail = JSON.parse(commitDetailJson);
          commits[i].files = commitDetail.files || [];
        } catch (error) {
          // If file fetch fails, continue without files
          commits[i].files = [];
        }
      }
    }

    // Convert to Finding objects
    return processGitHubCommits(commits, sourceId, repo);

  } catch (error) {
    console.error(`Error scraping Daniel's repo: ${error}`);
    return [];
  }
}

/**
 * Convert GitHub commits to Finding objects
 */
export function processGitHubCommits(
  commits: GitHubCommit[],
  sourceId: string,
  repo: string
): Finding[] {
  return commits.map(commit => {
    const message = commit.commit.message;
    const firstLine = message.split("\n")[0];

    const relevance = calculateRelevance(commit);
    const category = categorizeCommit(commit);
    const keywords = extractKeywords(commit);
    const filesChanged = commit.files?.map(f => f.filename) || [];

    return {
      id: generateFindingId(commit.html_url),
      source: sourceId,
      type: "commit" as const,
      date: commit.commit.committer.date,
      url: commit.html_url,
      title: `${firstLine.substring(0, 80)}${firstLine.length > 80 ? "..." : ""}`,
      summary: generateSummary(commit),
      relevance: relevance.score,
      category,
      keywords,
      action_items: generateActionItems(commit, relevance, category, filesChanged),
      metadata: {
        sha: commit.sha.substring(0, 7),
        author: commit.commit.author.name,
        filesChanged: filesChanged.length,
        additions: commit.files?.reduce((sum, f) => sum + f.additions, 0) || 0,
        deletions: commit.files?.reduce((sum, f) => sum + f.deletions, 0) || 0,
        affectedFiles: filesChanged.slice(0, 5) // Top 5 files
      }
    };
  });
}

/**
 * Calculate relevance score based on commit content
 */
function calculateRelevance(commit: GitHubCommit): {
  score: "high" | "medium" | "low";
  reasoning: string;
} {
  const message = commit.commit.message.toLowerCase();
  const files = commit.files?.map(f => f.filename.toLowerCase()) || [];

  // HIGH priority keywords - directly applicable to PAI architecture
  const highKeywords = [
    "skill", "skills", "agent", "agents", "hook", "hooks",
    "mcp", "model context protocol", "constitution",
    "memory", "protocol", "architecture", "workflow",
    "progressive disclosure", "context engineering"
  ];

  for (const keyword of highKeywords) {
    if (message.includes(keyword)) {
      return {
        score: "high",
        reasoning: `Contains PAI-critical concept: "${keyword}"`
      };
    }
  }

  // Check if files match PAI structure
  const paiStructureFiles = [
    "skills/", "hooks/", "protocols/", "constitution/",
    "memory/", ".claude/", "workflows/"
  ];

  for (const pattern of paiStructureFiles) {
    if (files.some(f => f.includes(pattern))) {
      return {
        score: "high",
        reasoning: `Modifies PAI structure: ${pattern}`
      };
    }
  }

  // MEDIUM priority - useful improvements
  const mediumKeywords = [
    "feat", "feature", "fix", "improve", "add", "update",
    "enhance", "optimize", "refactor", "document"
  ];

  for (const keyword of mediumKeywords) {
    if (message.includes(keyword)) {
      return {
        score: "medium",
        reasoning: `Contains improvement: "${keyword}"`
      };
    }
  }

  // Check for documentation or README changes
  if (files.some(f => f.includes("readme") || f.includes("doc"))) {
    return {
      score: "medium",
      reasoning: "Documentation update"
    };
  }

  return {
    score: "low",
    reasoning: "Minor change or chore"
  };
}

/**
 * Categorize commit by type
 */
function categorizeCommit(commit: GitHubCommit): Finding["category"] {
  const message = commit.commit.message.toLowerCase();
  const files = commit.files?.map(f => f.filename.toLowerCase()) || [];

  if (message.includes("skill") || files.some(f => f.includes("skills/"))) return "skills";
  if (message.includes("prompt") || message.includes("constitution")) return "prompting";
  if (message.includes("tool") || message.includes("mcp")) return "tools";
  if (message.includes("architecture") || message.includes("structure")) return "architecture";
  if (message.includes("security") || message.includes("safety")) return "security";

  return "general";
}

/**
 * Extract keywords from commit
 */
function extractKeywords(commit: GitHubCommit): string[] {
  const keywords: string[] = [];
  const message = commit.commit.message.toLowerCase();
  const files = commit.files?.map(f => f.filename) || [];

  const relevantKeywords = [
    "skill", "skills", "agent", "agents", "hook", "hooks",
    "mcp", "tool", "tools", "prompt", "prompting",
    "constitution", "memory", "protocol", "architecture",
    "workflow", "progressive disclosure", "context engineering",
    "cli", "command", "automation"
  ];

  for (const keyword of relevantKeywords) {
    if (message.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  // Add file type keywords
  if (files.some(f => f.endsWith(".ts"))) keywords.push("typescript");
  if (files.some(f => f.endsWith(".py"))) keywords.push("python");
  if (files.some(f => f.endsWith(".md"))) keywords.push("documentation");
  if (files.some(f => f.includes("test"))) keywords.push("testing");

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Generate summary from commit message
 */
function generateSummary(commit: GitHubCommit): string {
  const lines = commit.commit.message.split("\n");
  const firstLine = lines[0];

  // If there's a detailed description, include first line of it
  if (lines.length > 2 && lines[2].trim()) {
    const description = lines[2].trim();
    return `${firstLine} - ${description.substring(0, 100)}${description.length > 100 ? "..." : ""}`;
  }

  return firstLine;
}

/**
 * Generate action items based on commit
 */
function generateActionItems(
  commit: GitHubCommit,
  relevance: { score: string },
  category: string,
  filesChanged: string[]
): string[] {
  const items: string[] = [];

  // Only generate action items for high relevance
  if (relevance.score !== "high") {
    return [];
  }

  const message = commit.commit.message.toLowerCase();

  // Always check commit details
  items.push(`Review commit ${commit.sha.substring(0, 7)} for PAI applicability`);

  // Category-specific actions
  switch (category) {
    case "skills":
      items.push("Evaluate new skill pattern for PAI skills");
      if (filesChanged.some(f => f.includes("skills/"))) {
        items.push("Compare skill structure with PAI skills");
      }
      break;

    case "tools":
      items.push("Assess new tool capabilities for PAI");
      break;

    case "prompting":
      items.push("Review prompting technique improvements");
      if (message.includes("constitution")) {
        items.push("Check if PAI constitution needs updates");
      }
      break;

    case "architecture":
      items.push("Analyze architectural pattern for PAI structure");
      break;
  }

  // File-specific actions
  if (filesChanged.some(f => f.includes("hook"))) {
    items.push("Compare hook implementation with PAI hooks");
  }
  if (filesChanged.some(f => f.includes("protocol"))) {
    items.push("Review protocol pattern for PAI protocols");
  }
  if (filesChanged.some(f => f.includes("memory"))) {
    items.push("Evaluate memory system improvements");
  }

  // Commit message keywords
  if (message.includes("progressive disclosure")) {
    items.push("Study progressive disclosure implementation");
  }
  if (message.includes("context engineering")) {
    items.push("Review context engineering approach");
  }

  return items;
}

/**
 * Generate unique ID for finding
 */
function generateFindingId(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").substring(0, 16);
}

// Export all functions as DanielRepoScraper namespace
export const DanielRepoScraper = {
  scrape: scrapeDanielRepo,
  processCommits: processGitHubCommits,
  calculateRelevance,
  categorizeCommit,
  extractKeywords,
  generateSummary,
  generateActionItems,
  generateFindingId
};
