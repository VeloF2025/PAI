# Async Orchestration - Comprehensive Guide

**Purpose**: Master async agent coordination for parallel task execution and productivity multiplication

**Quick Start**: Read `SKILL.md` for overview, this file for deep dive

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Pattern 1: Parallel Research + Implementation](#pattern-1-parallel-research--implementation)
3. [Pattern 2: Multi-Variant Development](#pattern-2-multi-variant-development)
4. [Pattern 3: Comprehensive Code Review](#pattern-3-comprehensive-code-review)
5. [Advanced Workflows](#advanced-workflows)
6. [Token Budget Management](#token-budget-management)
7. [Integration with PAI](#integration-with-pai)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Core Concepts

### What Are Async Agents?

**Async agents** are Claude Code Task tool invocations running with `run_in_background: true`:

```typescript
// Main thread continues unblocked
Task({
  subagent_type: "researcher",
  description: "Research OAuth2 security",
  prompt: "Research OAuth2 best practices...",
  run_in_background: true  // <-- Key parameter
});

// Main thread immediately returns, agent runs in background
```

**Benefits**:
- ✅ Main thread continues working
- ✅ Parallel execution (3x-5x speedup)
- ✅ No branch switching needed
- ✅ Comprehensive multi-aspect reviews
- ✅ Research while implementing

### Git Worktree Automation

**Worktrees** create multiple working directories from a single repo:

```bash
Main Repo: C:\Jarvis\AI Workspace\Personal_AI_Infrastructure
├─ Branch: main (active development)
│
Worktrees:
├─ ../pai-worktrees/theme-light
│  └─ Branch: feature/theme-light
├─ ../pai-worktrees/theme-dark
│  └─ Branch: feature/theme-dark
└─ ../pai-worktrees/theme-a11y
   └─ Branch: feature/theme-a11y
```

**Benefits**:
- ✅ No branch switching (stay on main)
- ✅ Parallel variant testing
- ✅ Isolated agent workspaces
- ✅ Easy comparison before merging

---

## Pattern 1: Parallel Research + Implementation

### Use Case

**Scenario**: Implementing a feature that requires domain knowledge

**Traditional Approach** (Sequential):
```
1. Research OAuth2 security → 15 min
2. Implement authentication → 20 min
3. Review best practices → 10 min
Total: 45 minutes
```

**Async Approach** (Parallel):
```
1. Launch background research agent → 30 sec
2. Implement authentication (while research runs) → 20 min
3. Retrieve research results → 2 min
4. Apply findings → 5 min
Total: 27 minutes (40% faster)
```

### Implementation

**Step 1**: Launch background research
```bash
/async-agent research "OAuth2 security best practices for Next.js applications"
```

**Output**:
```
🚀 Background research agent launched
Task ID: research-oauth2-abc123
Agent: researcher
Estimated time: 12-15 minutes
Tokens budgeted: 50,000

Continue coding - you'll be notified when complete.
Check status: /async-agent status
```

**Step 2**: Continue main work
```typescript
// Implement authentication while research runs
export async function signIn(credentials: Credentials) {
  // Basic implementation
  const user = await db.user.findUnique({
    where: { email: credentials.email }
  });

  // Research will provide security enhancements
}
```

**Step 3**: Retrieve results when notified
```
🎉 BACKGROUND AGENT COMPLETED (Voice + System Reminder)

Agent: researcher
Task: OAuth2 security research
Duration: 13m 25s
Results: /async-agent retrieve research-oauth2-abc123
```

```bash
/async-agent retrieve research-oauth2-abc123
```

**Step 4**: Apply research findings
```typescript
// Enhanced with research findings
export async function signIn(credentials: Credentials) {
  // ✅ PKCE implementation (from research)
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // ✅ Token rotation (from research)
  const tokens = await exchangeCodeForTokens(code, codeVerifier);

  // ✅ httpOnly cookies (from research)
  cookies().set('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  });
}
```

### When to Use This Pattern

**✅ Perfect for**:
- Implementing unfamiliar technologies
- Security-critical features
- Performance-sensitive code
- API integrations (research docs while coding)
- New framework features

**❌ Not ideal for**:
- Simple CRUD operations
- Well-understood patterns
- Quick fixes (<5 min tasks)

---

## Pattern 2: Multi-Variant Development

### Use Case

**Scenario**: Testing multiple design approaches to find the best solution

**Example**: Theme system with 3 different approaches

### Implementation

**Step 1**: Create 3 worktrees with agents
```bash
/async-agent worktree theme-light "Implement minimalist light theme with clean typography"
/async-agent worktree theme-dark "Implement bold dark theme with high contrast"
/async-agent worktree theme-a11y "Implement WCAG AAA accessible theme with maximum readability"
```

**Output per worktree**:
```
📁 Git worktree created
Location: ../pai-worktrees/theme-light
Branch: feature/theme-light

🚀 Engineer agent launched in worktree
Task ID: worktree-theme-light-xyz789
Agent: engineer
Directory: ../pai-worktrees/theme-light

Main branch unchanged. Agent working in isolation.
```

**Step 2**: Continue main branch work
```typescript
// Main branch: Work on core functionality
// No branch switching needed
export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-layout">
      {children}
    </div>
  );
}
```

**Step 3**: Monitor progress
```bash
/worktree list
```

**Output**:
```
📂 ACTIVE WORKTREES

Main Repository:
└─ C:\Jarvis\AI Workspace\Personal_AI_Infrastructure
   Branch: main
   Commit: f46d65b

Worktrees (3):
├─ theme-light
│  Location: ../pai-worktrees/theme-light
│  Branch: feature/theme-light
│  Status: Modified (8 files changed)
│  Agent: engineer (running for 5m 30s)
│  Tokens: 18,450 / 50,000 (37%)
│
├─ theme-dark
│  Location: ../pai-worktrees/theme-dark
│  Branch: feature/theme-dark
│  Status: Modified (12 files changed)
│  Agent: engineer (running for 5m 15s)
│  Tokens: 22,100 / 50,000 (44%)
│
└─ theme-a11y
   Location: ../pai-worktrees/theme-a11y
   Branch: feature/theme-a11y
   Status: Modified (15 files changed)
   Agent: engineer (running for 5m 10s)
   Tokens: 25,800 / 50,000 (52%)

Total: 3 worktrees
```

**Step 4**: Preview each variant
```bash
# Terminal 1
cd ../pai-worktrees/theme-light
npm run dev

# Terminal 2
cd ../pai-worktrees/theme-dark
npm run dev -- --port 3001

# Terminal 3
cd ../pai-worktrees/theme-a11y
npm run dev -- --port 3002
```

**Step 5**: Compare and decide
```bash
# Review commits
cd ../pai-worktrees/theme-light
git log main..feature/theme-light --oneline

# Check file changes
git diff main..feature/theme-light

# Run tests
npm test
```

**Step 6**: Merge winner
```bash
/worktree merge theme-dark
```

**Output**:
```
🔀 Merging worktree: theme-dark

Step 1: Switching to main branch...
✅ On branch main

Step 2: Merging feature/theme-dark...
Updating f46d65b..a1b2c3d
Fast-forward
 src/styles/theme.ts         | 45 ++++++++++++++++
 src/components/Layout.tsx   | 12 +++--
 src/app/globals.css         | 89 ++++++++++++++++++++++++++++++
 4 files changed, 177 insertions(+), 3 deletions(-)

✅ Merge successful!
```

**Step 7**: Cleanup losers
```bash
/worktree cleanup theme-light
/worktree cleanup theme-a11y
```

### When to Use This Pattern

**✅ Perfect for**:
- A/B testing different implementations
- UI/UX variant testing
- API design comparisons (REST vs GraphQL)
- Algorithm performance testing
- Architecture refactoring experiments

**❌ Not ideal for**:
- Single clear solution
- Sequential improvements
- Small tweaks to existing code

---

## Pattern 3: Comprehensive Code Review

### Use Case

**Scenario**: Need multi-aspect validation before deployment

**Traditional Approach**:
```
1. Security review → 15 min
2. Performance review → 12 min
3. Accessibility review → 10 min
4. Architecture review → 8 min
5. Code duplication check → 5 min
Total: 50 minutes
```

**Async Approach**:
```
Launch 5 parallel review agents → 30 sec
All reviews run simultaneously → 15 min
Aggregate results → 3 min
Total: 18 minutes (64% faster)
```

### Implementation

**Step 1**: Launch parallel reviews
```bash
/async-agent review security
/async-agent review performance
/async-agent review accessibility
/async-agent review architecture
/async-agent review duplication
```

**Each agent output**:
```
🔍 Security review agent launched
Task ID: review-security-def456
Agent: pentester
Scope: Current codebase
Focus: OWASP Top 10, authentication, data validation
Estimated time: 12-15 minutes
```

**Step 2**: Monitor progress
```bash
/async-agent status
```

**Output**:
```
🤖 ASYNC AGENT STATUS

Running Agents (5):
├─ [review-security-def456] 8m 20s / est. 15m
│  Agent: pentester
│  Tokens: 35,200 / 50,000 (70%)
│  Status: in_progress
│
├─ [review-performance-ghi789] 8m 15s / est. 12m
│  Agent: engineer
│  Tokens: 28,100 / 50,000 (56%)
│  Status: in_progress
│
├─ [review-accessibility-jkl012] 8m 10s / est. 10m
│  Agent: designer
│  Tokens: 22,500 / 50,000 (45%)
│  Status: in_progress
│
├─ [review-architecture-mno345] 8m 05s / est. 8m
│  Agent: architect
│  Tokens: 18,900 / 50,000 (38%)
│  Status: in_progress
│
└─ [review-duplication-pqr678] 8m 00s / est. 5m
   Agent: Explore
   Tokens: 12,400 / 50,000 (25%)
   Status: in_progress

Token Budget:
├─ Background agents: 117,100 / 150,000 (78%)
└─ Remaining: 82,900 / 200,000 (41%)

⚠️  Budget alerts:
- Background agents at 78% of total limit
```

**Step 3**: Retrieve results as they complete
```bash
# First completion (5m)
/async-agent retrieve review-duplication-pqr678
```

**Output - Duplication Review**:
```
🎉 AGENT RESULTS: review-duplication-pqr678

Agent: Explore
Task: Code duplication check
Duration: 4m 52s
Status: completed

📄 FINDINGS:

## Code Duplication Report

### High Severity (Immediate action)
1. **Authentication validation** - Duplicated 8 times
   - Files: auth.ts, login.tsx, signup.tsx, profile.tsx, settings.tsx, +3 more
   - Lines: ~45 lines per instance
   - Recommendation: Extract to `validateAuthInput()` utility

2. **Database error handling** - Duplicated 12 times
   - Pattern: try/catch with same error mapping
   - Recommendation: Create `withDbErrorHandling()` wrapper

### Medium Severity
3. **Date formatting** - Duplicated 15 times
   - Recommendation: Use date-fns or create utility

📋 RECOMMENDATIONS:
1. Extract auth validation to shared utility (saves ~320 lines)
2. Create DB error handler wrapper (saves ~180 lines)
3. Standardize date formatting (saves ~90 lines)

Total potential reduction: ~590 lines (8% of codebase)
```

**Step 4**: Aggregate all reviews
```bash
# Wait for all completions
/async-agent retrieve review-security-def456
/async-agent retrieve review-performance-ghi789
/async-agent retrieve review-accessibility-jkl012
/async-agent retrieve review-architecture-mno345
```

**Step 5**: Create action plan
```markdown
## Pre-Deployment Review Summary

### 🔴 Critical (Must fix)
- **Security**: SQL injection risk in search endpoint (review-security-def456)
- **Performance**: N+1 query in user dashboard (review-performance-ghi789)

### 🟡 High Priority
- **Duplication**: Extract auth validation (saves 320 lines)
- **Accessibility**: Missing ARIA labels on 12 components
- **Architecture**: Circular dependency in auth module

### 🟢 Low Priority
- **Performance**: Bundle size 15% over target (not critical)
- **Accessibility**: Color contrast ratios slightly below AAA
- **Architecture**: Consider moving to monorepo structure

### Action Items
1. Fix SQL injection (30 min) - BLOCKING
2. Fix N+1 query (15 min) - BLOCKING
3. Extract auth validation (45 min)
4. Add ARIA labels (30 min)
5. Resolve circular dependency (20 min)

Estimated total: 2h 20m
```

### When to Use This Pattern

**✅ Perfect for**:
- Pre-deployment validation
- Post-refactoring checks
- Security audits
- Performance optimization
- Accessibility compliance

**❌ Not ideal for**:
- Small PRs (<100 lines)
- Hotfixes (no time for comprehensive review)
- Experimental code (not production-bound)

---

## Advanced Workflows

### Workflow 1: Iterative Research + Multi-Variant

**Scenario**: Research multiple approaches, then test top candidates

```bash
# Phase 1: Research (parallel)
/async-agent research "React state management comparison 2025"
/async-agent research "Redux vs Zustand vs Jotai benchmarks"
/async-agent research "State management for large apps"

# Phase 2: Review research results
/async-agent retrieve [task-id-1]
/async-agent retrieve [task-id-2]
/async-agent retrieve [task-id-3]

# Phase 3: Test top 2 candidates (parallel worktrees)
/async-agent worktree state-zustand "Implement Zustand state management"
/async-agent worktree state-jotai "Implement Jotai state management"

# Phase 4: Compare and merge winner
/worktree merge state-zustand
/worktree cleanup state-jotai
```

### Workflow 2: Comprehensive Feature Development

**Scenario**: Build feature with research, implementation, and validation

```bash
# Phase 1: Research + Planning (parallel)
/async-agent research "Stripe payment integration best practices"
/async-agent review architecture  # Review current payment flow

# Phase 2: Implement in worktree
/async-agent worktree payment-stripe "Implement Stripe payment integration"

# Phase 3: Parallel validation (when implementation done)
/async-agent review security  # Security audit of payment code
/async-agent review performance  # Payment flow performance
cd ../pai-worktrees/payment-stripe && npm test  # Run tests

# Phase 4: Merge if all validations pass
/worktree merge payment-stripe
```

### Workflow 3: Continuous Background Research

**Scenario**: Build research queue for upcoming work

```bash
# Morning: Queue research for day's tasks
/async-agent research "Next.js 15 server actions best practices"
/async-agent research "PostgreSQL query optimization techniques"
/async-agent research "React 19 use hook patterns"

# Throughout day: Retrieve as needed
/async-agent status  # Check what's completed
/async-agent retrieve [task-id]  # Get results when needed
```

---

## Token Budget Management

### Budget Configuration

**Limits** (from user decisions):
```typescript
const BUDGET_CONFIG = {
  TOTAL: 200_000,                // Total session budget
  PER_AGENT_LIMIT: 50_000,       // Max per background agent
  TOTAL_BACKGROUND_LIMIT: 150_000, // Max all background agents
  WARNING_THRESHOLDS: [0.75, 0.85, 0.95], // Alert levels
};
```

### Budget Monitoring

**Real-time tracking** via `async-token-tracker.ts`:

```bash
/async-agent status
```

**Output**:
```
Token Budget:
├─ Main thread: 45,000 (22.5%)
├─ Background agents: 118,500 (59.3%)
└─ Remaining: 36,500 / 200,000 (18.2%)

⚠️  Budget alerts:
- 85% threshold reached
- Background agents at 79% of limit
- Agent review-security-def456 at 92% of per-agent limit
```

### Cost Estimation

**Model pricing** (per million tokens):
```typescript
const MODEL_PRICING = {
  'claude-3-5-haiku-20241022': { input: 0.25, output: 1.25 },
  'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0 },
  'claude-opus-4-5-20251101': { input: 15.0, output: 75.0 },
};
```

**Example cost calculation**:
```
Agent: researcher (Sonnet 4.5)
Tokens: 42,100 (60% input, 40% output)

Input: 25,260 tokens × $3.00 / 1M = $0.076
Output: 16,840 tokens × $15.00 / 1M = $0.253
Total: $0.329
```

### Budget Optimization

**Strategies**:

1. **Use Haiku for simple tasks**
```bash
# Research that doesn't need deep analysis
Task({
  subagent_type: "researcher",
  model: "haiku",  // 12x cheaper than Sonnet
  prompt: "List OAuth2 providers"
});
```

2. **Set token limits per agent**
```typescript
// Limit expensive agents
if (agentType === 'architect') {
  tokensLimit = 30_000;  // Lower limit for expensive analysis
}
```

3. **Monitor and stop runaway agents**
```bash
/async-agent status
# See agent at 95% budget
/async-agent stop <task-id>  # Stop before hitting limit
```

4. **Batch related research**
```bash
# Instead of 5 separate research agents (5 × 50K = 250K potential)
# Combine into 2 comprehensive agents (2 × 50K = 100K max)
/async-agent research "OAuth2, JWT, PKCE, token rotation - comprehensive security guide"
```

---

## Integration with PAI

### Notification Integration

**Triple notification system** (from `async-agent-complete.ts`):

**1. Voice Announcement** (port 8888)
```
Voice server announces: "Background research agent completed: OAuth2 security"
```

**2. Status Update**
```json
// ~/.claude/state/async-agents.json updated
{
  "active_agents": [],
  "completed_agents": [
    {
      "task_id": "research-oauth2-abc123",
      "status": "completed",
      "completed_at": "2025-12-20T08:15:30Z",
      "duration_ms": 805000,
      "tokens_used": 42100
    }
  ]
}
```

**3. System Reminder**
```
Next user message receives:
<system-reminder>
🎉 BACKGROUND AGENT COMPLETED
Agent: researcher
Task: OAuth2 security research
Duration: 13m 25s
Tokens: 42,100
Results: /async-agent retrieve research-oauth2-abc123
</system-reminder>
```

### Observability Dashboard

**Integration with agent-observability**:

New event types added:
```typescript
// BackgroundAgentStart event
{
  type: "BackgroundAgentStart",
  timestamp: "2025-12-20T08:02:05Z",
  agent_id: "research-oauth2-abc123",
  agent_type: "researcher",
  task_description: "Research OAuth2 security",
  tokens_budgeted: 50000
}

// BackgroundAgentComplete event
{
  type: "BackgroundAgentComplete",
  timestamp: "2025-12-20T08:15:30Z",
  agent_id: "research-oauth2-abc123",
  status: "completed",
  duration_ms: 805000,
  tokens_used: 42100,
  estimated_cost: "$0.329"
}
```

**Visualization**: Swim lanes showing parallel execution

### `/pai-status` Integration

**Updated command** shows async agents:

```bash
/pai-status
```

**Output includes**:
```
🤖 PAI Status Report

├─ Docker Agents: 5 active
│  └─ ... (existing Docker agents)

├─ Claude Async Agents: 3 running, 5 completed
│  ├─ [research-oauth2-abc123] 5m 20s / est. 10m (45K tokens)
│  ├─ [worktree-theme-light-xyz789] 2m 15s / est. 15m (18K tokens)
│  └─ [review-security-def456] 1m 10s / est. 12m (12K tokens)

├─ Git Worktrees: 2 active
│  ├─ ../pai-worktrees/theme-light (feature/theme-light)
│  └─ ../pai-worktrees/theme-dark (feature/theme-dark)

└─ Token Budget: 118,500 / 200,000 used (59.3%)
   ├─ Main thread: 50,000
   └─ Background agents: 68,500
```

---

## Best Practices

### ✅ Do This

1. **Start small with 1-2 background agents**
   - Learn the pattern before scaling
   - Monitor token usage closely

2. **Check `/async-agent status` regularly**
   - Every 5-10 minutes during parallel work
   - Catch budget overruns early

3. **Use worktrees for variants**
   - Better isolation than branches
   - Easy to compare before merging

4. **Retrieve results promptly**
   - Results stored for 24 hours only
   - Don't let completed work go stale

5. **Clean up worktrees after merging**
   - `/worktree cleanup <name>` after merge
   - Keep workspace tidy

### ❌ Don't Do This

1. **Don't background tasks needing user input**
   - Agent will block waiting for input
   - Wastes token budget

2. **Don't use for sequential dependent tasks**
   - Task B needs Task A's output
   - No parallelism benefit

3. **Don't spawn 10+ agents without budget check**
   - 10 agents × 50K = 500K tokens (exceeds budget)
   - Monitor `/async-agent status`

4. **Don't forget running agents**
   - Check `/pai-status` before session end
   - Stop unnecessary agents

5. **Don't modify same files in main + worktree**
   - Creates merge conflicts
   - Plan file isolation carefully

---

## Troubleshooting

### Problem: Agent Stuck in "in_progress"

**Symptoms**:
```
Agent running for 30+ minutes (expected 10-15)
Token usage not increasing
```

**Solutions**:
```bash
# Check detailed status
/async-agent status

# Stop and restart
/async-agent stop <task-id>
/async-agent research "retry same task"
```

### Problem: Token Budget Exceeded

**Symptoms**:
```
⚠️  Background agents at 95% of total limit
⚠️  Agent review-security at 98% of per-agent limit
```

**Solutions**:
```bash
# Stop non-critical agents
/async-agent stop <task-id>

# Wait for current agents to complete
/async-agent status  # Monitor progress

# Use Haiku for new agents
Task({ model: "haiku", ... })
```

### Problem: Worktree Merge Conflicts

**Symptoms**:
```
⚠️  Merge conflicts detected!
Conflicting files:
- src/styles/theme.ts
- src/app/globals.css
```

**Solutions**:
```bash
# Option 1: Resolve manually
cd C:\Jarvis\AI Workspace\Personal_AI_Infrastructure
git merge feature/theme-minimal
# Resolve conflicts in editor
git add .
git merge --continue

# Option 2: Use worktree version
git checkout --theirs <file>
git add <file>
git merge --continue

# Option 3: Abort and review
git merge --abort
cd ../pai-worktrees/theme-minimal
# Review changes, cherry-pick specific commits
```

### Problem: Results Not Available

**Symptoms**:
```
/async-agent retrieve <task-id>
❌ Error: Results not found
```

**Solutions**:
```bash
# Check if agent completed
/async-agent status

# Results expire after 24 hours
# Check archive
ls ~/.claude/state/async-agents/archive/$(date +%Y-%m-%d)/

# Re-run if needed
/async-agent research "same task"
```

### Problem: Voice Notifications Not Working

**Symptoms**:
```
Agent completes but no voice announcement
```

**Solutions**:
```bash
# Check voice server status
curl http://localhost:8888/health

# Start voice server if not running
# (User's voice server setup)

# Verify hook configuration
cat ~/.claude/hooks/async-agent-complete.ts
```

---

## Summary

**Async orchestration** enables:
- ✅ 3x-5x productivity on parallel tasks
- ✅ Zero branch-switching friction
- ✅ Multi-aspect comprehensive reviews
- ✅ Research while implementing
- ✅ A/B testing multiple variants

**Key Skills**:
1. Identify parallelizable tasks
2. Monitor token budgets
3. Manage git worktrees
4. Aggregate async results
5. Optimize for cost

**Integration**:
- Commands: `/async-agent`, `/worktree`
- Hooks: Token tracking, triple notification
- Observability: `/pai-status`, dashboard
- State: Persistent async-agents.json

**Next Steps**:
1. Start with Pattern 1 (parallel research)
2. Try Pattern 2 (multi-variant) when comfortable
3. Use Pattern 3 (comprehensive review) before deployments
4. Experiment with advanced workflows
5. Optimize token budgets based on usage

---

**Last Updated**: 2025-12-20
**Status**: Production-ready comprehensive guide
