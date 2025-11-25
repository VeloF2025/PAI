---
name: prompting
description: |
  Prompt engineering standards and context engineering principles for AI agents based on Anthropic best practices.
  Covers clarity, structure, progressive discovery, and optimization for signal-to-noise ratio.

  USE WHEN user asks about prompt engineering, context engineering, AI agent design, prompt optimization,
  or how to write effective prompts.

  === MCP AUTO-INVOCATION ===
  **context7**: Use for latest prompt engineering documentation from Anthropic
  **memory**: Store effective prompt patterns learned, recall past optimizations
  **sequential-thinking**: Use for complex prompt design with multiple constraints

triggers:
  - prompt engineering
  - context engineering
  - write prompts
  - optimize prompts
  - agent design
  - prompt structure
---

# Prompting Skill

## When to Activate This Skill
- Prompt engineering questions
- Context engineering guidance
- AI agent design
- Prompt structure help
- Best practices for LLM prompts
- Agent configuration

## Core Philosophy
**Context engineering** = Curating optimal set of tokens during LLM inference

**Primary Goal:** Find smallest possible set of high-signal tokens that maximize desired outcomes

## Key Principles

### 1. Context is Finite Resource
- LLMs have limited "attention budget"
- Performance degrades as context grows
- Every token depletes capacity
- Treat context as precious

### 2. Optimize Signal-to-Noise
- Clear, direct language over verbose explanations
- Remove redundant information
- Focus on high-value tokens

### 3. Progressive Discovery
- Use lightweight identifiers vs full data dumps
- Load detailed info dynamically when needed
- Just-in-time information loading

## Markdown Structure Standards

Use clear semantic sections:
- **Background Information**: Minimal essential context
- **Instructions**: Imperative voice, specific, actionable
- **Examples**: Show don't tell, concise, representative
- **Constraints**: Boundaries, limitations, success criteria

## Writing Style

### Clarity Over Completeness
✅ Good: "Validate input before processing"
❌ Bad: "You should always make sure to validate..."

### Be Direct
✅ Good: "Use calculate_tax tool with amount and jurisdiction"
❌ Bad: "You might want to consider using..."

### Use Structured Lists
✅ Good: Bulleted constraints
❌ Bad: Paragraph of requirements

## Context Management

### Just-in-Time Loading
Don't load full data dumps - use references and load when needed

### Structured Note-Taking
Persist important info outside context window

### Sub-Agent Architecture
Delegate subtasks to specialized agents with minimal context

## Best Practices Checklist
- [ ] Uses Markdown headers for organization
- [ ] Clear, direct, minimal language
- [ ] No redundant information
- [ ] Actionable instructions
- [ ] Concrete examples
- [ ] Clear constraints
- [ ] Just-in-time loading when appropriate

## Anti-Patterns
❌ Verbose explanations
❌ Historical context dumping
❌ Overlapping tool definitions
❌ Premature information loading
❌ Vague instructions ("might", "could", "should")

## Supplementary Resources
For full standards: `read ${PAI_DIR}/skills/prompting/CLAUDE.md`

## Based On
Anthropic's "Effective Context Engineering for AI Agents"

---

## 🔧 MCP Integration (Auto-Invoked)

### context7 MCP - Latest Documentation
**Auto-invoked when:**
- Looking up Anthropic's latest prompt engineering guides
- Checking Claude API documentation
- Researching MCP protocol specifications

**Usage:** "use context7 for Anthropic prompt engineering best practices"

### memory MCP - Pattern Library
**Auto-invoked to:**
- Store effective prompt patterns discovered
- Recall successful prompt structures from past sessions
- Track which optimizations worked for specific use cases

### sequential-thinking MCP - Complex Design
**Auto-invoked when:**
- Designing prompts with multiple conflicting constraints
- Balancing token efficiency vs completeness
- Optimizing agent architectures with many components
