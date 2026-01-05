# Execution Orchestration Workflow

## Overview

This workflow defines how to execute clarified and enhanced prompts using the most appropriate strategy: single agent, sequential multi-agent, or parallel multi-agent execution.

The orchestration system integrates with PAI's existing employee orchestrator and Task tool to spawn fresh context agents for optimal results.

## Execution Flow

```
User Prompt
    ↓
[UserPromptSubmit Hook] → Clarity Assessment
    ↓
Low Clarity? → Generate Questions → User Answers
    ↓
High Clarity Prompt
    ↓
Select PAI Enhancement Tools
    ↓
Enhanced Prompt
    ↓
Determine Execution Strategy
    ↓
┌─────────────────────────────────────┐
│  Single Agent | Sequential | Parallel │
└─────────────────────────────────────┘
    ↓
Execute via Task Tool
    ↓
Track Progress & Tool Usage
    ↓
[PostToolUse Hook] → Detect Completion
    ↓
Archive Successful Prompts
```

## Strategy Selection Algorithm

### Input Parameters
```typescript
interface StrategyInput {
  clarity_scores: ClarityScores;
  complexity: "simple" | "moderate" | "complex" | "underspecified";
  wordCount: number;
  technicalDepth: number;
  hasMultipleComponents: boolean;
  hasParallelTasks: boolean;
}
```

### Decision Tree

**1. Single Agent Execution**

Use when:
- Overall clarity score >= 8
- Complexity = "simple"
- Scope score >= 7 (well-defined boundaries)
- Word count < 100 (concise task)
- Single file or component modification

**Agent**: `general-purpose`

**Example**:
```
"Fix the type error in src/utils/auth.ts line 42
by adding explicit return type to getUser() function"
```

**2. Sequential Multi-Agent Execution**

Use when:
- Overall clarity score >= 6
- Complexity = "moderate" or "complex"
- Technical specificity >= 7 (clear tech stack)
- Multiple components but dependent steps
- Scope score >= 5 (reasonably defined)

**Agents**: `["Plan", "general-purpose"]` or `["Plan", "general-purpose", "general-purpose"]`

**Example**:
```
"Migrate authentication from Firebase to Clerk in Next.js app:
1. Install Clerk SDK
2. Update middleware
3. Replace auth hooks
4. Update protected routes
5. Test and verify"
```

**3. Parallel Multi-Agent Execution**

Use when:
- Complexity = "complex" or "underspecified"
- Technical specificity < 7 (unclear tech requirements)
- Multiple independent tasks identified
- Scope score < 5 (unclear boundaries)
- Research needed before implementation

**Agents**: `["Explore", "Explore", "Explore"]` with consolidation

**Example**:
```
"Improve the authentication system"
(Vague - needs parallel exploration of current impl, best practices, and options)
```

## Implementation Patterns

### Pattern 1: Single Agent

```typescript
async function executeSingleAgent(enhancedPrompt: string): Promise<void> {
  // Use Task tool with general-purpose agent
  await Task({
    subagent_type: "general-purpose",
    description: "Execute task",
    prompt: enhancedPrompt,
    model: "sonnet" // or "haiku" for simple tasks
  });
}
```

### Pattern 2: Sequential Multi-Agent

```typescript
async function executeSequential(
  enhancedPrompt: string,
  complexity: string
): Promise<void> {
  // Step 1: Planning agent analyzes and breaks down task
  const planResult = await Task({
    subagent_type: "Plan",
    description: "Analyze and plan",
    prompt: `Analyze this task and create a detailed implementation plan:\n\n${enhancedPrompt}`,
    model: "sonnet"
  });

  // Step 2: Implementation agent(s) execute plan
  // For moderate complexity: 1 implementation agent
  // For complex: 2+ implementation agents for different phases

  if (complexity === "moderate") {
    await Task({
      subagent_type: "general-purpose",
      description: "Implement solution",
      prompt: `Execute the following plan:\n\n${planResult}\n\nOriginal requirement:\n${enhancedPrompt}`,
      model: "sonnet"
    });
  } else {
    // Complex - break into phases
    // Phase 1: Core implementation
    await Task({
      subagent_type: "general-purpose",
      description: "Implement core",
      prompt: `Implement core functionality for:\n\n${enhancedPrompt}\n\nFocus on essential features first.`,
      model: "sonnet"
    });

    // Phase 2: Integration and refinement
    await Task({
      subagent_type: "general-purpose",
      description: "Refine and integrate",
      prompt: `Complete integration and refinement for:\n\n${enhancedPrompt}\n\nEnsure all requirements are met.`,
      model: "sonnet"
    });
  }
}
```

### Pattern 3: Parallel Multi-Agent with Consolidation

```typescript
async function executeParallel(enhancedPrompt: string): Promise<void> {
  // Spawn multiple Explore agents in parallel (single message with multiple Task calls)
  // Each explores different aspects of the underspecified task

  const explorationPrompts = [
    `Explore current implementation and architecture for:\n${enhancedPrompt}`,
    `Research best practices and recommended approaches for:\n${enhancedPrompt}`,
    `Identify technical options and trade-offs for:\n${enhancedPrompt}`
  ];

  // NOTE: These Task calls should be made in a SINGLE message (parallel execution)
  const results = await Promise.all(
    explorationPrompts.map((prompt, i) =>
      Task({
        subagent_type: "Explore",
        description: `Exploration ${i + 1}`,
        prompt,
        model: "sonnet"
      })
    )
  );

  // Consolidation agent synthesizes findings
  await Task({
    subagent_type: "general-purpose",
    description: "Consolidate and implement",
    prompt: `Based on these exploration results, implement a solution for:\n\n${enhancedPrompt}\n\nExploration findings:\n${results.join('\n\n---\n\n')}`,
    model: "sonnet"
  });
}
```

## Fresh Context Spawning

### Why Fresh Context?

- **Clarity Focus**: Agent sees ONLY the enhanced prompt, not the back-and-forth clarification
- **Token Efficiency**: No wasted tokens on the clarification process
- **Better Results**: Agent focuses purely on execution, not meta-discussion
- **Separation of Concerns**: Analysis phase vs execution phase are cleanly separated

### How to Spawn Fresh Context

Use the `Task` tool with a complete, self-contained prompt:

```typescript
// BAD - Agent sees entire clarification conversation
await continueInCurrentContext();

// GOOD - Fresh agent with clean context
await Task({
  subagent_type: "general-purpose",
  prompt: `[Complete enhanced prompt with all context]`,
  description: "Execute task with fresh context"
});
```

## PAI Enhancement Tools Integration

### Tool Selection Matrix

| Clarity Score | Complexity | Tools to Apply |
|--------------|-----------|----------------|
| < 4 | Any | `enhance_research_prompt`, `add_chain_of_thought`, `optimize_for_claude` |
| 4-6 | Simple | `enhance_coding_prompt`, `optimize_for_claude` |
| 4-6 | Moderate/Complex | `enhance_research_prompt`, `add_chain_of_thought`, `add_xml_formatting`, `optimize_for_claude` |
| 7-8 | Any | `enhance_coding_prompt`, `optimize_for_claude` |
| >= 8 | Any | `optimize_for_claude` (minimal enhancement) |

### Tool Application Sequence

```typescript
async function applyPAIEnhancements(
  clarifiedPrompt: string,
  assessment: ClarityAssessment
): Promise<string> {
  let enhanced = clarifiedPrompt;

  // Step 1: Base enhancement
  if (assessment.complexity === "complex" || assessment.overall_score < 6) {
    enhanced = await applyPAITool("enhance_research_prompt", enhanced);
  } else {
    enhanced = await applyPAITool("enhance_coding_prompt", enhanced);
  }

  // Step 2: Add chain-of-thought if objective/execution unclear
  const needsChainOfThought =
    assessment.dimensions.find(d => d.dimension === "objective")?.score < 6 ||
    assessment.dimensions.find(d => d.dimension === "execution_strategy")?.score < 6;

  if (needsChainOfThought) {
    enhanced = await applyPAITool("add_chain_of_thought", enhanced);
  }

  // Step 3: XML formatting for complex structured tasks
  if (assessment.complexity === "complex") {
    enhanced = await applyPAITool("add_xml_formatting", enhanced);
  }

  // Step 4: Always optimize for Claude (final step)
  enhanced = await applyPAITool("optimize_for_claude", enhanced);

  return enhanced;
}
```

## Progress Tracking

### Session Data Tracking

The archival hook tracks:
- Tools used: All tool invocations during execution
- Files modified: Tracks Write, Edit, MultiEdit operations
- Agent calls: Task, SlashCommand invocations
- Duration: Start time to completion time
- Success indicators: Keywords in tool outputs

### Metadata Collection

```typescript
interface ExecutionMetadata {
  strategy: "single_agent" | "sequential" | "parallel";
  agents_used: string[]; // ["Plan", "general-purpose"]
  duration_seconds: number;
  success: boolean;
  tools_used: string[]; // ["Write", "Bash", "Task"]
  files_modified: string[]; // ["src/auth.ts", "src/middleware.ts"]
  pai_tools_applied: string[]; // ["enhance_coding_prompt", "optimize_for_claude"]
}
```

## Opt-Out and Control

### Environment Variables

- `PAI_META_PROMPT_ENABLED=false` - Disable entire system
- `PAI_META_PROMPT_ARCHIVAL=false` - Disable archival only
- `PAI_META_PROMPT_MIN_CLARITY=8` - Raise threshold to only catch very vague prompts

### Inline Opt-Out

Users can skip clarification by including:
- `[skip clarification]`
- `[no clarification]`
- `[raw]`

Example:
```
[skip clarification] Implement user authentication with Clerk
```

### Automatic Bypass

System automatically bypasses clarification when:
- Overall clarity score >= 8
- Prompt contains detailed specification (>200 words, code blocks, file references)
- User is in rapid iteration mode (multiple prompts in <60 seconds)

## Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Clarity assessment time | <2s | ~1.5s |
| Question generation | <1s | ~0.5s |
| PAI enhancement | <3s | ~2s |
| Total overhead | <5s | ~4s |
| User interruption rate | 20-30% | TBD |
| Success archival rate | >80% | TBD |

## Error Handling

### Clarification Hook Failures

If auto-meta-prompt-clarification.ts fails:
- Log error to console
- Continue with original prompt (graceful degradation)
- Do NOT block user's request

### Archival Hook Failures

If auto-prompt-archival.ts fails:
- Log error to console
- Continue normal execution
- Prompt is NOT archived (no data loss)

### Storage Failures

If prompt storage fails:
- Fail gracefully
- Log detailed error
- Continue execution (archival is optional)

## Integration with Existing PAI Systems

### Employee Orchestrator

Meta-prompting works ALONGSIDE employee orchestrator:
- Meta-prompting: Clarifies and enhances prompts
- Employee orchestrator: Assigns tasks to specialized agents
- Both systems collaborate for optimal results

### claude-prompts-mcp Tools

Meta-prompting uses the 8 PAI enhancement tools:
- `enhance_research_prompt`
- `enhance_coding_prompt`
- `add_chain_of_thought`
- `add_xml_formatting`
- `optimize_for_claude`
- `add_few_shot_examples`
- `add_structured_output`
- `compress_prompt`

### Agent Validation System

Meta-prompting respects existing agent validation:
- DGTS enforcement still applies
- Doc-driven TDD still required
- Zero-tolerance policies still active

## Example Execution Scenarios

### Scenario 1: Simple Task (Single Agent)

**User Prompt**: "Fix type error in auth.ts line 42"

**Clarity Score**: 9.2 (very specific)

**Enhancement**: `optimize_for_claude` only

**Execution**:
```typescript
Task({
  subagent_type: "general-purpose",
  model: "haiku", // Simple task
  prompt: "[Enhanced prompt]"
})
```

**Duration**: ~30 seconds

### Scenario 2: Moderate Task (Sequential)

**User Prompt**: "Add email verification to signup flow"

**Clarity Score**: 6.8 (moderate)

**Enhancement**: `enhance_coding_prompt` + `optimize_for_claude`

**Execution**:
```typescript
// Step 1: Plan
Task({
  subagent_type: "Plan",
  prompt: "Analyze and plan email verification..."
})

// Step 2: Implement
Task({
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: "[Enhanced prompt with plan]"
})
```

**Duration**: ~3 minutes

### Scenario 3: Complex Task (Parallel Exploration)

**User Prompt**: "Improve authentication"

**Clarity Score**: 3.1 (very vague)

**Enhancement**: Full suite (research, chain-of-thought, XML, optimize)

**Execution**:
```typescript
// Parallel exploration (single message, 3 Task calls)
Promise.all([
  Task({ subagent_type: "Explore", prompt: "Explore current auth..." }),
  Task({ subagent_type: "Explore", prompt: "Research best practices..." }),
  Task({ subagent_type: "Explore", prompt: "Identify options..." })
])

// Consolidation
Task({
  subagent_type: "general-purpose",
  prompt: "[Synthesize findings and implement]"
})
```

**Duration**: ~8 minutes

## Future Enhancements

### Phase 2 Features (Post-MVP)

- **Learning from Success**: Analyze archived prompts to improve clarity scoring
- **Template Auto-Generation**: Automatically create templates from successful patterns
- **Predictive Enhancement**: Predict which PAI tools will be most effective
- **User Preference Learning**: Adapt to user's prompting style over time
- **Multi-Turn Clarification**: Support iterative refinement for very complex tasks
- **Confidence Scoring**: Provide confidence levels for execution strategy selection

### Integration Opportunities

- **PAI Employee Orchestrator**: Deeper integration with specialized employees
- **DGTS System**: Feed meta-prompting data into gaming detection
- **Validation System**: Use clarity scores to predict validation failures
- **Research Cache**: Cache clarified prompts for similar future requests
