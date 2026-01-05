/**
 * Prompt Enhancement Pack - Helper Functions
 *
 * Provides TypeScript utilities for working with the claude-prompts-mcp
 * enhancement tools in PAI projects.
 *
 * @module enhancement-helpers
 * @version 2.0.0
 */

/**
 * Available enhancement tools from claude-prompts-mcp server
 */
export const ENHANCEMENT_TOOLS = {
  RESEARCH: 'enhance_research_prompt',
  CODING: 'enhance_coding_prompt',
  AGENT_TASK: 'enhance_agent_task',
  CHAIN_OF_THOUGHT: 'add_chain_of_thought',
  FEW_SHOT: 'add_few_shot_examples',
  OPTIMIZE_CLAUDE: 'optimize_for_claude',
  COMPRESS: 'compress_prompt',
  MULTI_AGENT: 'multi_agent_router'
} as const;

/**
 * Enhancement frameworks supported by the tools
 */
export const FRAMEWORKS = {
  CAGEERF: 'cageerf',
  REACT: 'react',
  FIVE_W_ONE_H: '5w1h',
  SCAMPER: 'scamper'
} as const;

/**
 * Research prompt depth levels
 */
export const DEPTH_LEVELS = {
  QUICK: 'quick',
  STANDARD: 'standard',
  EXTENSIVE: 'extensive'
} as const;

/**
 * PAI agent types that can be targeted
 */
export const AGENT_TYPES = {
  ENGINEER: 'engineer',
  ARCHITECT: 'architect',
  PENTESTER: 'pentester',
  DESIGNER: 'designer',
  RESEARCHER: 'researcher'
} as const;

/**
 * Build MCP command for research prompt enhancement
 *
 * @param shortPrompt - The short research request to enhance
 * @param depthLevel - How comprehensive the research should be
 * @param framework - Which reasoning framework to use (optional)
 * @returns MCP command string
 *
 * @example
 * ```typescript
 * const cmd = buildResearchEnhancementCommand(
 *   "JWT security best practices",
 *   DEPTH_LEVELS.EXTENSIVE,
 *   FRAMEWORKS.CAGEERF
 * );
 * // Returns: ">>enhance_research_prompt short_prompt=\"JWT security...\" depth_level=\"extensive\" framework=\"cageerf\""
 * ```
 */
export function buildResearchEnhancementCommand(
  shortPrompt: string,
  depthLevel: typeof DEPTH_LEVELS[keyof typeof DEPTH_LEVELS] = DEPTH_LEVELS.STANDARD,
  framework?: typeof FRAMEWORKS[keyof typeof FRAMEWORKS]
): string {
  let cmd = `>>${ENHANCEMENT_TOOLS.RESEARCH} short_prompt="${escapeQuotes(shortPrompt)}" depth_level="${depthLevel}"`;

  if (framework) {
    cmd += ` framework="${framework}"`;
  }

  return cmd;
}

/**
 * Build MCP command for coding prompt enhancement
 *
 * @param vagueRequest - The vague coding request to enhance
 * @param techStack - Technologies/languages involved (optional)
 * @param framework - Which reasoning framework to use (optional)
 * @returns MCP command string
 *
 * @example
 * ```typescript
 * const cmd = buildCodingEnhancementCommand(
 *   "add login feature",
 *   "Next.js, Clerk, TypeScript",
 *   FRAMEWORKS.CAGEERF
 * );
 * ```
 */
export function buildCodingEnhancementCommand(
  vagueRequest: string,
  techStack?: string,
  framework?: typeof FRAMEWORKS[keyof typeof FRAMEWORKS]
): string {
  let cmd = `>>${ENHANCEMENT_TOOLS.CODING} vague_request="${escapeQuotes(vagueRequest)}"`;

  if (techStack) {
    cmd += ` tech_stack="${escapeQuotes(techStack)}"`;
  }

  if (framework) {
    cmd += ` framework="${framework}"`;
  }

  return cmd;
}

/**
 * Build MCP command for agent task enhancement
 *
 * @param genericTask - The generic task to tailor for a specific agent
 * @param agentType - Which PAI agent will execute the task
 * @returns MCP command string
 *
 * @example
 * ```typescript
 * const cmd = buildAgentTaskEnhancementCommand(
 *   "Implement user authentication",
 *   AGENT_TYPES.ENGINEER
 * );
 * ```
 */
export function buildAgentTaskEnhancementCommand(
  genericTask: string,
  agentType: typeof AGENT_TYPES[keyof typeof AGENT_TYPES]
): string {
  return `>>${ENHANCEMENT_TOOLS.AGENT_TASK} generic_task="${escapeQuotes(genericTask)}" agent_type="${agentType}"`;
}

/**
 * Build MCP command for adding chain-of-thought reasoning
 *
 * @param basePrompt - The prompt to add ReACT framework reasoning to
 * @param complexityLevel - How detailed the reasoning should be
 * @returns MCP command string
 *
 * @example
 * ```typescript
 * const cmd = buildChainOfThoughtCommand(
 *   "Optimize database query performance",
 *   "high"
 * );
 * ```
 */
export function buildChainOfThoughtCommand(
  basePrompt: string,
  complexityLevel: 'low' | 'medium' | 'high' = 'medium'
): string {
  return `>>${ENHANCEMENT_TOOLS.CHAIN_OF_THOUGHT} base_prompt="${escapeQuotes(basePrompt)}" complexity_level="${complexityLevel}"`;
}

/**
 * Build MCP command for adding few-shot examples
 *
 * @param basePrompt - The prompt to add examples to
 * @param numExamples - How many examples to include (1-5)
 * @returns MCP command string
 *
 * @example
 * ```typescript
 * const cmd = buildFewShotCommand(
 *   "Write a TypeScript interface for a User",
 *   3
 * );
 * ```
 */
export function buildFewShotCommand(
  basePrompt: string,
  numExamples: 1 | 2 | 3 | 4 | 5 = 3
): string {
  return `>>${ENHANCEMENT_TOOLS.FEW_SHOT} base_prompt="${escapeQuotes(basePrompt)}" num_examples="${numExamples}"`;
}

/**
 * Build MCP command for optimizing prompt for Claude
 *
 * @param basePrompt - The prompt to optimize
 * @param modelVersion - Which Claude model to optimize for (optional)
 * @returns MCP command string
 *
 * @example
 * ```typescript
 * const cmd = buildOptimizeForClaudeCommand(
 *   "Analyze this codebase for security vulnerabilities",
 *   "sonnet-4"
 * );
 * ```
 */
export function buildOptimizeForClaudeCommand(
  basePrompt: string,
  modelVersion?: string
): string {
  let cmd = `>>${ENHANCEMENT_TOOLS.OPTIMIZE_CLAUDE} base_prompt="${escapeQuotes(basePrompt)}"`;

  if (modelVersion) {
    cmd += ` model_version="${modelVersion}"`;
  }

  return cmd;
}

/**
 * Build MCP command for prompt compression
 *
 * @param verbosePrompt - The verbose prompt to compress
 * @param targetReduction - Target token reduction percentage (30-70)
 * @returns MCP command string
 *
 * @example
 * ```typescript
 * const cmd = buildCompressCommand(longPrompt, 50);
 * // Targets 50% token reduction
 * ```
 */
export function buildCompressCommand(
  verbosePrompt: string,
  targetReduction: number = 40
): string {
  return `>>${ENHANCEMENT_TOOLS.COMPRESS} verbose_prompt="${escapeQuotes(verbosePrompt)}" target_reduction="${targetReduction}"`;
}

/**
 * Build MCP command for multi-agent task routing
 *
 * @param complexTask - The complex task to decompose
 * @param availableAgents - Which PAI agents are available (optional)
 * @returns MCP command string
 *
 * @example
 * ```typescript
 * const cmd = buildMultiAgentRouterCommand(
 *   "Build a full-stack authentication system with security audit",
 *   ["engineer", "architect", "pentester"]
 * );
 * ```
 */
export function buildMultiAgentRouterCommand(
  complexTask: string,
  availableAgents?: string[]
): string {
  let cmd = `>>${ENHANCEMENT_TOOLS.MULTI_AGENT} complex_task="${escapeQuotes(complexTask)}"`;

  if (availableAgents && availableAgents.length > 0) {
    cmd += ` available_agents="${availableAgents.join(',')}"`;
  }

  return cmd;
}

/**
 * Escape double quotes in command parameters
 *
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}

/**
 * Parse enhancement tool response from MCP
 *
 * @param response - Raw MCP response
 * @returns Parsed enhanced prompt
 */
export function parseEnhancementResponse(response: any): string {
  if (typeof response === 'string') {
    return response;
  }

  if (response && typeof response.content === 'string') {
    return response.content;
  }

  if (response && Array.isArray(response.content)) {
    return response.content
      .filter((item: any) => item.type === 'text')
      .map((item: any) => item.text)
      .join('\n');
  }

  throw new Error('Unable to parse enhancement response');
}

/**
 * Integration pattern: Enhance then execute with agent
 *
 * @param shortPrompt - The short prompt to enhance
 * @param agentType - Which agent will execute
 * @param enhanceFirst - Whether to enhance before execution
 * @returns Workflow description
 *
 * @example
 * ```typescript
 * // Example workflow in PAI hook:
 * // 1. Detect vague prompt
 * // 2. Enhance using research enhancement
 * // 3. Execute with researcher agent
 * const workflow = enhanceThenExecute(
 *   "JWT security",
 *   AGENT_TYPES.RESEARCHER,
 *   true
 * );
 * ```
 */
export function enhanceThenExecute(
  shortPrompt: string,
  agentType: typeof AGENT_TYPES[keyof typeof AGENT_TYPES],
  enhanceFirst: boolean = true
): {
  enhanceCommand: string;
  agentTask: string;
  workflow: string[];
} {
  const enhanceCommand = buildResearchEnhancementCommand(
    shortPrompt,
    DEPTH_LEVELS.STANDARD
  );

  const agentTask = buildAgentTaskEnhancementCommand(
    shortPrompt,
    agentType
  );

  const workflow = enhanceFirst
    ? ['enhance_prompt', 'execute_with_agent', 'collect_results']
    : ['execute_with_agent', 'collect_results'];

  return {
    enhanceCommand,
    agentTask,
    workflow
  };
}
