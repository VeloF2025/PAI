/**
 * Scraper Integration Module
 *
 * Exports all source scrapers for use in upgrade-cli.ts
 */

export { AnthropicBlogScraper } from "./anthropic-blog-webfetch.ts";
export { GitHubReleasesScraper } from "./github-releases.ts";
export { DanielRepoScraper } from "./daniel-repo-scraper.ts";
export { AnthropicDocsScraper } from "./anthropic-docs-scraper.ts";
export { YouTubeRSSScraper } from "./youtube-rss-scraper.ts";
export { RSSFeedScraper } from "./rss-feed-scraper.ts";
export { AnthropicCookbookScraper } from "./anthropic-cookbook-scraper.ts";
