/**
 * Anthropic Documentation Scraper
 *
 * Monitors Anthropic documentation for updates using direct HTTP fetching
 * and text parsing of the release notes page.
 */

import { Finding } from "../types.ts";
import crypto from "crypto";

export interface DocUpdate {
  date: string;
  content: string;
  url: string;
}

export interface ScrapeOptions {
  maxUpdates?: number;
  since?: string;
}

/**
 * Scrape Anthropic documentation for release notes
 */
export async function scrapeAnthropicDocs(
  sourceId: string,
  options: ScrapeOptions = {}
): Promise<Finding[]> {
  const { maxUpdates = 20, since } = options;

  try {
    // Fetch the page
    const response = await fetch("https://platform.claude.com/docs/en/release-notes/api");
    const html = await response.text();

    // Extract text content from HTML
    const updates = extractUpdatesFromHTML(html, maxUpdates, since);

    // Convert to Finding objects
    return processDocUpdates(updates, sourceId);

  } catch (error) {
    console.error(`Error scraping Anthropic docs: ${error}`);
    return [];
  }
}

/**
 * Extract release note updates from HTML
 */
function extractUpdatesFromHTML(html: string, maxUpdates: number, since?: string): DocUpdate[] {
  const updates: DocUpdate[] = [];
  const sinceDate = since ? new Date(since) : new Date(0);

  // Remove script/style tags
  const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                       .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Look for date patterns in the HTML (dates appear as headers)
  const datePattern = /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,\s+\d{4}/g;
  const dates = cleanHtml.match(datePattern) || [];

  // For each date, try to extract the content that follows
  for (let i = 0; i < Math.min(dates.length, maxUpdates); i++) {
    const dateStr = dates[i];
    // Remove ordinal suffixes (st, nd, rd, th) for proper date parsing
    const cleanDateStr = dateStr.replace(/(d+)(st|nd|rd|th)/, '$1');
    const updateDate = new Date(cleanDateStr);

    if (isNaN(updateDate.getTime()) || updateDate < sinceDate) continue;
    if (updateDate < sinceDate) continue;

    // Find content between this date and the next date
    const startIndex = cleanHtml.indexOf(dateStr);
    const nextDateIndex = i < dates.length - 1 ? cleanHtml.indexOf(dates[i + 1], startIndex + dateStr.length) : cleanHtml.length;

    if (startIndex !== -1) {
      const contentChunk = cleanHtml.substring(startIndex + dateStr.length, nextDateIndex);

      // Extract text content, removing HTML tags
      const textContent = contentChunk
        .replace(/<[^>]+>/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();

      if (textContent.length > 10) {  // Ignore empty or near-empty content
        updates.push({
          date: updateDate.toISOString(),
          content: textContent.substring(0, 1000),  // Limit content length
          url: `https://platform.claude.com/docs/en/release-notes/api#${encodeURIComponent(dateStr.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`
        });
      }
    }
  }

  return updates;
}

/**
 * Convert doc updates to Finding objects
 */
function processDocUpdates(
  updates: DocUpdate[],
  sourceId: string
): Finding[] {
  return updates.map(update => {
    const relevance = calculateRelevance(update);
    const category = categorizeUpdate(update);
    const keywords = extractKeywords(update);
    const title = generateTitle(update);
    const summary = generateSummary(update);

    return {
      id: generateFindingId(update.url + update.date),
      source: sourceId,
      type: "article" as const,
      date: update.date,
      url: update.url,
      title,
      summary,
      relevance: relevance.score,
      category,
      keywords,
      action_items: generateActionItems(update, relevance, category),
      metadata: {
        updateDate: update.date,
        contentLength: update.content.length,
        hasCodeExamples: update.content.includes("code"),
        hasLinks: update.content.includes("http")
      }
    };
  });
}

/**
 * Calculate relevance score
 */
function calculateRelevance(update: DocUpdate): {
  score: "high" | "medium" | "low";
  reasoning: string;
} {
  const content = update.content.toLowerCase();

  const highKeywords = [
    "claude opus 4", "claude sonnet 4", "claude haiku 4",
    "agent skills", "mcp connector", "tool use", "computer use",
    "extended thinking", "code execution", "files api",
    "prompt caching", "context editing", "structured outputs",
    "breaking change", "deprecation", "retired",
    "memory tool", "web search", "web fetch"
  ];

  for (const keyword of highKeywords) {
    if (content.includes(keyword)) {
      return {
        score: "high",
        reasoning: `Contains critical feature: "${keyword}"`
      };
    }
  }

  const mediumKeywords = [
    "launched", "released", "available", "support for",
    "improved", "enhanced", "optimized", "increased",
    "sdk", "api", "documentation", "rate limit"
  ];

  for (const keyword of mediumKeywords) {
    if (content.includes(keyword)) {
      return {
        score: "medium",
        reasoning: `Contains feature update: "${keyword}"`
      };
    }
  }

  if (content.match(/claude.*\d+\.\d+/i)) {
    return {
      score: "medium",
      reasoning: "Model version update"
    };
  }

  return {
    score: "low",
    reasoning: "Minor documentation update"
  };
}

/**
 * Categorize update
 */
function categorizeUpdate(update: DocUpdate): Finding["category"] {
  const content = update.content.toLowerCase();

  if (content.includes("tool") || content.includes("agent") || content.includes("mcp")) return "tools";
  if (content.includes("prompt") || content.includes("thinking") || content.includes("context")) return "prompting";
  if (content.includes("security") || content.includes("safety") || content.includes("auth")) return "security";
  if (content.includes("skill") || content.includes("capability")) return "skills";
  if (content.includes("architecture") || content.includes("api")) return "architecture";

  return "general" as const;
}

/**
 * Extract keywords
 */
function extractKeywords(update: DocUpdate): string[] {
  const keywords: string[] = [];
  const content = update.content.toLowerCase();

  const relevantKeywords = [
    "claude opus", "claude sonnet", "claude haiku", "model",
    "agent", "tool use", "mcp", "computer use", "agent skills",
    "extended thinking", "code execution", "files api", "memory",
    "web search", "web fetch", "citations", "search results",
    "prompt caching", "context editing", "structured outputs",
    "api", "sdk", "rate limit", "batch", "streaming",
    "typescript", "python", "documentation"
  ];

  for (const keyword of relevantKeywords) {
    if (content.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  return [...new Set(keywords)];
}

/**
 * Generate title
 */
function generateTitle(update: DocUpdate): string {
  const firstLine = update.content.split("\n")[0].trim();
  const cleaned = firstLine.replace(/^[-*]\s+/, "");

  if (cleaned.length <= 80) {
    return cleaned;
  }

  return cleaned.substring(0, 77) + "...";
}

/**
 * Generate summary
 */
function generateSummary(update: DocUpdate): string {
  const lines = update.content.split("\n").filter(l => l.trim());
  const summary = lines.slice(0, 3).join(" ");

  if (summary.length <= 200) {
    return summary.replace(/^[-*]\s+/gm, "");
  }

  return summary.substring(0, 197).replace(/^[-*]\s+/gm, "") + "...";
}

/**
 * Generate action items
 */
function generateActionItems(
  update: DocUpdate,
  relevance: { score: string },
  category: string
): string[] {
  const items: string[] = [];
  const content = update.content.toLowerCase();

  if (relevance.score !== "high") {
    return [];
  }

  items.push("Review documentation update for applicability");

  switch (category) {
    case "tools":
      items.push("Evaluate new tool capabilities for PAI integration");
      if (content.includes("mcp")) {
        items.push("Assess MCP compatibility with current setup");
      }
      break;

    case "prompting":
      items.push("Test new prompting features");
      if (content.includes("prompt caching")) {
        items.push("Evaluate prompt caching benefits for PAI");
      }
      break;

    case "skills":
      items.push("Compare new agent skills with PAI capabilities");
      break;

    case "architecture":
      items.push("Review API changes for breaking changes");
      break;
  }

  if (content.includes("claude opus 4") || content.includes("claude sonnet 4") || content.includes("claude haiku 4")) {
    items.push("Test new model capabilities");
    items.push("Benchmark performance against current models");
  }

  if (content.includes("deprecation") || content.includes("retired")) {
    items.push("URGENT: Check for deprecated features in use");
    items.push("Plan migration to supported alternatives");
  }

  if (content.includes("breaking")) {
    items.push("CRITICAL: Review code for breaking changes");
  }

  return items;
}

/**
 * Generate unique ID
 */
function generateFindingId(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex").substring(0, 16);
}

export const AnthropicDocsScraper = {
  scrape: scrapeAnthropicDocs,
  processUpdates: processDocUpdates,
  calculateRelevance,
  categorizeUpdate,
  extractKeywords,
  generateTitle,
  generateSummary,
  generateActionItems,
  generateFindingId
};
