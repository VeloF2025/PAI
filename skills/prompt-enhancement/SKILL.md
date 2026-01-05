---
name: prompt-enhancement
description: |
  Advanced prompt enhancement system for PAI using claude-prompts-mcp server.

  AUTOMATIC ACTIVATION: Use whenever you need to enhance prompts for agents, research, coding, or multi-agent tasks.

  Provides 8 specialized enhancement tools:
  - enhance_research_prompt: Transform short research requests into comprehensive specs
  - enhance_coding_prompt: Convert vague coding requests into detailed implementation specs
  - enhance_agent_task: Tailor tasks for specific PAI agents (engineer, architect, pentester, designer)
  - add_chain_of_thought: Add ReACT framework reasoning steps
  - add_few_shot_examples: Include relevant examples for better results
  - optimize_for_claude: Apply Anthropic best practices for Claude models
  - compress_prompt: Reduce tokens while preserving effectiveness
  - multi_agent_router: Decompose complex tasks for parallel agent execution

  All tools available via MCP: mcp_claude-prompts__prompt_engine
---

# Prompt Enhancement System - PAI Global Skill

## Overview

The Prompt Enhancement System provides sophisticated prompt optimization capabilities for all PAI operations. It uses the `claude-prompts-mcp` server to transform short, vague prompts into comprehensive, effective specifications.

## When to Use This Skill

**AUTOMATIC ACTIVATION** when:
- User provides a short/vague prompt for research, coding, or agents
- Multi-agent task requires decomposition and routing
- Prompt needs optimization for Claude models
- Chain-of-thought reasoning would improve results
- Few-shot examples would help clarify expectations
- Token reduction needed for cost optimization

## Available Enhancement Tools

### 1. **enhance_research_prompt**

**Purpose:** Transform short research requests into comprehensive research specifications

**Use When:**
- User asks for research with minimal detail
- Research needs structure and methodology
- Targeting perplexity-researcher, claude-researcher, or gemini-researcher

**MCP Call:**
```typescript
mcp_claude-prompts__prompt_engine({
  promptId: "enhance_research_prompt",
  short_prompt: "research JWT security best practices",
  agent_type: "perplexity-researcher",  // optional
  depth_level: "standard"  // quick | standard | extensive
})
```

**Output:** Structured research prompt with context, objectives, methodology, deliverables, quality criteria

---

### 2. **enhance_coding_prompt**

**Purpose:** Convert vague coding requests into detailed implementation specifications

**Use When:**
- User provides minimal coding requirements
- Implementation needs clarity on quality standards
- Zero-tolerance policies must be enforced

**MCP Call:**
```typescript
mcp_claude-prompts__prompt_engine({
  promptId: "enhance_coding_prompt",
  short_prompt: "add dark mode toggle to settings",
  language: "TypeScript",  // optional
  project_context: "Next.js app with Tailwind CSS"  // optional
})
```

**Output:** Complete spec with functional requirements, technical constraints, quality standards (>95% coverage, zero errors), success criteria

---

### 3. **enhance_agent_task**

**Purpose:** Tailor task descriptions for specific PAI agents

**Use When:**
- Task needs to be assigned to specialized agent
- Role-specific context and deliverables required
- Agent is: engineer, architect, pentester, designer

**MCP Call:**
```typescript
mcp_claude-prompts__prompt_engine({
  promptId: "enhance_agent_task",
  short_task: "review authentication implementation",
  agent_role: "pentester",  // required
  project_files: "src/auth/* documentation"  // optional
})
```

**Output:** Role-specific task with deliverables (e.g., pentester → vulnerability report, PoC exploits, remediation)

---

### 4. **add_chain_of_thought**

**Purpose:** Add ReACT framework chain-of-thought reasoning

**Use When:**
- Complex task needs explicit reasoning steps
- Debugging or analysis requires systematic approach
- Output quality improves with transparent thinking

**MCP Call:**
```typescript
mcp_claude-prompts__prompt_engine({
  promptId: "add_chain_of_thought",
  original_prompt: "optimize database query performance",
  complexity: "complex"  // simple | medium | complex
})
```

**Output:** Prompt enhanced with Thought → Action → Observation → Thought cycles

---

### 5. **add_few_shot_examples**

**Purpose:** Add relevant few-shot examples to prompts

**Use When:**
- Task benefits from concrete examples
- Pattern matching improves output quality
- Clarifying expected format/style

**MCP Call:**
```typescript
mcp_claude-prompts__prompt_engine({
  promptId: "add_few_shot_examples",
  base_prompt: "write API documentation for endpoints",
  task_type: "coding",  // research | coding | analysis | design
  num_examples: 3  // 1-5, optional
})
```

**Output:** Prompt with 2-3 high-quality examples showing input/output patterns

---

### 6. **optimize_for_claude**

**Purpose:** Optimize prompts using Anthropic's best practices

**Use When:**
- Prompt needs Claude-specific optimization
- Targeting specific Claude model (Sonnet/Opus/Haiku)
- Clarity, structure, or effectiveness needs improvement

**MCP Call:**
```typescript
mcp_claude-prompts__prompt_engine({
  promptId: "optimize_for_claude",
  original_prompt: "analyze code for security issues",
  claude_model: "sonnet",  // sonnet | opus | haiku, optional
  optimization_goals: "clarity, structure"  // optional
})
```

**Output:** Claude-optimized prompt with XML tags, clear structure, model-specific enhancements

**Key Optimizations:**
- XML tags for structure (`<context>`, `<instructions>`, `<examples>`)
- Clear role assignment
- Front-loaded critical information
- Explicit constraints and output format
- Thinking instructions (model-dependent)

---

### 7. **compress_prompt**

**Purpose:** Reduce token count while preserving meaning (SAMMO-inspired)

**Use When:**
- Prompt is verbose and needs compression
- Token/cost optimization required
- Maintaining effectiveness while reducing length

**MCP Call:**
```typescript
mcp_claude-prompts__prompt_engine({
  promptId: "compress_prompt",
  verbose_prompt: "[long verbose prompt]",
  target_reduction: 0.5  // 0.3-0.5 for 30-50% reduction
})
```

**Output:** Compressed prompt with 30-50% fewer tokens, analysis of changes made

---

### 8. **multi_agent_router**

**Purpose:** Decompose complex tasks into parallel sub-tasks for multiple PAI agents

**Use When:**
- Task is complex and can benefit from parallel execution
- Multiple specialized agents needed
- Need optimization of agent selection and prompt routing

**MCP Call:**
```typescript
mcp_claude-prompts__prompt_engine({
  promptId: "multi_agent_router",
  complex_task: "build authentication system with OAuth and 2FA",
  available_agents: "architect,engineer,pentester,code-reviewer"  // optional
})
```

**Output:** Complete routing plan with:
- Task decomposition strategy
- Agent selection with rationale
- Optimized prompt for each agent
- Execution phases (parallel/sequential)
- Integration strategy
- Ready-to-use Task tool calls

---

## Integration Patterns

### Pattern 1: Auto-Enhancement Before Agent Calls

```typescript
// User provides short prompt
const userPrompt = "research container security";

// 1. Enhance the prompt
const enhanced = await mcp_claude-prompts__prompt_engine({
  promptId: "enhance_research_prompt",
  short_prompt: userPrompt,
  agent_type: "perplexity-researcher",
  depth_level: "extensive"
});

// 2. Pass enhanced prompt to agent
const result = await Task({
  subagent_type: "perplexity-researcher",
  prompt: enhanced.output
});
```

### Pattern 2: Multi-Stage Enhancement Pipeline

```typescript
// User: "make the code better"

// Stage 1: Clarify the coding task
const clarified = await mcp_claude-prompts__prompt_engine({
  promptId: "enhance_coding_prompt",
  short_prompt: "improve code quality",
  language: "TypeScript"
});

// Stage 2: Add reasoning steps
const withReasoning = await mcp_claude-prompts__prompt_engine({
  promptId: "add_chain_of_thought",
  original_prompt: clarified.output,
  complexity: "medium"
});

// Stage 3: Optimize for Claude
const optimized = await mcp_claude-prompts__prompt_engine({
  promptId: "optimize_for_claude",
  original_prompt: withReasoning.output,
  claude_model: "sonnet"
});

// Stage 4: Add examples
const final = await mcp_claude-prompts__prompt_engine({
  promptId: "add_few_shot_examples",
  base_prompt: optimized.output,
  task_type: "coding",
  num_examples: 2
});

// Execute with engineer agent
await Task({ subagent_type: "engineer", prompt: final.output });
```

### Pattern 3: Automatic Multi-Agent Routing

```typescript
// User: "implement user authentication system"

// 1. Route to multiple agents
const routing = await mcp_claude-prompts__prompt_engine({
  promptId: "multi_agent_router",
  complex_task: "implement complete user authentication with OAuth, 2FA, and session management"
});

// 2. Extract agent prompts from routing plan
// 3. Execute agents in parallel/sequential based on plan
// 4. Integrate outputs

// Example: routing.output contains ready-to-use Task calls:
// - architect: Design auth architecture (Phase 1)
// - pentester: Security audit design (Phase 1, parallel)
// - engineer: Implementation (Phase 2, after architect)
// - code-reviewer: Code review (Phase 3, after engineer)
```

---

## Quality Gates

All enhancement tools include quality gates:
- **content-structure**: Proper formatting and organization
- **technical-accuracy**: Correct technical information
- **security-awareness**: Security considerations (coding prompts)
- **code-quality**: Quality standards (development prompts)

---

## Framework Integration

Enhancement tools leverage thinking frameworks:
- **CAGEERF**: Comprehensive structured approach (Context, Analysis, Goals, Execution, Evaluation, Refinement, Framework)
- **ReACT**: Reasoning + Acting pattern (Thought → Action → Observation cycles)
- **5W1H**: Systematic analysis (Who, What, When, Where, Why, How)
- **SCAMPER**: Creative problem-solving

Framework selection is automatic based on prompt type and complexity.

---

## Performance Characteristics

| Execution Mode | Latency | Use Case |
|----------------|---------|----------|
| Prompt | <100ms | Fast variable substitution |
| Template | <500ms | Framework enhancement |
| Chain | 1-5s | Multi-step LLM workflows |

---

## Configuration

**MCP Server Location:** `C:/Users/HeinvanVuuren/claude-prompts-mcp/server/`

**Configuration File:** `~/.claude/mcp.json`

**PAI Prompts Location:** `~/claude-prompts-mcp/server/prompts/pai/`

**Hot-Reload:** Prompts can be updated without server restart

---

## Troubleshooting

### MCP Tools Not Available

1. Check MCP server configuration: `cat ~/.claude/mcp.json`
2. Verify server builds: `cd ~/claude-prompts-mcp/server && npm run build`
3. Restart Claude Code to reload MCP servers

### Prompts Not Loading

1. Verify PAI prompts exist: `ls ~/claude-prompts-mcp/server/prompts/pai/`
2. Check config: `cat ~/claude-prompts-mcp/server/prompts/promptsConfig.json`
3. Test startup: `cd ~/claude-prompts-mcp/server && node dist/index.js --startup-test`

### Enhancement Not Working

1. Verify MCP tool call syntax
2. Check required arguments are provided
3. Review MCP server logs: `~/claude-prompts-mcp/server/logs/`

---

## Examples

### Example 1: Research Enhancement

**Input:**
```
User: "research GraphQL performance"
```

**Enhancement Call:**
```typescript
mcp_claude-prompts__prompt_engine({
  promptId: "enhance_research_prompt",
  short_prompt: "research GraphQL performance optimization",
  depth_level: "extensive"
})
```

**Enhanced Output:**
```markdown
# Research Request: GraphQL Performance Optimization

## Context
GraphQL has become widely adopted for API development, but performance
optimization requires understanding query complexity, N+1 problems,
caching strategies, and batching techniques.

## Research Objectives
1. Identify common GraphQL performance bottlenecks
2. Analyze DataLoader and batching strategies
3. Evaluate caching approaches (CDN, Redis, in-memory)
4. Investigate query complexity analysis tools
5. Compare performance vs REST APIs

## Scope
- **Included:** Server-side optimization, client-side caching, query analysis
- **Excluded:** GraphQL subscription performance, federation performance
- **Time Period:** Focus on current best practices (2024-2025)

[... full structured research specification ...]
```

### Example 2: Multi-Agent Routing

**Input:**
```
User: "implement secure authentication"
```

**Routing Call:**
```typescript
mcp_claude-prompts__prompt_engine({
  promptId: "multi_agent_router",
  complex_task: "implement secure user authentication with social login and 2FA"
})
```

**Routing Output:**
```markdown
# Task Routing Analysis

## Parallel Execution Plan

### Agent 1: architect
**Sub-Task:** Design authentication architecture
**Rationale:** Needs system design expertise
**Priority:** High

**Optimized Prompt:**
[Full architect prompt with PRD requirements, security specs, OAuth flow design]

---

### Agent 2: pentester (Parallel with architect)
**Sub-Task:** Security audit of authentication design
**Rationale:** Identify vulnerabilities early
**Priority:** High

**Optimized Prompt:**
[Full pentester prompt for threat modeling, OWASP coverage, attack vectors]

---

### Agent 3: engineer (After architect completes)
**Sub-Task:** Implement OAuth integration and 2FA
**Dependencies:** Depends on architect's design
**Priority:** High

**Optimized Prompt:**
[Full engineer prompt with implementation specs, quality gates, testing requirements]

[... continues with integration strategy and Task tool calls ...]
```

---

## Best Practices

1. **Use enhance_research_prompt for all research tasks** - Dramatically improves research quality
2. **Apply enhance_coding_prompt for vague feature requests** - Ensures quality standards are enforced
3. **Route complex tasks through multi_agent_router** - Maximizes parallel execution efficiency
4. **Optimize critical prompts with optimize_for_claude** - Leverage Anthropic best practices
5. **Add chain-of-thought for complex reasoning** - Improves output quality and transparency
6. **Compress verbose prompts for cost savings** - Maintain effectiveness while reducing tokens

---

## Version History

- **v1.0.0** (2025-11-15): Initial implementation with 8 enhancement tools
  - MCP server integration
  - PAI-specific prompt templates
  - Quality gates and framework integration

---

**Status:** ✅ Production Ready - Globally available in PAI

**Location:** `~/.claude/skills/prompt-enhancement/`

**MCP Server:** `claude-prompts` (auto-starts with Claude Code)
