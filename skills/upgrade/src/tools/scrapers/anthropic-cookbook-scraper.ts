/**
 * Anthropic Cookbook Repository Scraper
 *
 * Monitors commits and changes to the Anthropic Cookbook repository.
 * Focuses on new examples, techniques, and patterns for Claude API usage.
 *
 * Repository: https://github.com/anthropics/anthropic-cookbook
 *
 * Usage:
 *   import { AnthropicCookbookScraper } from "./scrapers/anthropic-cookbook-scraper.ts";
 *   const findings = await AnthropicCookbookScraper.scrape(repo, sourceId);
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
 * Scrape Anthropic Cookbook repository for recent commits using gh CLI
 *
 * @param repo - Repository in format "owner/repo"
 * @param sourceId - Source identifier
 * @param options - Scraping options
 * @returns Array of Finding objects
 */
export async function scrapeAnthropicCookbook(
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
    console.error(`Error scraping Anthropic Cookbook: ${error}`);
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

  // HIGH priority keywords - directly applicable to PAI
  const highKeywords = [
    "agent", "agents", "agentic",
    "tool use", "tool calling", "function calling",
    "mcp", "model context protocol",
    "prompt engineering", "prompt caching",
    "skills", "workflow", "automation",
    "claude code", "computer use", "extended thinking"
  ];

  for (const keyword of highKeywords) {
    if (message.includes(keyword)) {
      return {
        score: "high",
        reasoning: `Contains PAI-relevant concept: "${keyword}"`
      };
    }
  }

  // Check for important cookbook topics
  const cookbookTopics = [
    "tool_use", "multimodal", "capabilities",
    "retrieval", "rag", "embeddings",
    "classification", "summarization"
  ];

  for (const topic of cookbookTopics) {
    if (files.some(f => f.includes(topic))) {
      return {
        score: "high",
        reasoning: `New/updated cookbook example: ${topic}`
      };
    }
  }

  // MEDIUM priority - useful examples
  const mediumKeywords = [
    "example", "notebook", "ipynb", "tutorial",
    "integration", "third-party", "api",
    "vision", "image", "pdf", "document"
  ];

  for (const keyword of mediumKeywords) {
    if (message.includes(keyword) || files.some(f => f.includes(keyword))) {
      return {
        score: "medium",
        reasoning: `Contains useful example: "${keyword}"`
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

  if (message.includes("tool") || files.some(f => f.includes("tool_use"))) return "tools";
  if (message.includes("prompt") || message.includes("prompt engineering")) return "prompting";
  if (message.includes("agent") || message.includes("workflow")) return "architecture";
  if (message.includes("skill") || message.includes("capability")) return "skills";
  if (message.includes("security") || message.includes("safety")) return "security";

  // Check file patterns
  if (files.some(f => f.includes("capabilities/"))) return "skills";
  if (files.some(f => f.includes("multimodal/"))) return "tools";
  if (files.some(f => f.includes("third_party/"))) return "tools";

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
    "agent", "agents", "tool use", "function calling",
    "mcp", "prompt engineering", "prompt caching",
    "rag", "retrieval", "embeddings", "vision",
    "classification", "summarization", "multimodal",
    "automation", "workflow", "integration",
    "claude api", "anthropic", "computer use"
  ];

  for (const keyword of relevantKeywords) {
    if (message.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  // Add file/topic keywords
  if (files.some(f => f.includes("tool_use"))) keywords.push("tool use");
  if (files.some(f => f.includes("multimodal"))) keywords.push("multimodal");
  if (files.some(f => f.includes("capabilities"))) keywords.push("capabilities");
  if (files.some(f => f.includes("third_party"))) keywords.push("integrations");
  if (files.some(f => f.endsWith(".ipynb"))) keywords.push("jupyter notebook");
  if (files.some(f => f.endsWith(".py"))) keywords.push("python");
  if (files.some(f => f.endsWith(".md"))) keywords.push("documentation");

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
  items.push(`Review cookbook example ${commit.sha.substring(0, 7)}`);

  // Category-specific actions
  switch (category) {
    case "tools":
      items.push("Evaluate tool use pattern for PAI");
      if (filesChanged.some(f => f.includes("tool_use"))) {
        items.push("Compare with current MCP tool implementations");
      }
      break;

    case "prompting":
      items.push("Review prompt engineering technique");
      if (message.includes("caching")) {
        items.push("Check if prompt caching applicable to PAI");
      }
      break;

    case "architecture":
      items.push("Analyze agent/workflow pattern");
      if (message.includes("agent")) {
        items.push("Compare agent architecture with PAI agents");
      }
      break;

    case "skills":
      items.push("Evaluate new capability pattern");
      break;
  }

  // File-specific actions
  if (filesChanged.some(f => f.includes("multimodal"))) {
    items.push("Review multimodal usage patterns");
  }
  if (filesChanged.some(f => f.includes("retrieval") || f.includes("rag"))) {
    items.push("Assess RAG implementation for PAI applicability");
  }
  if (filesChanged.some(f => f.endsWith(".ipynb"))) {
    items.push("Extract code patterns from Jupyter notebook");
  }

  // Commit message keywords
  if (message.includes("computer use")) {
    items.push("Study computer use implementation");
  }
  if (message.includes("extended thinking")) {
    items.push("Review extended thinking patterns");
  }

  return items;
}

/**
 * Generate unique ID for finding
 */
function generateFindingId(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").substring(0, 16);
}

// Export all functions as AnthropicCookbookScraper namespace
export const AnthropicCookbookScraper = {
  scrape: scrapeAnthropicCookbook,
  processCommits: processGitHubCommits,
  calculateRelevance,
  categorizeCommit,
  extractKeywords,
  generateSummary,
  generateActionItems,
  generateFindingId
};
