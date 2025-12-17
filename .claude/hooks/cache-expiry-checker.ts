#!/usr/bin/env bun
/**
 * PAI Research Cache Expiry Checker
 *
 * Checks research cache for expired entries on SessionStart.
 * Automatically triggers research refresh for expired frameworks.
 *
 * Cache Expiry Policy:
 * - Default TTL: 30 days
 * - Configurable per project
 * - Force refresh on major version changes
 *
 * Integration:
 * - Runs on SessionStart event
 * - Scans research cache directory
 * - Triggers research for expired entries
 * - Updates project agents if research refreshed
 *
 * Exit Codes:
 * - 0: Success (cache checked, research triggered if needed)
 * - 1: Error (logged but not blocking)
 */

import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface CacheEntry {
  file: string;
  framework: string;
  version: string | null;
  researchDate: Date;
  age: number; // days
  expired: boolean;
}

interface HookInput {
  session_id: string;
  transcript_path: string;
  hook_event_name: string;
}

/**
 * Read JSON input from stdin.
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
 * Get research cache directory.
 */
function getCacheDir(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  return join(homeDir!, ".claude", "validation", "research_cache");
}

/**
 * Get cache TTL in days (default: 30 days).
 */
function getCacheTTL(): number {
  const ttl = process.env.PAI_RESEARCH_CACHE_TTL;
  return ttl ? parseInt(ttl, 10) : 30;
}

/**
 * Parse cache file name to extract framework and version.
 * Format: {framework}@{version}_{date}.json
 */
function parseCacheFileName(fileName: string): {
  framework: string;
  version: string | null;
} | null {
  const match = fileName.match(/^(.+?)@(.+?)_(\d{4}-\d{2}-\d{2})\.json$/);
  if (!match) return null;

  return {
    framework: match[1],
    version: match[2] === "latest" ? null : match[2],
  };
}

/**
 * Check if cache entry is expired.
 */
async function checkCacheEntry(cacheFile: string): Promise<CacheEntry | null> {
  try {
    // Parse file name
    const fileName = cacheFile.split(/[\/\\]/).pop()!;
    const parsed = parseCacheFileName(fileName);
    if (!parsed) return null;

    // Read cache file
    const content = await readFile(cacheFile, "utf-8");
    const data = JSON.parse(content);

    // Get research date
    const researchDate = new Date(data.research_date);

    // Calculate age in days
    const now = new Date();
    const ageMs = now.getTime() - researchDate.getTime();
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

    // Check if expired
    const ttl = getCacheTTL();
    const expired = ageDays >= ttl;

    return {
      file: fileName,
      framework: parsed.framework,
      version: parsed.version,
      researchDate,
      age: ageDays,
      expired,
    };
  } catch (error) {
    console.error(`[cache-expiry] Error reading cache file ${cacheFile}:`, error);
    return null;
  }
}

/**
 * Scan research cache directory for expired entries.
 */
async function scanCacheDirectory(): Promise<CacheEntry[]> {
  const cacheDir = getCacheDir();
  const entries: CacheEntry[] = [];

  try {
    const files = await readdir(cacheDir);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = join(cacheDir, file);
      const entry = await checkCacheEntry(filePath);

      if (entry) {
        entries.push(entry);
      }
    }
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("[cache-expiry] No research cache directory found");
    } else {
      console.error(`[cache-expiry] Error scanning cache: ${error.message}`);
    }
  }

  return entries;
}

/**
 * Trigger research refresh for expired frameworks.
 */
async function refreshExpiredCache(
  expiredEntries: CacheEntry[]
): Promise<void> {
  if (expiredEntries.length === 0) {
    console.log("[cache-expiry] All cache entries are fresh");
    return;
  }

  console.log(`[cache-expiry] Found ${expiredEntries.length} expired cache entries:`);
  for (const entry of expiredEntries) {
    const version = entry.version || "latest";
    console.log(`  - ${entry.framework}@${version} (age: ${entry.age} days)`);
  }

  // Determine Python command
  const pythonCmd = process.platform === "win32" ? "python" : "python3";

  try {
    // Run research refresh script
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const refreshScript = `${homeDir}/.claude/validation/research_integration/refresh_cache.py`;

    // Build framework list
    const frameworks = expiredEntries.map((e) => {
      const version = e.version || "latest";
      return `${e.framework}@${version}`;
    });

    console.log("[cache-expiry] Refreshing research cache...");

    const { stdout, stderr } = await execAsync(
      `${pythonCmd} "${refreshScript}" --frameworks "${frameworks.join(",")}"`,
      {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 300000, // 5 minutes (longer for multiple frameworks)
      }
    );

    console.log("[cache-expiry] Cache refresh complete:");
    console.log(stdout);

    if (stderr) {
      console.log("[cache-expiry] Warnings:");
      console.log(stderr);
    }
  } catch (error: any) {
    console.error(`[cache-expiry] Cache refresh failed: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
  }
}

/**
 * Display cache statistics.
 */
function displayCacheStats(entries: CacheEntry[]): void {
  if (entries.length === 0) {
    console.log("[cache-expiry] No cache entries found");
    return;
  }

  const expired = entries.filter((e) => e.expired);
  const fresh = entries.filter((e) => !e.expired);

  console.log("\n[cache-expiry] Research Cache Statistics:");
  console.log(`  Total entries: ${entries.length}`);
  console.log(`  Fresh entries: ${fresh.length}`);
  console.log(`  Expired entries: ${expired.length}`);

  if (fresh.length > 0) {
    console.log("\n[cache-expiry] Fresh cache entries:");
    for (const entry of fresh) {
      const version = entry.version || "latest";
      console.log(`  ✓ ${entry.framework}@${version} (age: ${entry.age} days)`);
    }
  }

  console.log("");
}

/**
 * Main hook execution.
 */
async function main() {
  try {
    // Read hook input
    const hookInput = await readStdin();

    console.log("[cache-expiry] Checking research cache expiry...");

    // Scan cache directory
    const entries = await scanCacheDirectory();

    // Display statistics
    displayCacheStats(entries);

    // Find expired entries
    const expired = entries.filter((e) => e.expired);

    // Refresh expired cache
    if (expired.length > 0) {
      await refreshExpiredCache(expired);
    }

    // Success
    process.exit(0);
  } catch (error: any) {
    console.error(`[cache-expiry] Hook error: ${error.message}`);
    // Non-blocking on errors
    process.exit(0);
  }
}

main();
