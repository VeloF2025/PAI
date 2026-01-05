# Async Orchestration Skill

**Purpose**: Comprehensive skill for async agent coordination and parallel task execution

**Use When**:
- Multiple independent tasks can run in parallel
- Research needed while implementing
- Multi-variant testing/development
- Comprehensive code reviews across different aspects
- Git worktree-based parallel development

---

## Quick Activation

**Triggers** (Auto-detect):
- "launch background agent"
- "parallel research"
- "multi-variant"
- "comprehensive review"
- "worktree"
- "async agent"

**Manual Activation**:
```bash
/async-agent <command>
/worktree <command>
```

---

## Core Patterns

### Pattern 1: Parallel Research + Implementation
**When**: You need information while coding

```
Main Agent: Implement feature
Background Agent: Research best practices
Result: Research ready when implementation complete
```

**Example**:
```
/async-agent research "OAuth2 security best practices"
# Continue coding authentication
# Notified when research completes
/async-agent retrieve <task-id>
```

### Pattern 2: Multi-Variant Development
**When**: Testing multiple approaches simultaneously

```
Create 3 worktrees (theme variants)
Launch 3 background agents
Each implements in isolation
Review results, merge winner
```

**Example**:
```
/async-agent worktree theme-light "Implement light theme"
/async-agent worktree theme-dark "Implement dark theme"
/async-agent worktree theme-a11y "Implement accessible theme"
# All work in parallel
```

### Pattern 3: Comprehensive Code Review
**When**: Need multi-aspect validation

```
Launch 5 parallel review agents:
- Security audit
- Performance analysis
- Code duplication
- Accessibility review
- Architecture patterns
```

**Example**:
```
/async-agent review security
/async-agent review performance
/async-agent review accessibility
/async-agent review architecture
/async-agent review duplication
```

---

## Anti-Patterns

**Don't use for**:
- ❌ Tasks requiring user input
- ❌ Sequential dependent tasks (B needs A's output)
- ❌ More than 5-7 parallel agents (token budget)
- ❌ Short tasks (<2 minutes) - overhead not worth it

---

## Integration

**Works with**:
- `/async-agent` command (background task management)
- `/worktree` command (git worktree automation)
- Token tracking (automatic budget monitoring)
- Triple notification system (voice + status + reminder)
- PAI observability dashboard

---

## Files

**Documentation**:
- `CLAUDE.md` - Comprehensive patterns and workflows
- `.claude/commands/async-agent.md` - Command reference
- `.claude/commands/worktree.md` - Worktree automation

**Hooks**:
- `.claude/hooks/async-token-tracker.ts` - Budget monitoring
- `.claude/hooks/async-agent-complete.ts` - Triple notification

**State**:
- `~/.claude/state/async-agents.json` - Active/completed agents

---

## Quick Reference

```bash
# Launch background research
/async-agent research "topic"

# Create worktree + agent
/async-agent worktree <name> "task"

# Check status
/async-agent status

# Retrieve results
/async-agent retrieve <task-id>

# Worktree management
/worktree create <name> <branch>
/worktree list
/worktree merge <name>
/worktree cleanup <name>
```

---

**For comprehensive patterns, workflows, and best practices**: Read `CLAUDE.md`

**Token Budget**:
- 50K per agent limit
- 150K total background limit
- Warnings at 75%, 85%, 95%
