#!/usr/bin/env bun
/**
 * kai-hook-system - Unified Categorizer
 *
 * Consolidates categorize-history.ts + kai-history-categorizer.ts
 * into a single, efficient categorization system.
 *
 * Combines best features from both approaches:
 * - Learning detection (kai-history)
 * - Agent routing (kai-history)
 * - Legacy categorization logic (categorize-history)
 */

import { EventBus, runHook } from './event-bus';
import { securityMiddleware } from './security';
import {
  logHook,
  writeMarkdown,
  getHistoryPath,
  generateTimestampedFilename,
  truncate,
  unique
} from './shared';
import {
  isLearning,
  getAgentRoute,
  extractMetadata
} from '../lib/metadata-extraction';

/**
 * Categorization result
 */
interface CategorizationResult {
  category: string;
  subcategory?: string;
  isLearningEvent: boolean;
  agentType?: string;
  taskDescription: string;
  toolsUsed: string[];
}

/**
 * Unified Categorizer
 */
class UnifiedCategorizer {
  /**
   * Categorize a session based on transcript
   */
  static async categorize(
    sessionId: string,
    transcript: string,
    transcriptPath: string
  ): Promise<CategorizationResult> {
    // Parse transcript
    const entries = EventBus.parseTranscript(transcript);

    // Extract last assistant message
    const lastAssistantMessage = EventBus.getLastAssistantMessage(entries);
    if (!lastAssistantMessage) {
      logHook('categorizer', 'No assistant message found', 'warn');
      return this.getFallbackCategorization();
    }

    // Extract task description
    const taskDescription = EventBus.extractTaskDescription(entries);

    // Detect agent type
    const agentType = EventBus.detectAgentType(entries);

    // Extract tool calls
    const toolCalls = EventBus.extractToolCalls(entries);
    const toolsUsed = unique(toolCalls.map(t => t.name));

    // === LEARNING DETECTION (Priority 1) ===
    // Learning events override all other categorization
    const isLearningEvent = isLearning(lastAssistantMessage);

    if (isLearningEvent) {
      return {
        category: 'learnings',
        isLearningEvent: true,
        agentType,
        taskDescription,
        toolsUsed
      };
    }

    // === AGENT TYPE ROUTING (Priority 2) ===
    // Route by agent type if available
    if (agentType) {
      const route = getAgentRoute(agentType);
      if (route && route !== 'sessions') {
        // Split category/subcategory (e.g., "execution/features" → "execution", "features")
        const [category, subcategory] = route.split('/');
        return {
          category,
          subcategory,
          isLearningEvent: false,
          agentType,
          taskDescription,
          toolsUsed
        };
      }
    }

    // === CONTENT-BASED ROUTING (Priority 3) ===
    // Analyze content to determine category
    const contentCategory = this.analyzeContent(lastAssistantMessage, toolsUsed);

    return {
      ...contentCategory,
      isLearningEvent: false,
      agentType,
      taskDescription,
      toolsUsed
    };
  }

  /**
   * Analyze content to determine category
   * (Incorporates logic from categorize-history.ts)
   */
  private static analyzeContent(
    content: string,
    toolsUsed: string[]
  ): Pick<CategorizationResult, 'category' | 'subcategory'> {
    const lowerContent = content.toLowerCase();

    // Check for feature development
    if (
      lowerContent.includes('implement') ||
      lowerContent.includes('feature') ||
      lowerContent.includes('new functionality')
    ) {
      return { category: 'execution', subcategory: 'features' };
    }

    // Check for bug fixes
    if (
      lowerContent.includes('fix') ||
      lowerContent.includes('bug') ||
      lowerContent.includes('error')
    ) {
      return { category: 'execution', subcategory: 'bugs' };
    }

    // Check for refactoring
    if (
      lowerContent.includes('refactor') ||
      lowerContent.includes('restructure') ||
      lowerContent.includes('reorganize')
    ) {
      return { category: 'execution', subcategory: 'refactors' };
    }

    // Check for research
    if (
      lowerContent.includes('research') ||
      lowerContent.includes('investigat') ||
      lowerContent.includes('explor') ||
      toolsUsed.includes('WebSearch') ||
      toolsUsed.includes('WebFetch')
    ) {
      return { category: 'research' };
    }

    // Check for decision-making
    if (
      lowerContent.includes('decision') ||
      lowerContent.includes('architecture') ||
      lowerContent.includes('design') ||
      lowerContent.includes('plan')
    ) {
      return { category: 'decisions' };
    }

    // Default to sessions
    return { category: 'sessions' };
  }

  /**
   * Get fallback categorization when analysis fails
   */
  private static getFallbackCategorization(): CategorizationResult {
    return {
      category: 'sessions',
      isLearningEvent: false,
      taskDescription: 'Unknown task',
      toolsUsed: []
    };
  }

  /**
   * Write categorization result to markdown file
   */
  static async writeCategory(result: CategorizationResult, content: string): Promise<string> {
    // Build file path
    const basePath = getHistoryPath(result.category);
    let categoryPath = basePath;

    // Add subcategory if present
    if (result.subcategory) {
      categoryPath = basePath.replace(result.category, `${result.category}/${result.subcategory}`);
    }

    // Generate filename
    const filename = generateTimestampedFilename(result.taskDescription);
    const filePath = `${categoryPath}/${filename}`;

    // Build frontmatter
    const frontmatter: Record<string, any> = {
      timestamp: new Date().toISOString(),
      category: result.category
    };

    if (result.subcategory) {
      frontmatter.subcategory = result.subcategory;
    }

    if (result.agentType) {
      frontmatter.agent_type = result.agentType;
    }

    frontmatter.task = truncate(result.taskDescription, 100);

    if (result.toolsUsed.length > 0) {
      frontmatter.tools = result.toolsUsed;
    }

    // Build content body
    let body = `# ${truncate(result.taskDescription, 80)}\n\n`;

    // Add learning indicator
    if (result.isLearningEvent) {
      body += `> 💡 **Learning Event Detected**\n\n`;
    }

    // Add agent type if present
    if (result.agentType) {
      body += `**Agent**: ${result.agentType}\n\n`;
    }

    // Add the actual output
    body += `## Output\n\n${content}\n`;

    // Write markdown file
    writeMarkdown(filePath, frontmatter, body);

    logHook(
      'categorizer',
      `Categorized to: ${result.category}${
        result.subcategory ? '/' + result.subcategory : ''
      } (${filename})`,
      'info'
    );

    return filePath;
  }
}

/**
 * Main hook execution
 */
runHook('Stop', async event => {
  // Security validation
  if (!(await securityMiddleware(event, 'categorizer'))) {
    logHook('categorizer', 'Security validation failed', 'error');
    return;
  }

  // Load transcript
  if (!event.transcript) {
    await EventBus.loadTranscript(event);
  }

  if (!event.transcript) {
    logHook('categorizer', 'No transcript available', 'warn');
    return;
  }

  // Categorize
  const result = await UnifiedCategorizer.categorize(
    event.session_id,
    event.transcript,
    event.transcript_path || ''
  );

  // Get last assistant message for content
  const entries = EventBus.parseTranscript(event.transcript);
  const content = EventBus.getLastAssistantMessage(entries);

  // Write to history
  await UnifiedCategorizer.writeCategory(result, content);
});
