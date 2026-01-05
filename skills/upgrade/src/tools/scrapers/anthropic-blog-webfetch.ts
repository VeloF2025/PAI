#!/usr/bin/env bun
/**
 * Anthropic Blog Scraper - WebFetch Implementation
 *
 * Uses Claude Code's WebFetch tool to scrape Anthropic blog.
 * This approach uses Claude to extract structured data from web pages.
 */

interface Finding {
  id: string;
  source: string;
  type: "article";
  date: string;
  url: string;
  title: string;
  summary: string;
  relevance: "high" | "medium" | "low";
  category: "prompting" | "skills" | "architecture" | "tools" | "security" | "general";
  keywords: string[];
  code_examples?: { language: string; code: string }[];
  action_items?: string[];
}

/**
 * Scrape Anthropic blog using WebFetch
 *
 * Note: This is a TypeScript implementation that would call Claude Code's WebFetch tool.
 * Since we can't directly call MCP tools from TypeScript, this serves as:
 * 1. Documentation of the scraping logic
 * 2. Structure for the findings
 * 3. Helper functions for processing results
 *
 * Actual usage: Call from upgrade-cli.ts using child_process to invoke Claude Code
 */

export interface ScrapeOptions {
  maxArticles?: number;
  since?: string; // ISO date string
  keywords?: string[];
}

export interface ScrapeResult {
  findings: Finding[];
  scanned_at: string;
  total_found: number;
  source_id: string;
}

/**
 * Generate WebFetch prompt for Claude to extract blog articles
 */
export function generateWebFetchPrompt(options: ScrapeOptions = {}): string {
  const { maxArticles = 10, since, keywords } = options;

  let prompt = `Extract the latest blog articles from this Anthropic news page.

For each article, provide:
- title: Article title
- url: Full article URL
- date: Publication date (ISO format if possible)
- summary: Brief 1-2 sentence summary
- keywords: Array of relevant keywords (e.g., "Claude Code", "prompting", "agents", "MCP", "skills")

Return as JSON array with up to ${maxArticles} articles.`;

  if (since) {
    prompt += `\n\nOnly include articles published on or after ${since}.`;
  }

  if (keywords && keywords.length > 0) {
    prompt += `\n\nPrioritize articles containing these keywords: ${keywords.join(", ")}`;
  }

  prompt += `\n\nFormat:
[
  {
    "title": "Article Title",
    "url": "https://...",
    "date": "2025-01-01",
    "summary": "Brief summary...",
    "keywords": ["keyword1", "keyword2"]
  }
]`;

  return prompt;
}

/**
 * Process raw WebFetch results into Finding objects
 */
export function processWebFetchResults(
  rawArticles: any[],
  sourceId: string = "anthropic-blog"
): Finding[] {
  return rawArticles.map(article => {
    const relevance = calculateRelevance(article);
    const category = categorizeArticle(article);

    return {
      id: generateFindingId(article.url),
      source: sourceId,
      type: "article",
      date: article.date || new Date().toISOString(),
      url: article.url,
      title: article.title,
      summary: article.summary || "",
      relevance: relevance.score,
      category,
      keywords: article.keywords || [],
      action_items: generateActionItems(article, relevance, category)
    };
  });
}

/**
 * Calculate relevance score
 */
function calculateRelevance(article: any): {
  score: "high" | "medium" | "low";
  reasoning: string;
} {
  const content = (article.title + " " + article.summary).toLowerCase();

  // High relevance - directly applicable to PAI
  const highKeywords = [
    "claude code",
    "skills",
    "agents",
    "mcp",
    "model context protocol",
    "tool use",
    "prompt engineering",
    "use when"
  ];

  for (const keyword of highKeywords) {
    if (content.includes(keyword)) {
      return {
        score: "high",
        reasoning: `Directly applicable to PAI - contains "${keyword}"`
      };
    }
  }

  // Medium relevance - potentially useful
  const mediumKeywords = [
    "claude",
    "prompting",
    "api",
    "integration",
    "development",
    "features",
    "best practices"
  ];

  for (const keyword of mediumKeywords) {
    if (content.includes(keyword)) {
      return {
        score: "medium",
        reasoning: `Potentially useful - contains "${keyword}"`
      };
    }
  }

  return {
    score: "low",
    reasoning: "No PAI-specific keywords found"
  };
}

/**
 * Categorize article by topic
 */
function categorizeArticle(article: any): Finding["category"] {
  const content = (article.title + " " + article.summary).toLowerCase();

  if (content.includes("prompt") || content.includes("prompting")) {
    return "prompting";
  }
  if (content.includes("skill") || content.includes("agent")) {
    return "skills";
  }
  if (content.includes("architecture") || content.includes("system") || content.includes("pattern")) {
    return "architecture";
  }
  if (content.includes("tool") || content.includes("api") || content.includes("mcp")) {
    return "tools";
  }
  if (content.includes("security") || content.includes("safety")) {
    return "security";
  }

  return "general";
}

/**
 * Generate action items based on article content
 */
function generateActionItems(
  article: any,
  relevance: { score: string },
  category: string
): string[] {
  const items: string[] = [];

  // Only generate action items for high relevance articles
  if (relevance.score !== "high") {
    return [];
  }

  switch (category) {
    case "prompting":
      items.push("Review prompting technique for PAI applicability");
      items.push("Compare against current prompting patterns");
      break;
    case "skills":
      items.push("Evaluate new skill pattern");
      items.push("Check if applicable to existing skills");
      break;
    case "architecture":
      items.push("Review architectural pattern");
      items.push("Compare against PAI constitution");
      break;
    case "tools":
      items.push("Evaluate new tool/API feature");
      items.push("Check for integration opportunities");
      break;
    case "security":
      items.push("Review security recommendation");
      items.push("Audit current PAI security practices");
      break;
  }

  return items;
}

/**
 * Generate unique finding ID from URL
 */
function generateFindingId(url: string): string {
  const hash = require("crypto").createHash("sha256");
  hash.update(url);
  return hash.digest("hex").substring(0, 16);
}

/**
 * CLI Usage Instructions
 *
 * To use this scraper with Claude Code WebFetch:
 *
 * 1. From upgrade-cli.ts, call Claude Code CLI with WebFetch:
 *
 * ```typescript
 * import { exec } from "child_process";
 * import { promisify } from "util";
 *
 * const execAsync = promisify(exec);
 *
 * const prompt = generateWebFetchPrompt({ maxArticles: 10 });
 *
 * const { stdout } = await execAsync(
 *   `claude-code webfetch "https://www.anthropic.com/news" "${prompt}"`
 * );
 *
 * const articles = JSON.parse(stdout);
 * const findings = processWebFetchResults(articles, "anthropic-blog");
 * ```
 *
 * 2. Or, use this as a library and have the main CLI handle WebFetch calls
 */

// Export helper for integration with upgrade-cli.ts
export const AnthropicBlogScraper = {
  generatePrompt: generateWebFetchPrompt,
  processResults: processWebFetchResults,
  calculateRelevance,
  categorizeArticle
};

// CLI test mode
if (import.meta.main) {
  console.log("📝 Anthropic Blog Scraper - WebFetch Implementation\n");
  console.log("Usage from TypeScript:");
  console.log("  import { AnthropicBlogScraper } from './anthropic-blog-webfetch.ts';");
  console.log("  const prompt = AnthropicBlogScraper.generatePrompt({ maxArticles: 10 });");
  console.log("  // Use prompt with WebFetch MCP tool");
  console.log("\nGenerated WebFetch prompt:");
  console.log("─".repeat(60));
  console.log(generateWebFetchPrompt({ maxArticles: 10 }));
  console.log("─".repeat(60));
}
