/**
 * scanSource Implementation with Anthropic Blog Scraper Integration
 *
 * This file contains the updated scanSource() function and scrapeAnthropicBlog() helper
 * to be integrated into upgrade-cli.ts
 */

import { AnthropicBlogScraper } from "./scrapers/index.ts";
import { execAsync } from "util"; // Assumes execAsync is available from main file

interface Source {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4;
  url: string;
  type: "api" | "rss" | "web";
  scan_frequency: "daily" | "weekly" | "monthly";
  last_scanned?: string;
  enabled: boolean;
}

interface Finding {
  id: string;
  source: string;
  type: "article" | "release" | "commit" | "video" | "post";
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

async function scanSource(source: Source): Promise<Finding[]> {
  // verbose() function assumed to be available from main file
  verbose(`  Fetching from: ${source.url}`);

  // Route to appropriate scraper based on source ID
  switch (source.id) {
    case "anthropic-blog":
      return await scrapeAnthropicBlog(source);

    // TODO: Implement other scrapers
    case "claude-code-github":
      verbose(`  ⚠️  GitHub scraper not yet implemented`);
      return [];

    case "anthropic-docs":
      verbose(`  ⚠️  Docs scraper not yet implemented`);
      return [];

    case "daniel-repo":
      verbose(`  ⚠️  Daniel's repo scraper not yet implemented`);
      return [];

    case "indiedevdan-youtube":
      verbose(`  ⚠️  YouTube scraper not yet implemented`);
      return [];

    case "trailofbits-blog":
      verbose(`  ⚠️  RSS scraper not yet implemented`);
      return [];

    default:
      verbose(`  ⚠️  No scraper configured for: ${source.id}`);
      return [];
  }
}

/**
 * Scrape Anthropic blog using WebFetch MCP tool
 *
 * Approach:
 * 1. Generate WebFetch prompt using AnthropicBlogScraper helper
 * 2. Call WebFetch via Claude Code CLI
 * 3. Parse JSON response (array of articles)
 * 4. Process using AnthropicBlogScraper.processResults()
 * 5. Return Finding[] objects
 */
async function scrapeAnthropicBlog(source: Source): Promise<Finding[]> {
  try {
    // Generate WebFetch prompt
    const prompt = AnthropicBlogScraper.generatePrompt({ maxArticles: 10 });

    // Call WebFetch via Claude Code CLI
    // Format: claude-code mcp__webfetch "<url>" "<prompt>"
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const webfetchCmd = `claude-code --dangerously-skip-permissions mcp__webfetch "${source.url}" "${escapedPrompt}"`;

    verbose(`  🌐 Calling WebFetch for ${source.url}...`);
    const { stdout, stderr } = await execAsync(webfetchCmd);

    if (stderr) {
      verbose(`  ⚠️  WebFetch warnings: ${stderr}`);
    }

    // Parse WebFetch response
    // Expected format: JSON array of articles
    let articles;
    try {
      // WebFetch may return the result wrapped in a response object
      const response = JSON.parse(stdout);
      articles = Array.isArray(response) ? response : response.articles || response.data || [];
    } catch (parseError) {
      verbose(`  ❌ Failed to parse WebFetch response as JSON`);
      verbose(`  Raw output: ${stdout.substring(0, 200)}...`);
      return [];
    }

    if (!Array.isArray(articles) || articles.length === 0) {
      verbose(`  ⚠️  No articles found in WebFetch response`);
      return [];
    }

    // Process results using scraper helper
    const findings = AnthropicBlogScraper.processResults(articles, source.id);

    verbose(`  ✅ Found ${findings.length} articles from Anthropic blog`);

    // Log relevance breakdown
    const highCount = findings.filter(f => f.relevance === "high").length;
    const medCount = findings.filter(f => f.relevance === "medium").length;
    const lowCount = findings.filter(f => f.relevance === "low").length;
    verbose(`     High: ${highCount}, Medium: ${medCount}, Low: ${lowCount}`);

    return findings;

  } catch (error) {
    verbose(`  ❌ Error scraping Anthropic blog: ${error}`);
    if (error instanceof Error && error.message.includes("command not found")) {
      verbose(`  💡 Hint: Make sure claude-code CLI is in PATH`);
    }
    return [];
  }
}

// For reference: verbose() and execAsync() should be available from main upgrade-cli.ts file
declare function verbose(message: string): void;
declare const execAsync: (cmd: string) => Promise<{ stdout: string; stderr: string }>;

export { scanSource, scrapeAnthropicBlog };
