/**
 * Prompt Storage System
 *
 * Manages storage, retrieval, and metadata for prompts in the meta-prompting system.
 * Handles three categories: active (being refined), completed (archived successes),
 * and templates (reusable patterns).
 */

import { readFile, writeFile, readdir, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

// ============================================================================
// Type Definitions
// ============================================================================

export interface PromptMetadata {
  id: string; // UUID v4
  created: string; // ISO 8601 timestamp
  completed?: string; // ISO 8601 timestamp (only for completed prompts)
  status: "active" | "completed" | "template";
  original_prompt: string;
  clarified_prompt?: string; // After Phase 1 clarification
  enhanced_prompt?: string; // After PAI enhancement tools
  clarity_scores: {
    objective: number;
    scope: number;
    context: number;
    technical_specificity: number;
    quality_standards: number;
    constraints: number;
    input_output: number;
    priority: number;
    execution_strategy: number;
    verification: number;
    overall: number;
  };
  complexity: "simple" | "moderate" | "complex" | "underspecified";
  execution?: {
    strategy: "single_agent" | "sequential" | "parallel";
    agents_used: string[];
    duration_seconds?: number;
    success: boolean;
    error_message?: string;
  };
  pai_tools_used: string[]; // PAI enhancement tools applied
  tags: string[]; // User-defined tags for categorization
  project_context?: string; // Project directory if applicable
  file_references: string[]; // Files mentioned in prompt
  estimated_impact: {
    time_saved_minutes: number;
    accuracy_improvement: number; // 0-1
    confidence: number; // 0-1
  };
}

export interface StorageConfig {
  baseDir: string;
  activeDir: string;
  completedDir: string;
  templatesDir: string;
  maxActivePrompts: number;
  maxCompletedPrompts: number;
  autoArchiveAfterDays: number;
}

// ============================================================================
// Configuration
// ============================================================================

function getStorageConfig(): StorageConfig {
  const baseDir = join(homedir(), ".claude", "prompts");

  return {
    baseDir,
    activeDir: join(baseDir, "active"),
    completedDir: join(baseDir, "completed"),
    templatesDir: join(baseDir, "templates"),
    maxActivePrompts: 50, // Auto-cleanup old active prompts
    maxCompletedPrompts: 500, // Keep last 500 successful prompts
    autoArchiveAfterDays: 30, // Archive active prompts older than 30 days
  };
}

// ============================================================================
// Directory Management
// ============================================================================

/**
 * Ensure all storage directories exist
 */
export async function initializeStorage(): Promise<void> {
  const config = getStorageConfig();

  try {
    await mkdir(config.activeDir, { recursive: true });
    await mkdir(config.completedDir, { recursive: true });
    await mkdir(config.templatesDir, { recursive: true });

    console.log("[storage] Initialized prompt storage directories");
  } catch (error: any) {
    console.error(
      `[storage] Failed to initialize directories: ${error.message}`
    );
    throw error;
  }
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Generate unique prompt ID
 */
function generatePromptId(): string {
  // Simple UUID v4 implementation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Save prompt metadata to appropriate directory
 */
export async function savePrompt(
  metadata: PromptMetadata
): Promise<void> {
  const config = getStorageConfig();

  // Determine target directory
  let targetDir: string;
  if (metadata.status === "active") {
    targetDir = config.activeDir;
  } else if (metadata.status === "completed") {
    targetDir = config.completedDir;
  } else {
    targetDir = config.templatesDir;
  }

  // Generate filename
  const filename = `${metadata.id}.json`;
  const filepath = join(targetDir, filename);

  try {
    await writeFile(filepath, JSON.stringify(metadata, null, 2), "utf-8");
    console.log(`[storage] Saved prompt ${metadata.id} to ${metadata.status}`);
  } catch (error: any) {
    console.error(`[storage] Failed to save prompt: ${error.message}`);
    throw error;
  }
}

/**
 * Load prompt metadata by ID
 */
export async function loadPrompt(
  promptId: string,
  status?: "active" | "completed" | "template"
): Promise<PromptMetadata | null> {
  const config = getStorageConfig();

  // Search directories in priority order
  const searchDirs = status
    ? [
        status === "active"
          ? config.activeDir
          : status === "completed"
            ? config.completedDir
            : config.templatesDir,
      ]
    : [config.activeDir, config.completedDir, config.templatesDir];

  for (const dir of searchDirs) {
    const filepath = join(dir, `${promptId}.json`);

    try {
      const content = await readFile(filepath, "utf-8");
      return JSON.parse(content) as PromptMetadata;
    } catch {
      // File doesn't exist in this directory, continue searching
      continue;
    }
  }

  console.warn(`[storage] Prompt ${promptId} not found`);
  return null;
}

/**
 * List all prompts in a directory
 */
export async function listPrompts(
  status: "active" | "completed" | "template"
): Promise<PromptMetadata[]> {
  const config = getStorageConfig();

  const dir =
    status === "active"
      ? config.activeDir
      : status === "completed"
        ? config.completedDir
        : config.templatesDir;

  try {
    const files = await readdir(dir);
    const prompts: PromptMetadata[] = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filepath = join(dir, file);
      const content = await readFile(filepath, "utf-8");
      prompts.push(JSON.parse(content));
    }

    return prompts.sort(
      (a, b) =>
        new Date(b.created).getTime() - new Date(a.created).getTime()
    );
  } catch (error: any) {
    console.error(`[storage] Failed to list prompts: ${error.message}`);
    return [];
  }
}

/**
 * Move prompt from active to completed
 */
export async function archivePrompt(
  promptId: string,
  executionData: PromptMetadata["execution"]
): Promise<void> {
  const config = getStorageConfig();

  // Load active prompt
  const activeFile = join(config.activeDir, `${promptId}.json`);
  const content = await readFile(activeFile, "utf-8");
  const metadata = JSON.parse(content) as PromptMetadata;

  // Update metadata
  metadata.status = "completed";
  metadata.completed = new Date().toISOString();
  metadata.execution = executionData;

  // Save to completed directory
  const completedFile = join(config.completedDir, `${promptId}.json`);
  await writeFile(completedFile, JSON.stringify(metadata, null, 2), "utf-8");

  // Delete from active directory
  const { unlink } = await import("node:fs/promises");
  await unlink(activeFile);

  console.log(`[storage] Archived prompt ${promptId} to completed`);
}

/**
 * Delete prompt by ID
 */
export async function deletePrompt(
  promptId: string,
  status?: "active" | "completed" | "template"
): Promise<void> {
  const config = getStorageConfig();

  const searchDirs = status
    ? [
        status === "active"
          ? config.activeDir
          : status === "completed"
            ? config.completedDir
            : config.templatesDir,
      ]
    : [config.activeDir, config.completedDir, config.templatesDir];

  for (const dir of searchDirs) {
    const filepath = join(dir, `${promptId}.json`);

    try {
      const { unlink } = await import("node:fs/promises");
      await unlink(filepath);
      console.log(`[storage] Deleted prompt ${promptId}`);
      return;
    } catch {
      // File doesn't exist in this directory, continue
      continue;
    }
  }

  console.warn(`[storage] Prompt ${promptId} not found for deletion`);
}

// ============================================================================
// Search and Filtering
// ============================================================================

export interface SearchFilters {
  tags?: string[];
  complexity?: PromptMetadata["complexity"];
  minClarityScore?: number;
  maxClarityScore?: number;
  projectContext?: string;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  successOnly?: boolean;
}

/**
 * Search prompts with filters
 */
export async function searchPrompts(
  status: "active" | "completed" | "template",
  filters: SearchFilters
): Promise<PromptMetadata[]> {
  const allPrompts = await listPrompts(status);

  return allPrompts.filter((prompt) => {
    // Tag filter
    if (
      filters.tags &&
      !filters.tags.some((tag) => prompt.tags.includes(tag))
    ) {
      return false;
    }

    // Complexity filter
    if (filters.complexity && prompt.complexity !== filters.complexity) {
      return false;
    }

    // Clarity score filter
    if (
      filters.minClarityScore !== undefined &&
      prompt.clarity_scores.overall < filters.minClarityScore
    ) {
      return false;
    }

    if (
      filters.maxClarityScore !== undefined &&
      prompt.clarity_scores.overall > filters.maxClarityScore
    ) {
      return false;
    }

    // Project context filter
    if (
      filters.projectContext &&
      prompt.project_context !== filters.projectContext
    ) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const createdDate = new Date(prompt.created);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);

      if (createdDate < startDate || createdDate > endDate) {
        return false;
      }
    }

    // Success filter
    if (
      filters.successOnly &&
      prompt.execution &&
      !prompt.execution.success
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Find similar prompts based on text similarity
 */
export async function findSimilarPrompts(
  originalPrompt: string,
  status: "completed" | "template",
  limit: number = 5
): Promise<PromptMetadata[]> {
  const allPrompts = await listPrompts(status);

  // Simple similarity scoring (word overlap)
  const scores = allPrompts.map((prompt) => {
    const score = calculateTextSimilarity(
      originalPrompt,
      prompt.original_prompt
    );
    return { prompt, score };
  });

  // Sort by similarity and return top N
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.prompt);
}

function calculateTextSimilarity(text1: string, text2: string): number {
  // Normalize and tokenize
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  // Calculate Jaccard similarity
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// ============================================================================
// Cleanup and Maintenance
// ============================================================================

/**
 * Auto-archive old active prompts
 */
export async function cleanupOldActivePrompts(): Promise<void> {
  const config = getStorageConfig();
  const activePrompts = await listPrompts("active");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.autoArchiveAfterDays);

  for (const prompt of activePrompts) {
    const createdDate = new Date(prompt.created);

    if (createdDate < cutoffDate) {
      console.log(
        `[storage] Auto-archiving old active prompt ${prompt.id} from ${prompt.created}`
      );

      await archivePrompt(prompt.id, {
        strategy: "single_agent",
        agents_used: [],
        success: false,
        error_message: "Auto-archived due to age",
      });
    }
  }
}

/**
 * Enforce storage limits
 */
export async function enforceStorageLimits(): Promise<void> {
  const config = getStorageConfig();

  // Active prompts limit
  const activePrompts = await listPrompts("active");
  if (activePrompts.length > config.maxActivePrompts) {
    const excessCount = activePrompts.length - config.maxActivePrompts;
    const oldestPrompts = activePrompts.slice(-excessCount);

    for (const prompt of oldestPrompts) {
      console.log(
        `[storage] Deleting excess active prompt ${prompt.id} (limit: ${config.maxActivePrompts})`
      );
      await deletePrompt(prompt.id, "active");
    }
  }

  // Completed prompts limit
  const completedPrompts = await listPrompts("completed");
  if (completedPrompts.length > config.maxCompletedPrompts) {
    const excessCount = completedPrompts.length - config.maxCompletedPrompts;
    const oldestPrompts = completedPrompts.slice(-excessCount);

    for (const prompt of oldestPrompts) {
      console.log(
        `[storage] Deleting excess completed prompt ${prompt.id} (limit: ${config.maxCompletedPrompts})`
      );
      await deletePrompt(prompt.id, "completed");
    }
  }
}

// ============================================================================
// Analytics and Insights
// ============================================================================

export interface PromptAnalytics {
  total_prompts: number;
  successful_prompts: number;
  failed_prompts: number;
  average_clarity_score: number;
  complexity_distribution: Record<string, number>;
  average_time_saved_minutes: number;
  most_used_pai_tools: Array<{ tool: string; count: number }>;
  most_common_tags: Array<{ tag: string; count: number }>;
}

/**
 * Generate analytics from completed prompts
 */
export async function generateAnalytics(): Promise<PromptAnalytics> {
  const completedPrompts = await listPrompts("completed");

  const analytics: PromptAnalytics = {
    total_prompts: completedPrompts.length,
    successful_prompts: 0,
    failed_prompts: 0,
    average_clarity_score: 0,
    complexity_distribution: {
      simple: 0,
      moderate: 0,
      complex: 0,
      underspecified: 0,
    },
    average_time_saved_minutes: 0,
    most_used_pai_tools: [],
    most_common_tags: [],
  };

  if (completedPrompts.length === 0) return analytics;

  // Calculate statistics
  let totalClarityScore = 0;
  let totalTimeSaved = 0;
  const paiToolCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  for (const prompt of completedPrompts) {
    // Success/failure
    if (prompt.execution?.success) {
      analytics.successful_prompts++;
    } else {
      analytics.failed_prompts++;
    }

    // Clarity score
    totalClarityScore += prompt.clarity_scores.overall;

    // Complexity distribution
    analytics.complexity_distribution[prompt.complexity]++;

    // Time saved
    totalTimeSaved += prompt.estimated_impact.time_saved_minutes;

    // PAI tools usage
    for (const tool of prompt.pai_tools_used) {
      paiToolCounts[tool] = (paiToolCounts[tool] || 0) + 1;
    }

    // Tags
    for (const tag of prompt.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // Calculate averages
  analytics.average_clarity_score = totalClarityScore / completedPrompts.length;
  analytics.average_time_saved_minutes = totalTimeSaved / completedPrompts.length;

  // Sort and limit PAI tools
  analytics.most_used_pai_tools = Object.entries(paiToolCounts)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Sort and limit tags
  analytics.most_common_tags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return analytics;
}

// ============================================================================
// Template Management
// ============================================================================

/**
 * Create template from successful prompt
 */
export async function createTemplate(
  completedPromptId: string,
  templateName: string,
  templateDescription: string
): Promise<string> {
  const config = getStorageConfig();

  // Load completed prompt
  const completedPrompt = await loadPrompt(completedPromptId, "completed");
  if (!completedPrompt) {
    throw new Error(`Completed prompt ${completedPromptId} not found`);
  }

  // Create template metadata
  const templateId = generatePromptId();
  const template: PromptMetadata = {
    ...completedPrompt,
    id: templateId,
    status: "template",
    created: new Date().toISOString(),
    tags: [...completedPrompt.tags, "template", templateName],
  };

  // Add template description to original_prompt
  template.original_prompt = `# ${templateName}\n\n${templateDescription}\n\n## Original Prompt Pattern:\n${completedPrompt.original_prompt}`;

  // Save template
  await savePrompt(template);

  console.log(
    `[storage] Created template ${templateName} from ${completedPromptId}`
  );

  return templateId;
}

/**
 * Apply template to new prompt
 */
export async function applyTemplate(
  templateId: string,
  userInputs: Record<string, string>
): Promise<PromptMetadata> {
  const template = await loadPrompt(templateId, "template");
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  // Create new active prompt from template
  const newPromptId = generatePromptId();
  const newPrompt: PromptMetadata = {
    ...template,
    id: newPromptId,
    status: "active",
    created: new Date().toISOString(),
    original_prompt: interpolateTemplate(
      template.original_prompt,
      userInputs
    ),
  };

  await savePrompt(newPrompt);

  console.log(
    `[storage] Applied template ${templateId} to create ${newPromptId}`
  );

  return newPrompt;
}

function interpolateTemplate(
  template: string,
  inputs: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(inputs)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, "g"), value);
  }

  return result;
}

// ============================================================================
// Exports
// ============================================================================

export {
  getStorageConfig,
  generatePromptId,
};
