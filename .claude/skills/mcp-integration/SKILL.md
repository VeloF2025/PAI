---
name: mcp-integration
description: |
  MCP Server Auto-Invocation System for PAI Skills

  This skill defines WHEN and HOW MCP servers should be automatically called.
  Other skills should reference this for consistent MCP usage.

  === AUTO-INVOCATION RULES ===

  **context7** - ALWAYS use when:
  - Writing code with external libraries (React, Next.js, Tailwind, etc.)
  - Before suggesting API patterns
  - User asks about library-specific features
  - TRIGGER: Add "use context7" to prompts for library docs

  **memory** - ALWAYS use when:
  - Starting a new session (recall project context)
  - After completing significant work (store learnings)
  - User references past decisions
  - TRIGGER: Automatic - stores/retrieves entities and relationships

  **sequential-thinking** - ALWAYS use when:
  - Complex multi-step problems
  - Architectural decisions
  - Debugging complex issues
  - Trade-off analysis
  - TRIGGER: Complex reasoning needed

  **github** - ALWAYS use when:
  - Creating PRs, issues, or commits
  - Searching code across repos
  - Checking CI/CD status
  - TRIGGER: GitHub operations

  **playwright** - ALWAYS use when:
  - E2E testing required
  - UI validation needed
  - Browser automation tasks
  - TRIGGER: Testing or browser tasks

triggers:
  - mcp
  - auto invoke
  - which mcp
  - mcp help
---

# MCP Auto-Invocation System

## Quick Reference: When to Use Each MCP

| MCP | Auto-Trigger Conditions | Example |
|-----|------------------------|---------|
| **context7** | Any library code writing | "use context7 for Next.js 15 app router" |
| **memory** | Session start/end, past references | Automatic entity storage |
| **sequential-thinking** | Complex reasoning | Architecture decisions |
| **github** | Repo operations | PR creation, code search |
| **playwright** | UI testing | E2E test execution |

---

## Integration Patterns for Skills

### Pattern 1: Library Documentation (context7)

When a skill involves writing code with external libraries:

```markdown
# In your skill's workflow:

## Before Writing Code
1. Identify libraries being used
2. Use context7 to fetch current documentation:
   "use context7 to look up [library] [version] [feature]"
3. Write code based on verified API patterns
```

### Pattern 2: Cross-Session Memory

When a skill should remember past work:

```markdown
# Memory automatically tracks:
- Project patterns discovered
- Decisions made and rationale
- Validation issues and fixes
- User preferences learned

# To explicitly recall:
"What do you remember about [topic] from our past sessions?"
```

### Pattern 3: Complex Reasoning (sequential-thinking)

When a skill needs multi-step analysis:

```markdown
# Use for:
- Comparing multiple approaches
- Step-by-step debugging
- Architectural trade-offs
- Risk analysis

# The MCP provides structured thinking with:
- Step-by-step decomposition
- Branching possibilities
- Revision of conclusions
```

---

## Skill-Specific MCP Mappings

### Research Skill → memory + context7
- Store research findings in memory
- Use context7 for technical documentation lookup

### Engineer Agent → context7 + playwright
- context7 for library APIs
- playwright for E2E testing after implementation

### Architect Agent → sequential-thinking + memory
- sequential-thinking for design decisions
- memory for past architectural patterns

### Prompting Skill → context7 + memory
- context7 for prompt engineering best practices
- memory for effective prompt patterns learned

### Docker Skill → memory
- Store container configurations
- Recall past deployment patterns

---

## How to Add MCP Integration to Any Skill

Add this section to your SKILL.md:

```markdown
## MCP Integration

### Required MCPs
- **[mcp-name]**: [why this skill needs it]

### Auto-Invocation Points
1. **[Trigger condition]**: Call [mcp-name] to [action]
2. **[Trigger condition]**: Call [mcp-name] to [action]

### Example Usage
\`\`\`
[Example of MCP being used in this skill's context]
\`\`\`
```

---

## Veritas MCP (Docker Required)

For truth-enforcement validation:

```bash
# Start Veritas first:
cd "C:/Jarvis/AI Workspace/Veritas"
docker compose -f docker-compose.veritas.yml up -d

# Then Veritas MCP provides:
- DGTS (Don't Game The System) validation
- NLNH (No Lies, No Hallucinations) confidence scoring
```

---

## MCP Health Check

Run `/mcp` to see connected servers, or:

```bash
claude mcp list
```

Expected output:
```
context7: ✓ Connected
memory: ✓ Connected
sequential-thinking: ✓ Connected
github: ✓ Connected
playwright: ✓ Connected
```

---

## Veritas Infrastructure Integration

When Veritas Docker is running, PAI automatically gains access to enterprise-grade memory:

### Veritas Memory Architecture

| Service | Port | Purpose | TTL |
|---------|------|---------|-----|
| **PostgreSQL + pgvector** | 5432 | Execution history with embeddings | Permanent |
| **Redis DB0** | 6379 | Embedding cache (50-70% hit rate) | 24 hours |
| **Redis DB1** | 6379 | Similarity search cache (30-40% hit rate) | 1 hour |

### How PAI Uses Veritas Memory

1. **Execution History**: All agent executions stored with embeddings for learning
2. **Similarity Search**: Find past similar tasks for context enhancement
3. **Embedding Cache**: Avoid redundant embedding API calls (60% cost reduction)
4. **Prometheus Metrics**: Track cache hits, execution success rates

### Starting Veritas for Memory Enhancement

```bash
# Start core services (includes Redis + PostgreSQL)
cd "C:/Jarvis/AI Workspace/Veritas"
docker compose -f docker-compose.veritas.yml up -d

# Verify memory services
curl http://localhost:8282/api/memory/stats
```

### When to Use Veritas vs MCP Memory

| Feature | MCP Memory | Veritas Memory |
|---------|------------|----------------|
| **Storage** | Local JSON file | PostgreSQL + pgvector |
| **Similarity** | Basic | Vector cosine similarity |
| **Caching** | None | Redis multi-tier |
| **Metrics** | None | Prometheus |
| **Requires** | Always available | Docker running |

**Recommendation**: Use MCP memory for lightweight persistence, Veritas for production workloads.

### Veritas Memory API Endpoints

When Docker is running:
```bash
# Store execution
POST http://localhost:8282/api/memory/executions

# Find similar past executions
GET http://localhost:8282/api/memory/similar?query=task+description

# Get execution metrics
GET http://localhost:8282/api/memory/metrics?skill=research

# Cache stats
GET http://localhost:8282/api/memory/cache/stats
```
