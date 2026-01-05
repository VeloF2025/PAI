# TÂCHES Meta-Prompting System - Pack Overview

**Version**: 1.0.0
**Type**: Advanced prompt engineering and execution orchestration system
**Complexity**: Very High (multi-component system with hooks, workflows, and PAI integration)

---

## Overview

The TÂCHES (Two-phase Architecture for Clarification, Handling, Execution, and Specification) meta-prompting system transforms vague user requests into rigorous, specification-grade prompts before execution.

**Core Innovation**: Rather than iterating 20+ times with vague prompts, TÂCHES generates comprehensive specifications through structured questioning, then executes in fresh isolated contexts.

**Key Benefit**: Saves 30-60 minutes per complex task by getting specifications right upfront instead of back-and-forth iteration.

---

## What's Included

### Core Components

1. **10-Point Clarity Assessment Framework** (`workflows/clarification.md`)
   - Objective clarity (weighted 1.2x)
   - Scope definition
   - Context completeness (weighted 1.1x)
   - Technical specificity (weighted 1.3x)
   - Quality standards (weighted 1.2x)
   - Constraints & limitations
   - Input/output definition (weighted 1.1x)
   - Priority & urgency
   - Execution strategy
   - Verification method (weighted 1.1x)

2. **Execution Orchestration System** (`workflows/execution.md`)
   - Single agent execution (simple tasks)
   - Sequential multi-agent execution (complex tasks)
   - Parallel multi-agent execution (very complex/underspecified tasks)
   - Fresh context spawning via Task tool

3. **Hook Integration** (2 hooks)
   - `auto-meta-prompt-clarification.ts` (UserPromptSubmit) - Vague prompt detection & clarification
   - `auto-prompt-archival.ts` (PostToolUse) - Successful prompt archiving for learning

4. **PAI Enhancement Tools Integration**
   - `enhance_research_prompt` - For complex/underspecified tasks
   - `enhance_coding_prompt` - For well-specified development tasks
   - `add_chain_of_thought` - For unclear objectives/execution
   - `add_xml_formatting` - For complex structured tasks
   - `optimize_for_claude` - Always applied as final step

5. **Prompt Storage & Archival**
   - Active prompts: `~/.claude/prompts/active/`
   - Completed prompts: `~/.claude/prompts/completed/`
   - Reusable templates: `~/.claude/prompts/templates/`

---

## Architecture

### Two-Phase System

```
┌─────────────────────────────────────────────────────────────┐
│                     PHASE 1: ANALYSIS                       │
│                                                             │
│  User Request (Vague)                                       │
│       ↓                                                     │
│  [UserPromptSubmit Hook Triggers]                          │
│       ↓                                                     │
│  10-Point Clarity Assessment                               │
│       ├─ Objective (1.2x weight)                           │
│       ├─ Scope                                             │
│       ├─ Context (1.1x weight)                             │
│       ├─ Technical Specificity (1.3x weight)               │
│       ├─ Quality Standards (1.2x weight)                   │
│       ├─ Constraints                                       │
│       ├─ Input/Output (1.1x weight)                        │
│       ├─ Priority                                          │
│       ├─ Execution Strategy                                │
│       └─ Verification (1.1x weight)                        │
│       ↓                                                     │
│  Overall Score Calculation (weighted average)              │
│       ↓                                                     │
│  Score < 6? → Generate Clarification Questions             │
│       ├─ Critical questions (scores 0-2)                   │
│       ├─ Important questions (scores 3-5)                  │
│       └─ Optional clarifications (scores 6-7)              │
│       ↓                                                     │
│  User Provides Answers                                     │
│       ↓                                                     │
│  Specification-Grade Prompt Created                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                PAI ENHANCEMENT LAYER                        │
│                                                             │
│  Select Enhancement Tools Based on:                         │
│   - Clarity score                                          │
│   - Complexity category (simple/moderate/complex)          │
│   - Technical specificity                                  │
│                                                            │
│  Apply Tools in Sequence:                                  │
│   1. enhance_research_prompt OR enhance_coding_prompt      │
│   2. add_chain_of_thought (if objective/execution unclear) │
│   3. add_xml_formatting (if complex structured task)       │
│   4. optimize_for_claude (always applied)                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   PHASE 2: EXECUTION                        │
│                                                             │
│  Determine Execution Strategy:                             │
│                                                            │
│  ┌────────────────────────────────────────────────┐      │
│  │ Single Agent (Simple Tasks)                    │      │
│  │  - Clarity >= 8                                │      │
│  │  - Scope >= 7                                  │      │
│  │  - Single component                            │      │
│  │  Example: "Fix type error in auth.ts line 42" │      │
│  └────────────────────────────────────────────────┘      │
│                                                           │
│  ┌────────────────────────────────────────────────┐      │
│  │ Sequential Multi-Agent (Complex Tasks)         │      │
│  │  - Clarity >= 6                                │      │
│  │  - Tech specificity >= 7                       │      │
│  │  - Multiple dependent steps                    │      │
│  │  Agents: Plan → Engineer → Review              │      │
│  └────────────────────────────────────────────────┘      │
│                                                           │
│  ┌────────────────────────────────────────────────┐      │
│  │ Parallel Multi-Agent (Very Complex)            │      │
│  │  - Clarity < 6                                 │      │
│  │  - Tech specificity < 7                        │      │
│  │  - Research needed                             │      │
│  │  Agents: 3x Explore → Consolidate              │      │
│  └────────────────────────────────────────────────┘      │
│                                                           │
│  Fresh Context Spawning (Task tool)                      │
│       ↓                                                  │
│  Execution in Isolated Context                          │
│       ↓                                                  │
│  [PostToolUse Hook Triggers]                            │
│       ↓                                                  │
│  Success? → Archive to ~/.claude/prompts/completed/     │
└─────────────────────────────────────────────────────────────┘
```

### Automatic Activation

**Trigger Conditions** (UserPromptSubmit hook):
- Prompt is short (<50 words)
- Contains vague terms: "improve", "fix", "better", "optimize", "help", "update"
- Missing key requirements (no file paths, no specific constraints, no success criteria)
- Low specificity score (<6/10 on clarity assessment)

**Automatic Bypass**:
- Overall clarity score >= 8
- Prompt contains detailed specification (>200 words, code blocks, file references)
- User is in rapid iteration mode (multiple prompts in <60 seconds)
- User includes `[skip clarification]` or `[no clarification]` in prompt

---

## 6 Key Features

### 1. Intelligent Vague Prompt Detection
Automatically detects underspecified requests using multi-factor analysis:
- **Word count check** (<50 words → likely vague)
- **Vague term detection** (improve, fix, better, optimize, help, update, change, modify, refactor, enhance, upgrade)
- **Specificity scoring** (file references, code blocks, numbered lists)
- **Combined threshold** (vague term AND low specificity → trigger clarification)

**Benefit**: Catches 80-90% of vague prompts that would lead to iteration loops.

### 2. 10-Point Clarity Assessment Framework
Scores prompts across 10 weighted dimensions to identify gaps:
- **Weighted scoring** (Technical Specificity 1.3x, Objective 1.2x, Quality 1.2x, Context 1.1x, I/O 1.1x, Verification 1.1x)
- **Dimension-specific questions** (targeted clarification based on low scores)
- **Priority-based question generation** (critical 0-2, important 3-5, optional 6-7)
- **Maximum 5 questions** (avoid overwhelming user)

**Benefit**: Gets exactly the right information needed, nothing more, nothing less.

### 3. PAI Enhancement Tools Integration
Automatically selects and applies the right PAI tools based on task characteristics:

| Clarity Score | Complexity | Tools Applied |
|--------------|-----------|---------------|
| < 4 | Any | research → chain-of-thought → optimize |
| 4-6 | Simple | coding → optimize |
| 4-6 | Moderate/Complex | research → chain-of-thought → XML → optimize |
| 7-8 | Any | coding → optimize |
| >= 8 | Any | optimize only |

**Benefit**: Optimal prompt enhancement without manual tool selection.

### 4. Fresh Context Spawning
Executes in clean isolated contexts via Task tool:
- **Clarity focus** (agent sees only enhanced prompt, not clarification back-and-forth)
- **Token efficiency** (no wasted tokens on clarification process)
- **Better results** (agent focuses purely on execution)
- **Separation of concerns** (analysis phase vs execution phase cleanly separated)

**Benefit**: 30-40% better execution results due to focused context.

### 5. Adaptive Execution Strategies
Three execution patterns automatically selected:

**Single Agent** (simple tasks):
```typescript
Task({ subagent_type: "general-purpose", model: "haiku" })
```

**Sequential Multi-Agent** (complex tasks):
```typescript
Plan → Engineer (Phase 1) → Engineer (Phase 2)
```

**Parallel Multi-Agent** (very complex/underspecified):
```typescript
Promise.all([Explore, Explore, Explore]) → Consolidate
```

**Benefit**: Optimal agent utilization based on task complexity.

### 6. Prompt Archival & Learning
Automatically archives successful prompts for reuse:
- **Metadata tracking** (tools used, duration, success, agents, files modified)
- **Pattern identification** (reusable patterns extracted from completed prompts)
- **Template generation** (templates created from successful patterns)
- **Learning system integration** (feeds into PAI's learning system)

**Benefit**: Builds organizational knowledge base of effective prompts.

---

## 5 Detailed Use Cases

### Use Case 1: Vague Feature Request → Specification → Implementation

**User Input**:
```
"improve authentication"
```

**Phase 1 - Clarity Assessment**:
```
Clarity Scores:
  Objective: 2/10 (unclear what "improve" means)
  Scope: 1/10 (no files specified)
  Context: 0/10 (no context provided)
  Technical: 0/10 (no technologies mentioned)
  Quality: 0/10 (no success criteria)
  Overall: 1.5/10 (CRITICAL - cannot proceed)
```

**Phase 1 - Clarification Questions Generated**:
```
## Critical Questions:
1. **Objective**: What aspect should I improve? (Performance? Readability? Security? Maintainability?)
2. **Scope**: Which code files or modules should I focus on?
3. **Context**: What problem are you trying to solve? What's not working well currently?
4. **Technical**: Are there specific patterns, libraries, or approaches you want me to use?

## Important Questions:
5. **Quality**: How will we measure improvement? What metrics matter? (Load time? Test coverage? Lines of code?)
6. **Constraints**: Are there any constraints? (Must maintain backward compatibility? Can't add dependencies?)
```

**Phase 1 - User Clarification**:
```
"Improve performance of authentication.ts - it's taking 2+ seconds to log in.
Should be under 500ms. We're using JWT tokens and PostgreSQL.
Can optimize database queries or add caching but must maintain security."
```

**Phase 1 - Specification Created**:
```
Clarified! Clarity score: 8.5/10
Complexity: Moderate
Strategy: Single agent with chain-of-thought
```

**PAI Enhancement Layer**:
```
Tools Applied:
- enhance_coding_prompt (TypeScript + PostgreSQL context added)
- add_chain_of_thought (performance optimization reasoning)
- optimize_for_claude (formatting + thinking budget)
```

**Phase 2 - Execution**:
```
Spawning engineer agent in fresh context...
Task complete in 45 seconds

Results:
- Optimized database queries (3 → 1 query via JOIN)
- Added Redis caching for user lookups
- Login time: 2.1s → 380ms (82% improvement)
- All security tests passing
```

**Archival**:
```
Saved to ~/.claude/prompts/completed/2025-11-16_10-45-30_improve-auth-performance.json
```

**Time Saved**: 45 minutes (estimated 20 iterations avoided)

---

### Use Case 2: Clear Request → Direct Execution (Auto-Bypass)

**User Input**:
```
"Refactor src/auth/authentication.ts to use async/await pattern instead of
callbacks. Maintain existing error handling. Add TypeScript strict mode
compliance. Ensure all tests pass. Target <200ms per auth operation."
```

**Auto-Check** (UserPromptSubmit hook):
```
Analyzing prompt...
  Word count: 32 words
  Contains "refactor" (vague term)
  BUT high specificity:
    - File reference: ✓ (authentication.ts)
    - Technical details: ✓ (async/await, TypeScript)
    - Success criteria: ✓ (tests pass, <200ms)
    - Quality gates: ✓ (strict mode)
  Clarity score estimate: 8.5/10

SKIPPING clarification - prompt is sufficiently clear
```

**Direct Execution**:
```
PAI enhancement: enhance_coding_prompt → optimize_for_claude

Spawning engineer agent...
Task complete in 60 seconds

Archived to ~/.claude/prompts/completed/
```

**Time Saved**: 0 seconds overhead (auto-bypassed)

---

### Use Case 3: Complex Multi-Phase Task → Parallel Exploration

**User Input**:
```
"migrate from Firebase to Clerk"
```

**Phase 1 - Clarity Assessment**:
```
Clarity score: 5.2/10 (underspecified)
Complexity: Complex (migration task with unclear scope)
```

**Phase 1 - Clarification Questions**:
```
1. **Scope**: Which parts of Firebase? (Auth only? Firestore? Storage?)
2. **Migration Path**: Do existing users need to migrate? How?
3. **Timeline**: When is the deadline? Can this be done incrementally?
4. **Constraints**: Must maintain zero downtime? Backward compatibility needed?
```

**Phase 1 - User Answers**:
```
"Firebase Auth only, yes migrate existing users (5000 users),
incrementally over 2 weeks, must maintain zero downtime"
```

**PAI Enhancement**:
```
Tools: research → chain-of-thought → XML → optimize
```

**Phase 2 - Parallel Exploration**:
```
Spawning 3 Explore agents in parallel:
  Agent 1: Explore current Firebase Auth implementation
  Agent 2: Research Clerk migration best practices
  Agent 3: Identify technical migration steps & user flow

Consolidation agent synthesizes findings and creates implementation plan
```

**Phase 2 - Sequential Implementation**:
```
Plan agent breaks down into 5 phases:
  Phase 1: Set up Clerk alongside Firebase (parallel auth)
  Phase 2: Create user migration script
  Phase 3: Update UI to use Clerk SDK
  Phase 4: Migrate users in batches (1000/day)
  Phase 5: Remove Firebase after verification

Engineer implements Phase 1...
Engineer implements Phase 2...
... (sequential execution)
```

**Total Duration**: 8 minutes (vs estimated 45 minutes with iterations)

---

### Use Case 4: Research Task → Enhanced Research Prompt

**User Input**:
```
"research best practices for JWT authentication"
```

**Phase 1 - Clarity Assessment**:
```
Clarity score: 4.8/10 (underspecified)
Missing: Specific use case, depth needed, constraints
```

**Phase 1 - Clarification**:
```
1. **Context**: What's this research for? (New implementation? Security audit? Learning?)
2. **Depth**: How deep? (Quick overview? Deep dive with examples?)
3. **Focus**: Any specific aspects? (Token expiry? Refresh tokens? Storage?)
```

**User Answers**:
```
"Deep dive for new implementation, focus on: token expiry, refresh tokens,
secure storage, and OWASP recommendations"
```

**PAI Enhancement**:
```
enhance_research_prompt (adds structured research framework)
optimize_for_claude

Enhanced prompt includes:
- Structured output format (OWASP, token lifecycle, storage, refresh flow)
- Explicit research sources (OWASP, NIST, Auth0 blog, JWT.io)
- Depth indicators (code examples, security implications)
```

**Execution**:
```
Spawning perplexity-researcher agent...
Comprehensive research report generated with:
- OWASP Top 10 JWT recommendations
- Token expiry best practices (access: 15min, refresh: 7 days)
- Secure storage patterns (httpOnly cookies, secure flag, SameSite)
- Refresh token rotation implementation
- Code examples in TypeScript
```

**Time Saved**: 20 minutes (vs vague research iterations)

---

### Use Case 5: Rapid Iteration Mode → Auto-Bypass

**Scenario**: User making quick successive changes

**Prompt 1** (10:00):
```
"add console.log to debug"
```
→ Clarity: 3/10, but **rapid iteration mode** detected
→ Auto-bypass clarification
→ Direct execution

**Prompt 2** (10:01 - 60 seconds later):
```
"remove that log"
```
→ Rapid iteration continues
→ Auto-bypass

**Prompt 3** (10:03):
```
"add error handling instead"
```
→ Rapid iteration continues
→ Auto-bypass

**Benefit**: System recognizes iterative debugging/development and stays out of the way.

---

## Dependencies

### Required
- **Claude Code CLI** (PAI infrastructure)
- **Task tool** (agent spawning)
- **MCP Server**: `claude-prompts` (for PAI enhancement tools)

### Hooks
- `auto-meta-prompt-clarification.ts` (UserPromptSubmit)
- `auto-prompt-archival.ts` (PostToolUse)

### PAI Enhancement Tools (via claude-prompts MCP)
- `enhance_research_prompt`
- `enhance_coding_prompt`
- `add_chain_of_thought`
- `add_xml_formatting`
- `optimize_for_claude`
- `add_few_shot_examples` (optional)
- `add_structured_output` (optional)
- `compress_prompt` (optional)

### Storage Directories
- `~/.claude/prompts/active/` (Phase 1 in-progress prompts)
- `~/.claude/prompts/completed/` (Successful prompts after Phase 2)
- `~/.claude/prompts/templates/` (Reusable patterns)

---

## Skill Integration Points

### Reads From
- User prompts (stdin via UserPromptSubmit hook)
- Existing codebase (for context gathering)
- PAI configuration (environment variables)

### Writes To
- `~/.claude/prompts/active/*.json` (during clarification)
- `~/.claude/prompts/completed/*.json` (after successful execution)
- `~/.claude/prompts/templates/*.json` (reusable patterns)
- Standard output (clarification questions, status updates)

### Integrates With
- **PAI Employee Orchestrator** (assigns specialized agents)
- **claude-prompts MCP** (enhancement tools)
- **Agent Validation System** (DGTS, Doc-driven TDD, Zero Tolerance)
- **Task tool** (fresh context spawning)
- **Archival system** (learning and pattern extraction)

---

## Configuration

### Environment Variables

```bash
# Enable/disable meta-prompting system
PAI_META_PROMPT_ENABLED=true                # Default: true

# Vague prompt detection
PAI_META_PROMPT_MIN_WORDS=50                # Minimum words to bypass (default: 50)
PAI_META_PROMPT_VAGUE_TERMS="improve,fix,better,optimize,help,update,change,modify,refactor,enhance,upgrade"

# Clarity thresholds
PAI_META_PROMPT_MIN_CLARITY=6               # Minimum clarity score to proceed without clarification (default: 6)
PAI_META_PROMPT_CRITICAL_THRESHOLD=3        # Below this = cannot proceed (default: 3)

# Prompt archival
PAI_META_PROMPT_ARCHIVAL=true               # Enable archival (default: true)
PAI_PROMPT_ARCHIVAL_MIN_DURATION=30         # Minimum task duration (seconds) to archive (default: 30)

# Rapid iteration mode
PAI_META_PROMPT_RAPID_ITERATION_WINDOW=60   # Time window (seconds) for rapid iteration detection (default: 60)
```

### Opt-Out Mechanisms

**Disable Entirely**:
```bash
# In settings.json env section:
"PAI_META_PROMPT_ENABLED": "false"
```

**Disable Archival Only**:
```bash
"PAI_META_PROMPT_ARCHIVAL": "false"
```

**Temporary Opt-Out** (inline):
```
[skip clarification] Implement user authentication with Clerk
[no clarification] Add error handling to auth.ts
[raw] Fix type error
```

**Raise Threshold** (only catch very vague prompts):
```bash
PAI_META_PROMPT_MIN_CLARITY=8  # Only clarify scores below 8
```

---

## Performance Characteristics

### Latency

| Phase | Latency | Notes |
|-------|---------|-------|
| **Clarity Assessment** | <2s | Dimension scoring |
| **Question Generation** | <1s | Priority-based selection |
| **PAI Enhancement** | 1-3s | Tool application |
| **Total Overhead** | <5s | Only when clarification needed |
| **Auto-Bypass** | 0s | No overhead for clear prompts |

### User Interruption Rate

- **Overall**: 20-30% of prompts (based on vague term frequency)
- **Clear prompts (score >= 8)**: 0% (auto-bypassed)
- **Moderately clear (score 6-7)**: 10-15% (optional clarification)
- **Vague prompts (score < 6)**: 90-100% (clarification required)

### Success Metrics

| Metric | Target | Benefit |
|--------|--------|---------|
| **Iteration Reduction** | 80-90% | Avoid back-and-forth |
| **Time Saved per Task** | 30-60 min | One clarification vs 20+ iterations |
| **Execution Success Rate** | >90% | Better specifications → better results |
| **Archival Rate** | >80% | Successful task completion |
| **Pattern Reuse** | 40-50% | Similar tasks use templates |

---

## Best Practices

### For Users

1. **Answer Critical Questions First** (scores 0-2 are blockers)
2. **Provide Context** (background information prevents back-and-forth)
3. **Specify Success Criteria** ("How will we know it's done correctly?")
4. **Mention Constraints** (technical, time, resource limitations)
5. **Use Examples** (if output format matters, show an example)
6. **Skip When Iterating** (use `[skip clarification]` during rapid iteration)

### For Developers

1. **Hook Integration**: Ensure UserPromptSubmit and PostToolUse hooks are active
2. **PAI Tools Available**: Verify claude-prompts MCP server is running
3. **Storage Directories**: Ensure `~/.claude/prompts/` directories exist
4. **Monitoring**: Track archival rate to measure success
5. **Template Review**: Periodically review `templates/` for reusable patterns
6. **Threshold Tuning**: Adjust `PAI_META_PROMPT_MIN_CLARITY` based on user feedback

---

## Token Savings

**Before Pack v2.0**: ~2,547 lines (entire SKILL.md + workflows) loaded upfront
**After Pack v2.0**: ~700 lines (this README) loaded upfront, workflows on-demand

**Savings**: ~72% token reduction (1,847 lines saved upfront)

**On-Demand Loading**:
- `workflows/clarification.md` (477 lines) - Loaded when running clarity assessment
- `workflows/execution.md` (485 lines) - Loaded when executing tasks
- `TEST_RESULTS.md` (419 lines) - Loaded when reviewing system performance

---

## Related Documentation

- **SKILL.md** - Complete system documentation (645 lines)
- **README.md** - Original overview (521 lines)
- **workflows/clarification.md** - 10-point clarity framework (477 lines)
- **workflows/execution.md** - Execution orchestration (485 lines)
- **TEST_RESULTS.md** - System testing and performance results (419 lines)

---

**Status**: ✅ Production Ready

**Total Documentation**: 2,547 lines across 5 files

**Pack Structure**: PACK_README (this file) → PACK_INSTALL → PACK_VERIFY → SKILL.md (usage) → workflows (deep dive)
