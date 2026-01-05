/**
 * Generic RSS/Atom Feed Scraper
 *
 * Monitors blog RSS/Atom feeds for AI-related content.
 * Supports both RSS 2.0 and Atom feed formats.
 *
 * Formats:
 * - RSS 2.0: <rss version="2.0">
 * - Atom: <feed xmlns="http://www.w3.org/2005/Atom">
 */

import type { Finding } from "../types.ts";

// ============================================================================
// Types
// ============================================================================

interface BlogPost {
  postId: string;
  title: string;
  published: string; // ISO date
  author: string;
  link: string;
  description?: string;
  categories?: string[];
}

interface ScrapeOptions {
  maxPosts?: number;
  since?: string; // ISO date string
  keywords?: string[]; // Filter by keywords
}

// ============================================================================
// Main Scraper
// ============================================================================

export const RSSFeedScraper = {
  async scrape(
    sourceId: string,
    feedUrl: string,
    sourceName: string,
    options: ScrapeOptions = {}
  ): Promise<Finding[]> {
    const { maxPosts = 10, since, keywords } = options;

    // Fetch RSS/Atom feed
    const posts = await fetchRSSFeed(feedUrl, maxPosts, since);

    // Filter by keywords if provided
    const filteredPosts = keywords
      ? posts.filter((post) => matchesKeywords(post, keywords))
      : posts;

    // Convert to findings
    return processPosts(sourceId, sourceName, filteredPosts);
  },
};

// ============================================================================
// RSS/Atom Feed Fetcher
// ============================================================================

async function fetchRSSFeed(
  url: string,
  maxPosts: number,
  since?: string
): Promise<BlogPost[]> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();

    // Detect feed format and parse accordingly
    if (xml.includes('xmlns="http://www.w3.org/2005/Atom"')) {
      return parseAtomFeed(xml, maxPosts, since);
    } else if (xml.includes("<rss")) {
      return parseRSSFeed(xml, maxPosts, since);
    } else {
      throw new Error("Unsupported feed format (not RSS or Atom)");
    }
  } catch (error) {
    throw new Error(`Failed to fetch RSS feed: ${error}`);
  }
}

// ============================================================================
// Atom Feed Parser
// ============================================================================

/**
 * Parse Atom feed format (e.g., Simon Willison's blog)
 *
 * Structure:
 * <feed xmlns="http://www.w3.org/2005/Atom">
 *   <entry>
 *     <id>...</id>
 *     <title>Post Title</title>
 *     <link href="https://..." rel="alternate"/>
 *     <published>2025-12-01T10:00:00+00:00</published>
 *     <updated>2025-12-01T10:00:00+00:00</updated>
 *     <author><name>Author Name</name></author>
 *     <summary type="html">...</summary>
 *     <category term="tag1"/>
 *     <category term="tag2"/>
 *   </entry>
 * </feed>
 */
function parseAtomFeed(
  xml: string,
  maxPosts: number,
  since?: string
): BlogPost[] {
  const posts: BlogPost[] = [];
  const sinceDate = since ? new Date(since) : new Date(0);

  // Extract all <entry> blocks
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
  const entries = xml.match(entryPattern) || [];

  for (let i = 0; i < Math.min(entries.length, maxPosts); i++) {
    const entry = entries[i];

    // Extract ID (use as postId)
    const idMatch = entry.match(/<id>([^<]+)<\/id>/);
    if (!idMatch) continue;
    const postId = idMatch[1];

    // Extract title
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1]) : "Untitled";

    // Extract published date
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
    if (!publishedMatch) continue;
    const published = publishedMatch[1];
    const publishedDate = new Date(published);

    // Filter by date
    if (publishedDate < sinceDate) continue;

    // Extract author
    const authorMatch = entry.match(/<author>[\s\S]*?<name>([^<]+)<\/name>/);
    const author = authorMatch ? decodeHtmlEntities(authorMatch[1]) : "Unknown";

    // Extract link
    const linkMatch = entry.match(/<link[^>]+href="([^"]+)"[^>]*rel="alternate"/);
    const link = linkMatch ? linkMatch[1] : "";

    // Extract summary/description
    const summaryMatch = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/);
    const description = summaryMatch
      ? stripHtmlTags(decodeHtmlEntities(summaryMatch[1]))
      : undefined;

    // Extract categories
    const categoryMatches = entry.matchAll(/<category term="([^"]+)"/g);
    const categories = Array.from(categoryMatches, (m) => m[1]);

    posts.push({
      postId,
      title,
      published,
      author,
      link,
      description,
      categories,
    });
  }

  return posts;
}

// ============================================================================
// RSS 2.0 Feed Parser
// ============================================================================

/**
 * Parse RSS 2.0 feed format (e.g., LangChain blog)
 *
 * Structure:
 * <rss version="2.0">
 *   <channel>
 *     <item>
 *       <title>Post Title</title>
 *       <link>https://...</link>
 *       <guid isPermaLink="false">...</guid>
 *       <pubDate>Tue, 16 Dec 2025 20:50:55 GMT</pubDate>
 *       <dc:creator>Author Name</dc:creator>
 *       <description>...</description>
 *       <category>Tag 1</category>
 *       <category>Tag 2</category>
 *     </item>
 *   </channel>
 * </rss>
 */
function parseRSSFeed(
  xml: string,
  maxPosts: number,
  since?: string
): BlogPost[] {
  const posts: BlogPost[] = [];
  const sinceDate = since ? new Date(since) : new Date(0);

  // Extract all <item> blocks
  const itemPattern = /<item>([\s\S]*?)<\/item>/g;
  const items = xml.match(itemPattern) || [];

  for (let i = 0; i < Math.min(items.length, maxPosts); i++) {
    const item = items[i];

    // Extract guid (use as postId)
    const guidMatch = item.match(/<guid[^>]*>([^<]+)<\/guid>/);
    if (!guidMatch) continue;
    const postId = guidMatch[1];

    // Extract title
    const titleMatch = item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/);
    const title = titleMatch
      ? decodeHtmlEntities(titleMatch[1])
      : item.match(/<title>([^<]+)<\/title>/)?.[1] || "Untitled";

    // Extract pubDate
    const pubDateMatch = item.match(/<pubDate>([^<]+)<\/pubDate>/);
    if (!pubDateMatch) continue;
    const published = new Date(pubDateMatch[1]).toISOString();
    const publishedDate = new Date(published);

    // Filter by date
    if (publishedDate < sinceDate) continue;

    // Extract author (dc:creator)
    const authorMatch = item.match(/<dc:creator><!\[CDATA\[([^\]]+)\]\]><\/dc:creator>/);
    const author = authorMatch
      ? decodeHtmlEntities(authorMatch[1])
      : item.match(/<dc:creator>([^<]+)<\/dc:creator>/)?.[1] || "Unknown";

    // Extract link
    const linkMatch = item.match(/<link>([^<]+)<\/link>/);
    const link = linkMatch ? linkMatch[1] : "";

    // Extract description
    const descMatch = item.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>/);
    const description = descMatch
      ? stripHtmlTags(decodeHtmlEntities(descMatch[1]))
      : item.match(/<description>([^<]+)<\/description>/)?.[1]
      ? stripHtmlTags(decodeHtmlEntities(item.match(/<description>([^<]+)<\/description>/)![1]))
      : undefined;

    // Extract categories
    const categoryMatches = item.matchAll(/<category><!\[CDATA\[([^\]]+)\]\]><\/category>/g);
    const categories = Array.from(categoryMatches, (m) => m[1]);

    posts.push({
      postId,
      title,
      published,
      author,
      link,
      description,
      categories,
    });
  }

  return posts;
}

// ============================================================================
// Processing
// ============================================================================

function processPosts(
  sourceId: string,
  sourceName: string,
  posts: BlogPost[]
): Finding[] {
  return posts.map((post) => {
    const { score, reasoning } = calculateRelevance(post);
    const category = categorizePost(post);
    const keywords = extractKeywords(post);
    const actionItems = generateActionItems(post, score);

    return {
      id: generateId(),
      source: sourceId,
      type: "article" as const,
      date: post.published,
      url: post.link,
      title: post.title,
      summary: post.description
        ? post.description.substring(0, 300)
        : `${sourceName} article: ${post.title}`,
      relevance: score,
      category,
      keywords,
      action_items: actionItems,
      metadata: {
        postId: post.postId,
        author: post.author,
        publishedDate: post.published,
        hasDescription: !!post.description,
        categories: post.categories || [],
      },
    };
  });
}

// ============================================================================
// Keyword Matching
// ============================================================================

function matchesKeywords(post: BlogPost, keywords: string[]): boolean {
  const combined = `${post.title} ${post.description || ""}`.toLowerCase();

  for (const keyword of keywords) {
    if (combined.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Relevance Scoring
// ============================================================================

function calculateRelevance(post: BlogPost): {
  score: "high" | "medium" | "low";
  reasoning: string;
} {
  const title = post.title.toLowerCase();
  const desc = (post.description || "").toLowerCase();
  const combined = `${title} ${desc}`;

  // HIGH priority keywords - directly relevant to PAI improvement
  const highKeywords = [
    "claude",
    "anthropic",
    "mcp",
    "model context protocol",
    "agent",
    "agentic",
    "autonomous",
    "claude code",
    "prompt engineering",
    "prompt pattern",
    "system prompt",
    "tool use",
    "function calling",
    "code generation",
    "ai coding",
    "langgraph",
    "langsmith",
    "langchain",
  ];

  for (const keyword of highKeywords) {
    if (combined.includes(keyword)) {
      return {
        score: "high",
        reasoning: `Article about ${keyword} - highly relevant to PAI`,
      };
    }
  }

  // MEDIUM priority - general AI/LLM content
  const mediumKeywords = [
    "llm",
    "large language model",
    "gpt",
    "openai",
    "ai tutorial",
    "machine learning",
    "automation",
    "workflow",
    "productivity",
    "api",
    "integration",
    "python",
    "javascript",
    "typescript",
  ];

  for (const keyword of mediumKeywords) {
    if (combined.includes(keyword)) {
      return {
        score: "medium",
        reasoning: `AI/LLM content: "${keyword}" - potentially useful`,
      };
    }
  }

  // LOW priority - general tech content
  return {
    score: "low",
    reasoning: "General tech content - may not be directly applicable",
  };
}

// ============================================================================
// Categorization
// ============================================================================

function categorizePost(post: BlogPost): string {
  const title = post.title.toLowerCase();
  const desc = (post.description || "").toLowerCase();
  const combined = `${title} ${desc}`;

  if (
    combined.includes("prompt") ||
    combined.includes("system message") ||
    combined.includes("instruction")
  ) {
    return "prompting";
  }

  if (
    combined.includes("tool") ||
    combined.includes("mcp") ||
    combined.includes("function") ||
    combined.includes("api")
  ) {
    return "tools";
  }

  if (
    combined.includes("agent") ||
    combined.includes("autonomous") ||
    combined.includes("workflow") ||
    combined.includes("langgraph")
  ) {
    return "architecture";
  }

  if (
    combined.includes("skill") ||
    combined.includes("technique") ||
    combined.includes("pattern")
  ) {
    return "skills";
  }

  if (
    combined.includes("security") ||
    combined.includes("pentesting") ||
    combined.includes("vulnerability")
  ) {
    return "security";
  }

  return "general";
}

// ============================================================================
// Keyword Extraction
// ============================================================================

function extractKeywords(post: BlogPost): string[] {
  const combined = `${post.title} ${post.description || ""}`.toLowerCase();
  const keywords: string[] = [];

  const relevantTerms = [
    "claude",
    "anthropic",
    "mcp",
    "agent",
    "prompt",
    "tool use",
    "function calling",
    "code generation",
    "langgraph",
    "langsmith",
    "langchain",
    "llm",
    "gpt",
    "automation",
    "workflow",
    "api",
    "integration",
    "skill",
    "technique",
    "python",
    "typescript",
  ];

  for (const term of relevantTerms) {
    if (combined.includes(term) && !keywords.includes(term)) {
      keywords.push(term);
    }
  }

  // Add categories as keywords
  if (post.categories) {
    for (const cat of post.categories) {
      const normalized = cat.toLowerCase();
      if (!keywords.includes(normalized)) {
        keywords.push(normalized);
      }
    }
  }

  return keywords.slice(0, 10);
}

// ============================================================================
// Action Items
// ============================================================================

function generateActionItems(
  post: BlogPost,
  relevance: "high" | "medium" | "low"
): string[] {
  const items: string[] = [];

  items.push(`Read article: "${post.title}"`);

  if (relevance === "high") {
    items.push("Extract key techniques and patterns mentioned");
    items.push("Evaluate for immediate PAI integration");
    items.push("Document learnings in appropriate protocol or skill");
  } else if (relevance === "medium") {
    items.push("Review for potentially useful concepts");
    items.push("Bookmark if relevant to future PAI improvements");
  } else {
    items.push("Skim for any unexpected insights");
  }

  return items;
}

// ============================================================================
// Utilities
// ============================================================================

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x2019;/g, "'")
    .replace(/&#x201C;/g, '"')
    .replace(/&#x201D;/g, '"');
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
