/**
 * kai-hook-system - Shared Utilities
 *
 * DRY utilities used across all hooks to eliminate code duplication.
 * Provides file operations, JSONL handling, logging, and common patterns.
 */

import { existsSync, mkdirSync, appendFileSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';

/**
 * Get PAI directory (from environment or default)
 */
export function getPAIDir(): string {
  return process.env.PAI_DIR || join(homedir(), '.claude');
}

/**
 * Ensure directory exists (create if missing)
 */
export function ensureDirectory(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

/**
 * Ensure parent directory exists for a file path
 */
export function ensureParentDirectory(filePath: string): void {
  const dir = dirname(filePath);
  ensureDirectory(dir);
}

/**
 * Append JSON object to JSONL file
 */
export function appendJSONL(file: string, data: any): void {
  ensureParentDirectory(file);
  const line = JSON.stringify(data) + '\n';
  appendFileSync(file, line, 'utf-8');
}

/**
 * Read JSONL file and parse into array of objects
 */
export function readJSONL(file: string): any[] {
  if (!existsSync(file)) {
    return [];
  }

  const content = readFileSync(file, 'utf-8');
  const lines = content.trim().split('\n');
  const objects: any[] = [];

  for (const line of lines) {
    try {
      objects.push(JSON.parse(line));
    } catch {
      // Skip invalid JSON lines
    }
  }

  return objects;
}

/**
 * Write markdown file with frontmatter
 */
export function writeMarkdown(
  file: string,
  frontmatter: Record<string, any>,
  content: string
): void {
  ensureParentDirectory(file);

  // Build YAML frontmatter
  const yaml = [
    '---',
    ...Object.entries(frontmatter).map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.join(', ')}]`;
      }
      return `${key}: ${value}`;
    }),
    '---',
    ''
  ].join('\n');

  const fullContent = yaml + content;
  writeFileSync(file, fullContent, 'utf-8');
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get ISO timestamp
 */
export function getISOTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate filename-safe string from text
 */
export function toFilename(text: string, maxLength: number = 50): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Trim hyphens from ends
    .slice(0, maxLength);
}

/**
 * Generate timestamp-based filename
 */
export function generateTimestampedFilename(
  description: string,
  extension: string = 'md'
): string {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const safeDescription = toFilename(description, 40);
  return `${timestamp}_${safeDescription}.${extension}`;
}

/**
 * Logging levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log message with prefix
 */
export function logHook(
  hookName: string,
  message: string,
  level: LogLevel = 'info'
): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [kai-${hookName}] [${level.toUpperCase()}]`;

  switch (level) {
    case 'error':
      console.error(`${prefix} ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} ${message}`);
      break;
    case 'debug':
    case 'info':
    default:
      console.error(`${prefix} ${message}`); // Use stderr for all logs
      break;
  }
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T = any>(
  text: string,
  fallback: T
): T {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

/**
 * Extract text content from Claude message content array
 */
export function extractTextContent(
  content: Array<{ type: string; text?: string }>
): string {
  return content
    .filter(c => c.type === 'text' && c.text)
    .map(c => c.text)
    .join('\n');
}

/**
 * Extract tool uses from Claude message content array
 */
export function extractToolUses(
  content: Array<{
    type: string;
    name?: string;
    input?: any;
  }>
): Array<{ name: string; input: any }> {
  return content
    .filter(c => c.type === 'tool_use')
    .map(c => ({
      name: c.name || 'unknown',
      input: c.input || {}
    }));
}

/**
 * Get history directory path with monthly subdirectory
 */
export function getHistoryPath(category: string): string {
  const paiDir = getPAIDir();
  const month = getCurrentMonth();
  return join(paiDir, 'history', category, month);
}

/**
 * Get events file path (for JSONL logging)
 */
export function getEventsFilePath(): string {
  const paiDir = getPAIDir();
  const date = getCurrentDate();
  const month = getCurrentMonth();
  return join(paiDir, 'history', 'raw-outputs', month, `events_${date}.jsonl`);
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Count occurrences of keywords in text (case-insensitive)
 */
export function countKeywords(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  return keywords.filter(keyword =>
    lowerText.includes(keyword.toLowerCase())
  ).length;
}

/**
 * Check if text contains any of the keywords
 */
export function containsAnyKeyword(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword =>
    lowerText.includes(keyword.toLowerCase())
  );
}

/**
 * Extract unique values from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Deep merge two objects
 */
export function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

/**
 * Check if value is a plain object
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}
