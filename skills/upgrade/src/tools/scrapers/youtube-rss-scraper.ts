/**
 * YouTube RSS Feed Scraper
 *
 * Monitors YouTube channels for new AI-related content using RSS feeds.
 * YouTube RSS feeds provide the latest 10 videos without requiring API authentication.
 *
 * Feed Format: https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}
 *
 * Sources:
 * - https://chuck.is/yt-rss/
 * - https://danielmiessler.com/blog/rss-feed-youtube-channel
 * - https://blog.pesky.moe/posts/2024-11-24-yt-rss/
 */

import type { Finding } from "../types.ts";

// ============================================================================
// Types
// ============================================================================

interface YouTubeVideo {
  videoId: string;
  title: string;
  published: string; // ISO date
  author: string;
  link: string;
  description?: string;
}

interface ScrapeOptions {
  maxVideos?: number;
  since?: string; // ISO date string
}

// ============================================================================
// Main Scraper
// ============================================================================

export const YouTubeRSSScraper = {
  async scrape(
    sourceId: string,
    channelId: string,
    channelName: string,
    options: ScrapeOptions = {}
  ): Promise<Finding[]> {
    const { maxVideos = 10, since } = options;

    // Fetch RSS feed
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const videos = await fetchYouTubeFeed(rssUrl, maxVideos, since);

    // Convert to findings
    return processVideos(sourceId, channelName, videos);
  },
};

// ============================================================================
// RSS Feed Fetcher
// ============================================================================

async function fetchYouTubeFeed(
  url: string,
  maxVideos: number,
  since?: string
): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();
    return parseYouTubeFeed(xml, maxVideos, since);
  } catch (error) {
    throw new Error(`Failed to fetch YouTube RSS feed: ${error}`);
  }
}

// ============================================================================
// XML Parser
// ============================================================================

/**
 * Parse YouTube RSS feed (Atom format)
 *
 * Structure:
 * <feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 *   <entry>
 *     <id>yt:video:VIDEO_ID</id>
 *     <yt:videoId>VIDEO_ID</yt:videoId>
 *     <yt:channelId>CHANNEL_ID</yt:channelId>
 *     <title>Video Title</title>
 *     <link rel="alternate" href="https://www.youtube.com/watch?v=VIDEO_ID"/>
 *     <author><name>Channel Name</name></author>
 *     <published>2025-12-01T10:00:00+00:00</published>
 *     <updated>2025-12-01T10:00:00+00:00</updated>
 *     <media:group>
 *       <media:title>Video Title</media:title>
 *       <media:description>Description</media:description>
 *     </media:group>
 *   </entry>
 * </feed>
 */
function parseYouTubeFeed(
  xml: string,
  maxVideos: number,
  since?: string
): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
  const sinceDate = since ? new Date(since) : new Date(0);

  // Extract all <entry> blocks
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
  const entries = xml.match(entryPattern) || [];

  for (let i = 0; i < Math.min(entries.length, maxVideos); i++) {
    const entry = entries[i];

    // Extract video ID
    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!videoIdMatch) continue;

    const videoId = videoIdMatch[1];

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
    const link = `https://www.youtube.com/watch?v=${videoId}`;

    // Extract description from media:description
    const descMatch = entry.match(/<media:description>([^<]*)<\/media:description>/);
    const description = descMatch ? decodeHtmlEntities(descMatch[1]) : undefined;

    videos.push({
      videoId,
      title,
      published,
      author,
      link,
      description,
    });
  }

  return videos;
}

// ============================================================================
// Processing
// ============================================================================

function processVideos(
  sourceId: string,
  channelName: string,
  videos: YouTubeVideo[]
): Finding[] {
  return videos.map((video) => {
    const { score, reasoning } = calculateRelevance(video);
    const category = categorizeVideo(video);
    const keywords = extractKeywords(video);
    const actionItems = generateActionItems(video, score);

    return {
      id: generateId(),
      source: sourceId,
      type: "video" as const,
      date: video.published,
      url: video.link,
      title: video.title,
      summary: video.description
        ? video.description.substring(0, 300)
        : `${channelName} video: ${video.title}`,
      relevance: score,
      category,
      keywords,
      action_items: actionItems,
      metadata: {
        videoId: video.videoId,
        channel: video.author,
        publishedDate: video.published,
        hasDescription: !!video.description,
      },
    };
  });
}

// ============================================================================
// Relevance Scoring
// ============================================================================

function calculateRelevance(video: YouTubeVideo): {
  score: "high" | "medium" | "low";
  reasoning: string;
} {
  const title = video.title.toLowerCase();
  const desc = (video.description || "").toLowerCase();
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
    "cursor",
    "windsurf",
    "cline",
    "aider",
  ];

  for (const keyword of highKeywords) {
    if (combined.includes(keyword)) {
      return {
        score: "high",
        reasoning: `Video about ${keyword} - highly relevant to PAI`,
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
    "devtools",
    "api",
    "integration",
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

function categorizeVideo(video: YouTubeVideo): string {
  const title = video.title.toLowerCase();
  const desc = (video.description || "").toLowerCase();
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
    combined.includes("workflow")
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

function extractKeywords(video: YouTubeVideo): string[] {
  const combined = `${video.title} ${video.description || ""}`.toLowerCase();
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
    "cursor",
    "windsurf",
    "cline",
    "aider",
    "llm",
    "gpt",
    "automation",
    "workflow",
    "api",
    "integration",
    "skill",
    "technique",
  ];

  for (const term of relevantTerms) {
    if (combined.includes(term) && !keywords.includes(term)) {
      keywords.push(term);
    }
  }

  return keywords.slice(0, 10);
}

// ============================================================================
// Action Items
// ============================================================================

function generateActionItems(
  video: YouTubeVideo,
  relevance: "high" | "medium" | "low"
): string[] {
  const items: string[] = [];

  items.push(`Watch video: "${video.title}"`);

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
    .replace(/&nbsp;/g, " ");
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
