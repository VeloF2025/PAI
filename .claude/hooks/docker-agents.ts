#!/usr/bin/env bun

/**
 * Docker Agents Hook - PostToolUse Integration
 * ============================================
 *
 * Automatically triggers Docker Code Validator after file edits.
 * Week 4: Docker Agent integration
 */

interface ToolUseEvent {
  tool_name: string;
  tool_input: {
    file_path?: string;
    command?: string;
    [key: string]: any;
  };
  session_id?: string;
}

interface HookResult {
  allowed: boolean;
  message?: string;
  metadata?: Record<string, any>;
}

const GATEWAY_URL = process.env.DOCKER_AGENT_GATEWAY_URL || 'http://localhost:8100';
const ENABLE_AUTO_VALIDATION = process.env.ENABLE_AUTO_VALIDATION !== 'false'; // Default: enabled

/**
 * PostToolUse hook - Triggers after tool execution
 */
export async function postToolUse(
  toolName: string,
  toolInput: Record<string, any>,
  toolOutput: any
): Promise<HookResult> {
  // Only process file edit operations
  const FILE_EDIT_TOOLS = ['Edit', 'Write', 'MultiEdit'];
  if (!FILE_EDIT_TOOLS.includes(toolName)) {
    return { allowed: true };
  }

  // Skip if auto-validation is disabled
  if (!ENABLE_AUTO_VALIDATION) {
    console.log('[Docker Agents] Auto-validation disabled');
    return { allowed: true };
  }

  const filePath = toolInput.file_path;
  const sessionId = process.env.CLAUDE_SESSION_ID || 'unknown';

  console.log(`\n🔍 [Docker Agents] Triggering validation after ${toolName} on ${filePath}`);

  try {
    // Extract project path from file path
    // Example: C:/Jarvis/AI Workspace/Personal_AI_Infrastructure/src/file.ts
    //          -> Personal_AI_Infrastructure
    const projectPath = extractProjectPath(filePath);

    if (!projectPath) {
      console.log('[Docker Agents] Could not extract project path, skipping validation');
      return { allowed: true };
    }

    // Trigger validation via gateway (async, don't wait for result)
    triggerValidationAsync(projectPath, sessionId, toolName);

    return {
      allowed: true,
      message: `Validation triggered for ${projectPath}`,
      metadata: {
        validator: 'docker-code-validator',
        project: projectPath,
        trigger: 'post-tool-use'
      }
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Docker Agents] Hook error: ${errorMessage}`);

    // Don't block the tool use even if validation trigger fails
    return {
      allowed: true,
      message: 'Validation trigger failed (non-blocking)',
      metadata: { error: errorMessage }
    };
  }
}

/**
 * Extract project path from file path
 */
function extractProjectPath(filePath: string): string | null {
  if (!filePath) return null;

  // Normalize path separators
  const normalized = filePath.replace(/\\/g, '/');

  // Match pattern: /AI Workspace/<project-name>/
  const match = normalized.match(/\/AI Workspace\/([^\/]+)\//);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback: try to get directory name
  const parts = normalized.split('/');
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }

  return null;
}

/**
 * Trigger validation asynchronously (fire-and-forget)
 */
async function triggerValidationAsync(
  projectPath: string,
  sessionId: string,
  trigger: string
): Promise<void> {
  // Don't await - fire and forget
  fetch(`${GATEWAY_URL}/api/agents/validator/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      path: projectPath,
      trigger: `post-tool-use:${trigger}`,
      session_id: sessionId
    })
  })
    .then(async (response) => {
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ [Docker Agents] Validation triggered: ${result.summary || 'OK'}`);

        // If validation failed, log errors
        if (!result.success && result.errors?.length > 0) {
          console.warn(`\n⚠️  [Validation] ${result.errors.length} issues found:`);
          result.errors.slice(0, 5).forEach((err: any) => {
            console.warn(`   - [${err.type}] ${err.message}`);
          });
          if (result.errors.length > 5) {
            console.warn(`   ... and ${result.errors.length - 5} more`);
          }
        }
      } else {
        console.warn(`[Docker Agents] Validation request failed: ${response.status}`);
      }
    })
    .catch((error) => {
      console.warn(`[Docker Agents] Validation trigger error: ${error.message}`);
    });
}

/**
 * Hook configuration
 */
export const hookConfig = {
  name: 'docker-agents-validation',
  version: '1.0.0',
  description: 'Triggers Docker Code Validator after file edits',
  triggers: ['post-tool-use'],
  toolNames: ['Edit', 'Write', 'MultiEdit'],
  blocking: false, // Non-blocking - doesn't prevent tool use
  priority: 50, // Medium priority
};

export default {
  postToolUse,
  hookConfig
};
