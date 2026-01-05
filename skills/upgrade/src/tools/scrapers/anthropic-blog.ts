#!/usr/bin/env bun
/**
 * Anthropic Blog Scraper
 *
 * Scrapes https://www.anthropic.com/news for articles related to Claude Code,
 * prompting techniques, AI agents, and other PAI-relevant content.
 */

import { WebSearch } from "@anthropic-ai/sdk";

interface BlogArticle {
  title: string;
  url: string;
  date: string;
  summary: string;
  content?: string;
  tags?: string[];
}

interface ScraperResult {
  articles: BlogArticle[];
  scanned_at: string;
  total_found: number;
}

export async function scrapeAnthropicBlog(
  maxArticles: number = 10
): Promise<ScraperResult> {
  console.log("🔍 Scraping Anthropic blog...");

  try {
    // Use WebFetch to get the blog page
    const blogUrl = "https://www.anthropic.com/news";

    // Since we don't have direct WebFetch access in this context,
    // we'll use a different approach: WebSearch to find recent Anthropic articles

    const articles: BlogArticle[] = [];

    // Search for recent Anthropic blog posts
    const searchQueries = [
      "site:anthropic.com/news Claude Code",
      "site:anthropic.com/news prompting",
      "site:anthropic.com/news AI agents",
      "site:anthropic.com/news skills",
      "site:anthropic.com/news MCP"
    ];

    // For now, we'll create a simpler implementation that uses Bun's fetch
    const response = await fetch(blogUrl);
    const html = await response.text();

    // Parse HTML to extract article information
    // This is a simplified parser - in production, use a proper HTML parser like cheerio
    const articleMatches = extractArticles(html);

    for (const match of articleMatches.slice(0, maxArticles)) {
      articles.push({
        title: match.title,
        url: match.url,
        date: match.date || new Date().toISOString(),
        summary: match.summary || "",
        tags: match.tags || []
      });
    }

    return {
      articles,
      scanned_at: new Date().toISOString(),
      total_found: articles.length
    };

  } catch (error) {
    console.error("❌ Error scraping Anthropic blog:", error);
    throw error;
  }
}

/**
 * Extract articles from HTML
 * This is a simple regex-based parser - replace with proper HTML parser for production
 */
function extractArticles(html: string): BlogArticle[] {
  const articles: BlogArticle[] = [];

  // Look for article patterns in the HTML
  // Note: This is a placeholder - actual implementation should use proper HTML parsing

  // For now, return empty array - actual scraping logic would go here
  // In production, use:
  // - cheerio or jsdom for HTML parsing
  // - Proper CSS selectors to find article elements
  // - Extract title, URL, date, summary from each article

  return articles;
}

/**
 * Determine relevance of an article to PAI
 */
export function calculateRelevance(article: BlogArticle): {
  score: "high" | "medium" | "low";
  reasoning: string;
} {
  const title = article.title.toLowerCase();
  const summary = (article.summary || "").toLowerCase();
  const content = title + " " + summary;

  // High relevance keywords
  const highKeywords = [
    "claude code",
    "skills",
    "agents",
    "mcp",
    "tool use",
    "prompting",
    "prompt engineering"
  ];

  // Medium relevance keywords
  const mediumKeywords = [
    "claude",
    "api",
    "integration",
    "development",
    "features"
  ];

  // Check for high relevance
  for (const keyword of highKeywords) {
    if (content.includes(keyword)) {
      return {
        score: "high",
        reasoning: `Contains high-priority keyword: "${keyword}"`
      };
    }
  }

  // Check for medium relevance
  for (const keyword of mediumKeywords) {
    if (content.includes(keyword)) {
      return {
        score: "medium",
        reasoning: `Contains medium-priority keyword: "${keyword}"`
      };
    }
  }

  return {
    score: "low",
    reasoning: "No PAI-specific keywords found"
  };
}

/**
 * Categorize an article
 */
export function categorizeArticle(article: BlogArticle): string {
  const content = (article.title + " " + article.summary).toLowerCase();

  if (content.includes("prompt") || content.includes("prompting")) {
    return "prompting";
  }
  if (content.includes("skill") || content.includes("agent")) {
    return "skills";
  }
  if (content.includes("architecture") || content.includes("system")) {
    return "architecture";
  }
  if (content.includes("tool") || content.includes("api")) {
    return "tools";
  }
  if (content.includes("security") || content.includes("safety")) {
    return "security";
  }

  return "general";
}

// CLI usage
if (import.meta.main) {
  const maxArticles = parseInt(process.argv[2] || "10");

  scrapeAnthropicBlog(maxArticles)
    .then(result => {
      console.log(`\n✅ Found ${result.total_found} articles\n`);

      for (const article of result.articles) {
        const relevance = calculateRelevance(article);
        const category = categorizeArticle(article);

        console.log(`📄 ${article.title}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Date: ${article.date}`);
        console.log(`   Relevance: ${relevance.score} (${relevance.reasoning})`);
        console.log(`   Category: ${category}`);
        console.log();
      }
    })
    .catch(error => {
      console.error("Failed to scrape:", error);
      process.exit(1);
    });
}
