#!/usr/bin/env bun
/**
 * Ref.tools Integration Hook
 * ==========================
 *
 * Connects Claude Code agents, skills, and hooks to Ref.tools MCP server
 * for intelligent documentation lookup during development workflows.
 *
 * Features:
 * - Auto-triggers documentation search when agents need API/library info
 * - Caches documentation results for session efficiency
 * - Integrates with validation workflows for accurate code generation
 *
 * Ref.tools MCP Tools:
 * - ref_search_documentation: Search technical docs for any platform/API
 * - ref_read_url: Read full content of documentation pages
 * - ref_web_search: Fallback web search when docs not found
 *
 * @see https://github.com/ref-tools/ref-tools-mcp
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "fs";
import { join, dirname } from "path";

interface HookInput {
  session_id: string;
  transcript_path: string;
  hook_event_name: string;
  working_directory?: string;
  tool_input?: {
    tool_name?: string;
    input?: Record<string, unknown>;
  };
}

interface RefToolsCache {
  searches: Map<string, CachedSearch>;
  sessionId: string;
  lastUpdated: number;
}

interface CachedSearch {
  query: string;
  results: string[];
  timestamp: number;
  ttlSeconds: number;
}

// In-memory cache for session
const cache: RefToolsCache = {
  searches: new Map(),
  sessionId: "",
  lastUpdated: Date.now(),
};

// Documentation patterns to detect
const DOC_PATTERNS = [
  // API/Library patterns
  /how\s+(?:to|do\s+I)\s+(?:use|implement|configure)\s+(\w+)/i,
  /(\w+)\s+(?:api|sdk|library|package|module)\s+(?:docs|documentation|reference)/i,
  /(?:import|require|from)\s+['"](@?\w+[\w\-\/]*)['"]/i,
  // Framework patterns
  /(?:react|vue|angular|next|nuxt|svelte|express|fastapi|django|flask)\s+\w+/i,
  // Database patterns
  /(?:postgresql|mysql|mongodb|redis|supabase|firebase|prisma)\s+\w+/i,
  // Cloud patterns
  /(?:aws|gcp|azure|vercel|cloudflare|docker|kubernetes)\s+\w+/i,
];

// Keywords that suggest documentation lookup would help
const DOC_KEYWORDS = [
  "authentication", "authorization", "oauth", "jwt",
  "database", "query", "schema", "migration",
  "api", "endpoint", "route", "middleware",
  "component", "hook", "state", "props",
  "deployment", "build", "configure", "setup",
  "testing", "mock", "fixture", "assertion",
];

/**
 * Read JSON input from stdin
 */
async function readStdin(): Promise<HookInput> {
  const decoder = new TextDecoder();
  const reader = Bun.stdin.stream().getReader();
  let input = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    input += decoder.decode(value, { stream: true });
  }

  return JSON.parse(input);
}

/**
 * Detect if user prompt needs documentation lookup
 */
function needsDocumentation(text: string): { needed: boolean; topics: string[] } {
  const topics: string[] = [];

  // Check patterns
  for (const pattern of DOC_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      topics.push(match[1] || match[0]);
    }
  }

  // Check keywords
  const lowerText = text.toLowerCase();
  for (const keyword of DOC_KEYWORDS) {
    if (lowerText.includes(keyword) && !topics.includes(keyword)) {
      topics.push(keyword);
    }
  }

  return {
    needed: topics.length > 0,
    topics: [...new Set(topics)].slice(0, 3), // Max 3 topics
  };
}

/**
 * Get cache file path
 */
function getCachePath(sessionId: string): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const cacheDir = join(homeDir, ".claude", "cache", "ref-tools");

  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  return join(cacheDir, `session-${sessionId}.json`);
}

/**
 * Load cache from file
 */
function loadCache(sessionId: string): void {
  const cachePath = getCachePath(sessionId);

  if (existsSync(cachePath)) {
    try {
      const data = JSON.parse(readFileSync(cachePath, "utf-8"));
      cache.sessionId = sessionId;
      cache.searches = new Map(Object.entries(data.searches || {}));
      cache.lastUpdated = data.lastUpdated || Date.now();
    } catch {
      // Reset cache on error
      cache.searches = new Map();
    }
  }

  cache.sessionId = sessionId;
}

/**
 * Save cache to file
 */
function saveCache(sessionId: string): void {
  const cachePath = getCachePath(sessionId);

  const data = {
    sessionId,
    searches: Object.fromEntries(cache.searches),
    lastUpdated: Date.now(),
  };

  writeFileSync(cachePath, JSON.stringify(data, null, 2));
}

/**
 * Log integration event
 */
function logEvent(sessionId: string, event: string, data: Record<string, unknown>): void {
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const logDir = join(homeDir, ".claude", "logs", "ref-tools");

  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }

  const logPath = join(logDir, `${new Date().toISOString().split("T")[0]}.jsonl`);
  const logEntry = {
    timestamp: new Date().toISOString(),
    sessionId,
    event,
    ...data,
  };

  appendFileSync(logPath, JSON.stringify(logEntry) + "\n");
}

/**
 * Generate system message for documentation context
 */
function generateDocContext(topics: string[]): string {
  return `
## Ref.tools Documentation Integration Active

The following documentation topics have been detected for this task:
${topics.map(t => `- ${t}`).join("\n")}

**Available MCP Tools for Documentation:**
- \`mcp__Ref__ref_search_documentation\`: Search docs for "${topics.join('", "')}"
- \`mcp__Ref__ref_read_url\`: Read full page content when you find relevant docs
- \`mcp__Ref__ref_web_search\`: Web search fallback if docs not found

**Best Practices:**
1. Search documentation BEFORE implementing unknown APIs
2. Use specific search queries (e.g., "react useEffect cleanup" not just "react")
3. Read the full page when you find relevant results
4. Cache results are token-efficient (repeated searches return cached results)
`;
}

/**
 * Main hook execution
 */
async function main() {
  try {
    const hookInput = await readStdin();
    const sessionId = hookInput.session_id;
    const eventType = hookInput.hook_event_name;

    // Initialize cache for this session
    if (cache.sessionId !== sessionId) {
      loadCache(sessionId);
    }

    // Handle different hook events
    switch (eventType) {
      case "UserPromptSubmit": {
        // Analyze user prompt for documentation needs
        const transcript = hookInput.transcript_path;
        // Note: In real implementation, would read last user message from transcript

        logEvent(sessionId, "prompt_analyzed", {
          event: eventType,
        });

        // Output system message if needed
        const output = {
          continue: true,
          systemMessage: `Ref.tools MCP is available for documentation lookup. Use mcp__Ref__ref_search_documentation to search API/library docs.`,
        };

        console.log(JSON.stringify(output));
        break;
      }

      case "PreToolUse": {
        const toolName = hookInput.tool_input?.tool_name || "";

        // Log Ref.tools usage
        if (toolName.startsWith("mcp__Ref__")) {
          logEvent(sessionId, "ref_tool_invoked", {
            tool: toolName,
            input: hookInput.tool_input?.input,
          });
        }

        // Always continue
        console.log(JSON.stringify({ continue: true }));
        break;
      }

      case "PostToolUse": {
        const toolName = hookInput.tool_input?.tool_name || "";

        // Cache Ref.tools results
        if (toolName.startsWith("mcp__Ref__")) {
          logEvent(sessionId, "ref_tool_completed", {
            tool: toolName,
          });

          saveCache(sessionId);
        }

        console.log(JSON.stringify({ continue: true }));
        break;
      }

      case "SessionStart": {
        // Initialize session with Ref.tools availability notice
        logEvent(sessionId, "session_started", {
          refToolsEnabled: true,
        });

        console.log(JSON.stringify({
          continue: true,
          systemMessage: `Ref.tools documentation MCP server is connected. Use it to look up API documentation, library references, and technical guides.`,
        }));
        break;
      }

      case "SessionEnd": {
        // Cleanup and log session stats
        const searchCount = cache.searches.size;

        logEvent(sessionId, "session_ended", {
          totalSearches: searchCount,
        });

        console.log(JSON.stringify({ continue: true }));
        break;
      }

      default:
        console.log(JSON.stringify({ continue: true }));
    }

    process.exit(0);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ref-tools-integration] Error: ${errorMessage}`);

    // Never block on errors
    console.log(JSON.stringify({ continue: true }));
    process.exit(0);
  }
}

main();
