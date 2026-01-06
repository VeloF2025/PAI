/**
 * kai-hook-system - Event Bus
 *
 * Core event processing pipeline for systematic hook management.
 * Provides type-safe event parsing, validation, and execution orchestration.
 *
 * Based on Dan Miessler's kai-hook-system architecture.
 */

import { readFileSync } from 'fs';

/**
 * Supported Claude Code hook event types
 */
export type KaiEventType =
  | 'SessionStart'
  | 'SessionEnd'
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Stop'
  | 'SubagentStop'
  | 'PreCompact'
  | 'UserPromptSubmit';

/**
 * Structured event data from Claude Code hooks
 */
export interface KaiEvent {
  type: KaiEventType;
  timestamp: string;
  session_id: string;
  payload: Record<string, any>;
  transcript_path?: string;
  transcript?: string; // Loaded on-demand
  metadata?: Record<string, any>;
}

/**
 * Transcript entry format (JSONL)
 */
export interface TranscriptEntry {
  type: 'user' | 'assistant' | 'system';
  timestamp?: string;
  message?: {
    role?: string;
    content?: Array<{
      type: 'text' | 'tool_use' | 'tool_result';
      text?: string;
      name?: string;
      input?: any;
      output?: any;
    }>;
  };
}

/**
 * Hook handler function signature
 */
export type HookHandler = (event: KaiEvent) => Promise<void>;

/**
 * EventBus - Core event processing system
 */
export class EventBus {
  /**
   * Parse stdin data into structured KaiEvent
   */
  static async parseEvent(eventType?: KaiEventType): Promise<KaiEvent> {
    try {
      // Read from stdin
      const stdinData = await Bun.stdin.text();
      const rawData = JSON.parse(stdinData);

      // Extract common fields
      const event: KaiEvent = {
        type: eventType || this.detectEventType(rawData),
        timestamp: new Date().toISOString(),
        session_id: rawData.session_id || rawData.sessionId || 'unknown',
        payload: rawData,
        transcript_path: rawData.transcript_path || rawData.transcriptPath,
        metadata: {}
      };

      return event;
    } catch (error) {
      // Fallback event on parse error
      return {
        type: eventType || 'Stop',
        timestamp: new Date().toISOString(),
        session_id: 'parse-error',
        payload: {},
        metadata: { error: String(error) }
      };
    }
  }

  /**
   * Detect event type from payload structure
   */
  private static detectEventType(payload: any): KaiEventType {
    // Check for explicit event_type field
    if (payload.event_type || payload.eventType) {
      return payload.event_type || payload.eventType;
    }

    // Infer from payload structure
    if (payload.transcript_path) {
      return 'Stop'; // Most common transcript-based event
    }

    if (payload.tool_name) {
      return 'PreToolUse';
    }

    return 'Stop'; // Default fallback
  }

  /**
   * Validate event structure
   */
  static validateEvent(event: KaiEvent): boolean {
    if (!event.type || !event.timestamp || !event.session_id) {
      return false;
    }

    // Type-specific validation
    if (event.type === 'Stop' || event.type === 'SubagentStop') {
      // Stop events should have transcript path
      if (!event.transcript_path) {
        console.error('[kai-event-bus] Stop event missing transcript_path');
        return false;
      }
    }

    return true;
  }

  /**
   * Load transcript from file if available
   */
  static async loadTranscript(event: KaiEvent): Promise<string> {
    if (!event.transcript_path) {
      return '';
    }

    try {
      const content = readFileSync(event.transcript_path, 'utf-8');
      event.transcript = content; // Cache in event
      return content;
    } catch (error) {
      console.error('[kai-event-bus] Failed to load transcript:', error);
      return '';
    }
  }

  /**
   * Parse transcript JSONL into structured entries
   */
  static parseTranscript(content: string): TranscriptEntry[] {
    const entries: TranscriptEntry[] = [];
    const lines = content.trim().split('\n');

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        entries.push(entry);
      } catch {
        // Skip invalid JSON lines
      }
    }

    return entries;
  }

  /**
   * Execute hook pipeline with error handling
   */
  static async execute(
    handlers: HookHandler[],
    event: KaiEvent
  ): Promise<void> {
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error('[kai-event-bus] Hook handler error:', error);
        // Continue execution even if one handler fails
      }
    }
  }

  /**
   * Get last assistant message from transcript
   */
  static getLastAssistantMessage(entries: TranscriptEntry[]): string {
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.type === 'assistant' && entry.message?.content) {
        const textContent = entry.message.content
          .filter(c => c.type === 'text')
          .map(c => c.text)
          .join('\n');

        if (textContent) {
          return textContent;
        }
      }
    }
    return '';
  }

  /**
   * Get last user message from transcript
   */
  static getLastUserMessage(entries: TranscriptEntry[]): string {
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.type === 'user' && entry.message?.content) {
        for (const content of entry.message.content) {
          if (content.type === 'text' && content.text) {
            return content.text;
          }
        }
      }
    }
    return '';
  }

  /**
   * Extract all tool calls from transcript
   */
  static extractToolCalls(entries: TranscriptEntry[]): Array<{
    name: string;
    input: any;
  }> {
    const toolCalls: Array<{ name: string; input: any }> = [];

    for (const entry of entries) {
      if (entry.type === 'assistant' && entry.message?.content) {
        for (const content of entry.message.content) {
          if (content.type === 'tool_use') {
            toolCalls.push({
              name: content.name || 'unknown',
              input: content.input || {}
            });
          }
        }
      }
    }

    return toolCalls;
  }

  /**
   * Detect agent type from Task tool invocations
   */
  static detectAgentType(entries: TranscriptEntry[]): string | undefined {
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.type === 'assistant' && entry.message?.content) {
        for (const content of entry.message.content) {
          if (
            content.type === 'tool_use' &&
            content.name === 'Task' &&
            content.input?.subagent_type
          ) {
            return content.input.subagent_type;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Extract task description from transcript
   */
  static extractTaskDescription(entries: TranscriptEntry[]): string {
    // Try to get from last Task tool invocation
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.type === 'assistant' && entry.message?.content) {
        for (const content of entry.message.content) {
          if (
            content.type === 'tool_use' &&
            content.name === 'Task' &&
            content.input?.prompt
          ) {
            return content.input.prompt;
          }
        }
      }
    }

    // Fall back to last user message
    return this.getLastUserMessage(entries);
  }
}

/**
 * Convenience function for typical hook pattern
 */
export async function runHook(
  eventType: KaiEventType,
  handler: HookHandler
): Promise<void> {
  try {
    // Parse event from stdin
    const event = await EventBus.parseEvent(eventType);

    // Validate event
    if (!EventBus.validateEvent(event)) {
      console.error('[kai-hook] Invalid event structure');
      process.exit(1);
    }

    // Load transcript if needed
    if (event.transcript_path) {
      await EventBus.loadTranscript(event);
    }

    // Execute handler
    await handler(event);

    process.exit(0);
  } catch (error) {
    console.error('[kai-hook] Execution error:', error);
    process.exit(1);
  }
}
