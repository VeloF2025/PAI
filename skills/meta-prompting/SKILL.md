---
name: meta-prompting
description: |
  TÂCHES Meta-Prompting System - Two-phase prompt clarification and execution orchestration.

  Automatically transforms vague user requests into specification-grade prompts through
  structured clarification, then executes in fresh isolated contexts.

  AUTOMATIC ACTIVATION: Triggered by UserPromptSubmit hook for vague prompts (<50 words,
  missing requirements, vague terms).

  Two-Phase Architecture:
  - Phase 1 (Analysis): 10-point clarity assessment → clarification questions → specification
  - Phase 2 (Execution): Fresh context spawning → parallel/sequential execution → archival

  Manual Triggers: "clarify", "meta-prompt", "specify requirements", "what do you need to know"
---

# TÂCHES Meta-Prompting System

## Overview

The TÂCHES (Two-phase Architecture for Clarification, Handling, Execution, and Specification) meta-prompting system transforms vague user requests into rigorous, specification-grade prompts before execution.

**Core Innovation**: Rather than iterating 20+ times with vague prompts, TÂCHES generates comprehensive specifications through structured questioning, then executes in fresh isolated contexts.

## Architecture

```
User Request (Vague)
    ↓
[Phase 1: ANALYSIS]
├─ 10-Point Clarity Assessment
├─ Gap Identification
├─ Clarification Questions Generation
├─ User Response Collection
└─ Specification-Grade Prompt Creation
    ↓
[PAI Enhancement Layer]
├─ enhance_research_prompt (if research task)
├─ enhance_coding_prompt (if development task)
├─ enhance_agent_task (if agent orchestration)
├─ optimize_for_claude (all tasks)
└─ add_chain_of_thought (complex tasks)
    ↓
[Phase 2: EXECUTION]
├─ Fresh Context Spawning (Task tool delegation)
├─ Parallel/Sequential Execution Strategy
├─ Sub-Agent Orchestration
└─ Result Integration
    ↓
[ARCHIVAL]
├─ Save to ~/.claude/prompts/completed/
├─ Add metadata (execution time, success, agent used)
└─ Feed into PAI learning system
```

## When to Use

### Automatic Activation (via Hook)
**Trigger**: UserPromptSubmit hook detects vague prompts

**Detection Criteria**:
- Prompt is short (<50 words)
- Contains vague terms: "improve", "fix", "better", "optimize", "help", "update"
- Missing key requirements (no file paths, no specific constraints, no success criteria)
- Low specificity score (<6/10 on clarity assessment)

**Action**: Automatically run Phase 1 (Analysis) to gather requirements

### Manual Activation
**User Says**:
- "clarify what you need"
- "what information do you need?"
- "help me specify the requirements"
- "meta-prompt this task"
- "what questions do you have?"

**Use When**:
- User recognizes their request is vague
- Complex task needs structured planning
- Multiple approaches possible (need decision)
- Requirements gathering needed before implementation

## Phase 1: Analysis (10-Point Clarity Framework)

### Clarity Dimensions (Scored 0-10)

1. **Objective Clarity** (0-10)
   - Is the goal explicitly stated?
   - Can success be measured?
   - Is the desired outcome clear?

2. **Scope Definition** (0-10)
   - Are boundaries defined (what's included/excluded)?
   - Is the scale clear (one file vs entire codebase)?
   - Are dependencies identified?

3. **Context Completeness** (0-10)
   - Is relevant background provided?
   - Are constraints mentioned?
   - Is current state described?

4. **Technical Specificity** (0-10)
   - Are technologies/frameworks specified?
   - Are versions mentioned when relevant?
   - Are patterns/architectures described?

5. **Quality Standards** (0-10)
   - Are success criteria defined?
   - Are quality gates mentioned?
   - Is testing approach specified?

6. **Constraints & Limitations** (0-10)
   - Are resource constraints mentioned?
   - Are time constraints clear?
   - Are technical limitations noted?

7. **Input/Output Definition** (0-10)
   - Are input formats specified?
   - Are output formats defined?
   - Are data structures described?

8. **Priority & Urgency** (0-10)
   - Is priority clear?
   - Is timeline specified?
   - Are trade-offs mentioned?

9. **Execution Strategy** (0-10)
   - Is approach preference stated?
   - Are execution phases defined?
   - Is review process mentioned?

10. **Verification Method** (0-10)
    - How will success be verified?
    - Are test cases provided?
    - Is validation approach clear?

### Scoring Interpretation

- **0-2**: Critical gap - cannot proceed without clarification
- **3-5**: Significant gap - high risk of misunderstanding
- **6-7**: Moderate clarity - some clarification helpful
- **8-9**: High clarity - minor clarification only
- **10**: Perfect clarity - no clarification needed

**Overall Score** = Average of all 10 dimensions

### Clarification Question Generation

Based on low-scoring dimensions, generate targeted questions:

**Template**:
```markdown
I need clarification on several points to ensure I deliver exactly what you need:

## Critical Questions (Scores 0-2):
1. [Dimension]: [Specific question based on gap]
2. [Dimension]: [Specific question based on gap]

## Important Questions (Scores 3-5):
3. [Dimension]: [Specific question based on gap]
4. [Dimension]: [Specific question based on gap]

## Optional Clarifications (Scores 6-7):
5. [Dimension]: [Specific question for confirmation]

Please answer the critical questions at minimum. The more detail you provide, the better the result will be.
```

### Complexity Categorization

After clarification, categorize task complexity:

- **Simple** (1-3): Single file, clear requirements, standard patterns
  - Execution: Single agent, minimal thinking budget
  - Example: "Fix TypeScript error in file.ts line 45"

- **Moderate** (4-6): Multiple files, some ambiguity, custom logic needed
  - Execution: Single agent, standard thinking budget, chain-of-thought
  - Example: "Refactor authentication to use JWT instead of sessions"

- **Complex** (7-8): Cross-cutting concerns, multiple approaches, integration needed
  - Execution: Multiple agents, extended thinking, sequential execution
  - Example: "Implement OAuth2 with multiple providers and 2FA"

- **Very Complex** (9-10): System-wide changes, architectural decisions, multi-phase work
  - Execution: Multi-agent orchestration, parallel execution, iterative refinement
  - Example: "Migrate from monolith to microservices architecture"

## Phase 2: Execution (Fresh Context Spawning)

### Execution Strategies

#### **Single Agent (Simple/Moderate Tasks)**
```typescript
// Spawn single agent in fresh context
await Task({
  subagent_type: "engineer",  // or appropriate agent
  prompt: enhancedPrompt,
  description: "Implement [task]",
  model: "sonnet"  // or "haiku" for simple tasks
});
```

#### **Sequential Execution (Complex Tasks)**
```typescript
// Phase 1: Architecture
const architectureDesign = await Task({
  subagent_type: "architect",
  prompt: enhancedArchitecturePrompt,
  description: "Design system architecture"
});

// Phase 2: Implementation (depends on Phase 1)
const implementation = await Task({
  subagent_type: "engineer",
  prompt: enhancedImplementationPrompt + "\n\nArchitecture:\n" + architectureDesign,
  description: "Implement based on architecture"
});

// Phase 3: Review (depends on Phase 2)
const review = await Task({
  subagent_type: "code-quality-reviewer",
  prompt: "Review implementation for quality and adherence to architecture",
  description: "Code review and quality validation"
});
```

#### **Parallel Execution (Very Complex Tasks)**
```typescript
// Spawn multiple agents in parallel for independent work
const [
  architectureDesign,
  securityAudit,
  performanceAnalysis
] = await Promise.all([
  Task({
    subagent_type: "architect",
    prompt: enhancedArchitecturePrompt,
    description: "Design architecture"
  }),
  Task({
    subagent_type: "security-auditor",
    prompt: enhancedSecurityPrompt,
    description: "Security threat modeling"
  }),
  Task({
    subagent_type: "performance-optimizer",
    prompt: enhancedPerformancePrompt,
    description: "Performance requirements analysis"
  })
]);

// Then integrate results
const integration = await Task({
  subagent_type: "engineer",
  prompt: `Implement based on:\n\nArchitecture:\n${architectureDesign}\n\nSecurity:\n${securityAudit}\n\nPerformance:\n${performanceAnalysis}`,
  description: "Integration implementation"
});
```

### Context Isolation Benefits

**Why Fresh Contexts Matter**:
1. **Prevents Context Bloat**: Main conversation stays lean (clarification only)
2. **Focused Execution**: Sub-agents see only relevant context
3. **Parallel Execution**: No context conflicts between agents
4. **Clean Transcripts**: Easier to understand what happened
5. **Better Results**: Agents not distracted by irrelevant information

## Integration with PAI Enhancement Tools

After clarification, use PAI's existing enhancement tools:

### Research Tasks
```typescript
const clarifiedPrompt = "[result of Phase 1 clarification]";

// Enhance for research
const enhanced = await mcp_claude-prompts__prompt_engine({
  promptId: "enhance_research_prompt",
  short_prompt: clarifiedPrompt,
  agent_type: "perplexity-researcher",
  depth_level: "extensive"
});

// Execute with research skill
await Task({
  subagent_type: "perplexity-researcher",
  prompt: enhanced.output
});
```

### Coding Tasks
```typescript
const clarifiedPrompt = "[result of Phase 1 clarification]";

// Enhance for coding
const enhanced = await mcp_claude-prompts__prompt_engine({
  promptId: "enhance_coding_prompt",
  short_prompt: clarifiedPrompt,
  language: "TypeScript",  // from clarification
  project_context: "[detected from codebase]"
});

// Add chain-of-thought for complex tasks
const withReasoning = await mcp_claude-prompts__prompt_engine({
  promptId: "add_chain_of_thought",
  original_prompt: enhanced.output,
  complexity: "complex"  // from complexity categorization
});

// Execute with engineer agent
await Task({
  subagent_type: "engineer",
  prompt: withReasoning.output
});
```

### Multi-Agent Tasks
```typescript
const clarifiedPrompt = "[result of Phase 1 clarification]";

// Use multi-agent router
const routing = await mcp_claude-prompts__prompt_engine({
  promptId: "multi_agent_router",
  complex_task: clarifiedPrompt
});

// Execute routing plan (parallel/sequential as specified)
// [routing.output contains ready-to-use Task calls]
```

## Prompt Storage & Archival

### Storage Structure

```
~/.claude/prompts/
├── active/           # Prompts being refined (Phase 1 in progress)
│   └── YYYY-MM-DD_HH-MM-SS_task-name.json
│
├── completed/        # Successful prompts (archived after execution)
│   └── YYYY-MM-DD_HH-MM-SS_task-name.json
│
└── templates/        # Reusable patterns (learned from completed)
    └── pattern-name.json
```

### Metadata Schema

```json
{
  "id": "uuid",
  "created": "2025-11-16T10:30:00Z",
  "completed": "2025-11-16T10:45:00Z",
  "status": "completed",  // active | completed | failed

  "original_prompt": "improve the code",
  "clarified_prompt": "[full specification after Phase 1]",
  "enhanced_prompt": "[after PAI enhancement tools]",

  "clarity_scores": {
    "objective": 9,
    "scope": 8,
    "context": 10,
    // ... all 10 dimensions
    "overall": 8.5
  },

  "complexity": "complex",  // simple | moderate | complex | very_complex

  "execution": {
    "strategy": "sequential",  // single | sequential | parallel
    "agents_used": ["architect", "engineer", "code-quality-reviewer"],
    "duration_seconds": 120,
    "success": true
  },

  "pai_tools_used": [
    "enhance_coding_prompt",
    "add_chain_of_thought",
    "optimize_for_claude"
  ],

  "learning": {
    "patterns_identified": ["oauth-implementation", "jwt-best-practices"],
    "reusable": true,
    "template_created": false
  }
}
```

### Archival Trigger (PostToolUse Hook)

Automatically archives prompts when:
- Task tool execution completes successfully
- Execution duration >30 seconds (non-trivial task)
- No errors in output

Saved to: `~/.claude/prompts/completed/YYYY-MM-DD_HH-MM-SS_task-name.json`

## Hook Integration

### auto-meta-prompt-clarification.ts (UserPromptSubmit)

**Purpose**: Detect vague prompts and automatically run Phase 1 clarification

**Trigger Conditions**:
```typescript
function shouldTriggerClarification(userPrompt: string): boolean {
  // Length check
  const wordCount = userPrompt.split(/\s+/).length;
  if (wordCount >= 50) return false;  // Likely specific enough

  // Vague term detection
  const vagueTerms = [
    "improve", "fix", "better", "optimize", "help", "update",
    "change", "modify", "refactor", "enhance", "upgrade"
  ];
  const hasVagueTerm = vagueTerms.some(term =>
    userPrompt.toLowerCase().includes(term)
  );

  // Specificity check
  const hasFileReference = /\.(ts|js|py|md|json|yaml|yml)/i.test(userPrompt);
  const hasCodeBlock = /```/.test(userPrompt);
  const hasNumberedList = /\d+\.\s/.test(userPrompt);
  const specificityScore =
    (hasFileReference ? 3 : 0) +
    (hasCodeBlock ? 3 : 0) +
    (hasNumberedList ? 2 : 0);

  // Trigger if vague term AND low specificity
  return hasVagueTerm && specificityScore < 5;
}
```

**Environment Variables**:
- `PAI_META_PROMPT_ENABLED` (default: true)
- `PAI_META_PROMPT_MIN_WORDS` (default: 50)
- `PAI_META_PROMPT_VAGUE_TERMS` (default: "improve,fix,better,optimize,help,update")

### auto-prompt-archival.ts (PostToolUse)

**Purpose**: Archive successful prompts for learning and reuse

**Trigger Conditions**:
```typescript
function shouldArchivePrompt(toolResult: any): boolean {
  // Only archive Task tool executions
  if (toolResult.tool_name !== "Task") return false;

  // Check success
  if (toolResult.error) return false;

  // Check duration (non-trivial tasks only)
  const duration = toolResult.execution_time_ms || 0;
  const minDuration = parseInt(process.env.PAI_PROMPT_ARCHIVAL_MIN_DURATION || "30", 10) * 1000;

  return duration >= minDuration;
}
```

**Environment Variables**:
- `PAI_PROMPT_ARCHIVAL_ENABLED` (default: true)
- `PAI_PROMPT_ARCHIVAL_MIN_DURATION` (default: 30 seconds)

## Usage Examples

### Example 1: Vague Request Auto-Clarification

**User Input**:
```
User: "improve the code"
```

**Auto-Trigger** (UserPromptSubmit hook):
```
[auto-meta-prompt-clarification.ts] Detected vague prompt (9 words, contains "improve")
[meta-prompting skill] Running 10-point clarity assessment...

Clarity Scores:
  Objective: 2/10 (unclear what "improve" means)
  Scope: 1/10 (no files specified)
  Context: 0/10 (no context provided)
  Technical: 0/10 (no technologies mentioned)
  Quality: 0/10 (no success criteria)
  ... (5 other dimensions low)
  Overall: 1.5/10 (CRITICAL - cannot proceed)
```

**Claude Response**:
```
I need clarification on several points to deliver exactly what you need:

## Critical Questions:
1. **Objective**: What aspect should I improve? (Performance? Readability? Security? Maintainability?)
2. **Scope**: Which code files or modules should I focus on?
3. **Context**: What problem are you trying to solve? What's not working well currently?
4. **Technical**: Are there specific patterns, libraries, or approaches you want me to use?

## Important Questions:
5. **Quality**: How will we measure improvement? What metrics matter? (Load time? Test coverage? Lines of code?)
6. **Constraints**: Are there any constraints? (Must maintain backward compatibility? Can't add dependencies?)

Please answer at minimum the critical questions. The more detail you provide, the better the result.
```

**User Clarification**:
```
User: "Improve performance of authentication.ts - it's taking 2+ seconds to log in.
       Should be under 500ms. We're using JWT tokens and PostgreSQL.
       Can optimize database queries or add caching but must maintain security."
```

**Phase 1 Complete** → **Phase 2 Execution**:
```
[meta-prompting skill] Clarified! Clarity score: 8.5/10
[meta-prompting skill] Complexity: Moderate
[meta-prompting skill] Strategy: Single agent with chain-of-thought

[PAI enhancement] enhance_coding_prompt → add_chain_of_thought → optimize_for_claude

[Execution] Spawning engineer agent in fresh context...
[Execution] Task complete in 45 seconds

[auto-prompt-archival.ts] Archiving successful prompt...
[auto-prompt-archival.ts] Saved to ~/.claude/prompts/completed/2025-11-16_10-45-30_improve-auth-performance.json
```

### Example 2: Clear Request (No Clarification)

**User Input**:
```
User: "Refactor src/auth/authentication.ts to use async/await pattern instead of
       callbacks. Maintain existing error handling. Add TypeScript strict mode
       compliance. Ensure all tests pass. Target <200ms per auth operation."
```

**Auto-Check** (UserPromptSubmit hook):
```
[auto-meta-prompt-clarification.ts] Analyzing prompt...
  Word count: 32 words
  Contains "refactor" (vague term)
  BUT high specificity:
    - File reference: ✓ (authentication.ts)
    - Technical details: ✓ (async/await, TypeScript)
    - Success criteria: ✓ (tests pass, <200ms)
    - Quality gates: ✓ (strict mode)
  Clarity score estimate: 8.5/10

[auto-meta-prompt-clarification.ts] SKIPPING clarification - prompt is sufficiently clear
```

**Direct Execution**:
```
[PAI enhancement] enhance_coding_prompt

[Execution] Spawning engineer agent...
[Execution] Task complete in 60 seconds

[auto-prompt-archival.ts] Archiving successful prompt...
```

## Performance Characteristics

| Phase | Latency | Use Case |
|-------|---------|----------|
| **Clarity Assessment** | <500ms | Vague prompt detection |
| **Question Generation** | 1-2s | Clarification needed |
| **Enhancement** | 1-3s | PAI tool integration |
| **Execution (Simple)** | 10-30s | Single agent, small task |
| **Execution (Complex)** | 1-5min | Multi-agent orchestration |
| **Archival** | <100ms | Background storage |

**Total Overhead**: 2-3 seconds for clarification (only when needed)

## Configuration

### Environment Variables

```bash
# Enable/disable meta-prompting
PAI_META_PROMPT_ENABLED=true

# Vague prompt detection
PAI_META_PROMPT_MIN_WORDS=50
PAI_META_PROMPT_VAGUE_TERMS="improve,fix,better,optimize,help,update,change,modify,refactor,enhance,upgrade"

# Prompt archival
PAI_PROMPT_ARCHIVAL_ENABLED=true
PAI_PROMPT_ARCHIVAL_MIN_DURATION=30  # seconds

# Clarity thresholds
PAI_META_PROMPT_CLARITY_THRESHOLD=6  # 0-10 scale
PAI_META_PROMPT_CRITICAL_THRESHOLD=3  # Below this = cannot proceed
```

### Opt-Out

To disable meta-prompting entirely:
```bash
# In settings.json env section:
"PAI_META_PROMPT_ENABLED": "false"

# Or temporarily for single request:
User: "improve code [NO_CLARIFICATION]"
```

## Best Practices

1. **Answer Critical Questions First**: Dimensions scoring 0-2 are blockers
2. **Provide Context**: Background information prevents back-and-forth
3. **Specify Success Criteria**: "How will we know it's done correctly?"
4. **Mention Constraints**: Technical, time, or resource limitations
5. **Use Examples**: If output format matters, show an example

## Troubleshooting

### "Too many clarification questions"
- Check `PAI_META_PROMPT_CLARITY_THRESHOLD` (lower = more questions)
- Provide more detail in initial request
- Use `[NO_CLARIFICATION]` flag if you want to proceed anyway

### "Clarification not triggering when needed"
- Check `PAI_META_PROMPT_ENABLED=true`
- Verify `PAI_META_PROMPT_MIN_WORDS` threshold
- Check if vague terms in `PAI_META_PROMPT_VAGUE_TERMS` list

### "Prompts not being archived"
- Check `PAI_PROMPT_ARCHIVAL_ENABLED=true`
- Verify task duration meets `PAI_PROMPT_ARCHIVAL_MIN_DURATION`
- Check Task tool completed successfully (no errors)

---

**Status**: ✅ Production Ready - Phase 1 & 2 Complete

**Version**: 1.0.0

**Last Updated**: 2025-11-16

**Location**: `~/.claude/skills/meta-prompting/`
