# Create New Skill Workflow (Research-First)

This workflow creates a new PAI skill with **research-first approach** - fetching latest documentation and best practices before generating skill content.

## When to Use This Workflow

Use this research-first workflow when:
- Creating skills for frameworks/tools with frequent updates
- You want latest 2025 documentation instead of training data
- The skill requires current best practices and patterns
- You need version-specific content

For simple, static skills, use `create-new.md` workflow instead.

---

## Step 1: Define Skill Purpose

**User Request**: "Create a skill for [framework/tool]"

**Examples**:
- "Create a skill for Playwright testing"
- "Create a skill for Next.js 15 app router"
- "Create a skill for FastAPI async patterns"

**Ask User**:
```
I'll create a skill for [framework/tool].

Should I research latest documentation first? (Recommended)
- Yes (research-first): Fetches 2025 docs, takes ~3 minutes
- No (template-only): Uses existing templates, instant

Choose: [Yes/No]
```

---

## Step 2: 🆕 RESEARCH PHASE (If User Chose Yes)

**Execute**: Use research skill to fetch latest documentation

### Research Queries

Generate queries based on skill type:

```python
from validation.research_integration import DocumentationResearcher
import asyncio

researcher = DocumentationResearcher()

# Example: Playwright skill
queries = [
    "Playwright latest documentation 2025",
    "Playwright best practices TypeScript",
    "Playwright CI/CD integration patterns",
    "Playwright parallel test execution",
    "Playwright visual regression testing"
]

# Run research (standard mode: 9 agents, 3 min)
results = asyncio.run(
    researcher.research_framework("playwright", version=None, research_mode="standard")
)

print(f"Research complete!")
print(f"- Found {len(results.best_practices)} best practices")
print(f"- Extracted {len(results.patterns)} validation patterns")
print(f"- Identified {len(results.common_pitfalls)} common pitfalls")
print(f"- Confidence: {results.confidence_score * 100}%")
```

### Research Output

```
Research Results for: playwright

Best Practices:
1. Use data-testid selectors for stable tests
2. Implement Page Object Model for reusability
3. Leverage auto-waiting and retry mechanisms
4. Use fixtures for test setup/teardown
5. Enable trace on failure for debugging

Common Pitfalls:
1. Using CSS selectors that change frequently
2. Not waiting for network requests to complete
3. Hardcoding timeouts instead of auto-wait
4. Running tests serially instead of parallel
5. Not implementing proper test isolation

Security Patterns:
1. Sanitize user inputs in test data
2. Use environment variables for sensitive data
3. Implement proper authentication in tests

Testing Patterns:
1. Organize tests by feature/page
2. Use describe blocks for grouping
3. Implement visual regression tests
4. Add accessibility tests with axe

Confidence Score: 92%
Sources: Official Playwright docs, GitHub best practices
```

---

## Step 3: Synthesis Phase

**Objective**: Convert research results into skill structure

### Extract Key Components

From research results, extract:

1. **Core Workflow**: Main usage patterns
2. **Activation Triggers**: When to use this skill
3. **Best Practices**: Do's and don'ts
4. **Common Mistakes**: Pitfalls to avoid
5. **Code Examples**: Real implementation samples

### Example Synthesis

```yaml
Skill Components (from research):

CORE_WORKFLOW:
  - "Use data-testid for selectors"
  - "Implement Page Object Model"
  - "Enable auto-waiting"
  - "Run tests in parallel"

ACTIVATION_TRIGGERS:
  - "User mentions 'playwright', 'e2e testing', 'end-to-end'"
  - "Files matching tests/e2e/*.spec.ts"
  - "playwright.config.ts exists"

BEST_PRACTICES:
  - "Always use fixtures for setup/teardown"
  - "Enable trace on CI for debugging"
  - "Implement visual regression tests"

ANTI_PATTERNS:
  - "Avoid hardcoded timeouts"
  - "Don't use fragile CSS selectors"
  - "Never run tests serially"

CODE_EXAMPLES:
  - "Page Object Model implementation"
  - "Parallel test execution config"
  - "Visual regression test example"
```

---

## Step 4: Generate Skill Structure

### Choose Template Type

Based on complexity:

**Simple Skill** (Single `SKILL.md` file):
- Basic commands and workflows
- No complex sub-workflows
- Examples: fabric-patterns, youtube-extraction

**Complex Skill** (with `workflows/` directory):
- Multiple workflows
- Sub-processes
- Examples: research, veritas, create-skill

### Generate SKILL.md

**Template**:

```markdown
---
name: [skill-name]
description: |
  [Framework/Tool Name] - [One-line description]

  TRIGGER: [When to activate - natural language patterns]

  FEATURES (from research):
  - [Feature 1]
  - [Feature 2]
  - [Feature 3]

  This skill uses latest [YEAR] documentation and best practices.
---

# [Skill Name]

## When to Activate This Skill

**Triggers**:
- User mentions: [list keywords from research]
- File patterns: [detected patterns]
- Explicit invocation: @skill-name

## Core Workflow (from latest docs)

### 1. [Main Task]

[Description from research]

**Best Practice** (2025):
[Current best practice from research]

**Anti-Pattern** (Avoid):
[Common pitfall from research]

### 2. [Secondary Task]

[Continue with synthesis...]

## Examples (from latest research)

### Example 1: [Use Case]

```[language]
// [Code example from research or synthesized]
```

### Example 2: [Another Use Case]

```[language]
// [Another example]
```

## Common Mistakes (from research)

1. **[Pitfall 1]**: [Description and how to avoid]
2. **[Pitfall 2]**: [Description and how to avoid]

## Security Considerations (if applicable)

[Security patterns from research]

## Performance Tips (if applicable)

[Performance best practices from research]

## References

- Research Date: [YYYY-MM-DD]
- Confidence Score: [XX]%
- Sources: [List sources from research]
```

### Add Workflows (if complex skill)

**Create**: `workflows/` subdirectory

**Files**:
- `main-workflow.md` - Primary use case
- `advanced-patterns.md` - Advanced techniques (if applicable)
- `troubleshooting.md` - Common issues and solutions

---

## Step 5: Save and Register

### Save Skill Files

```bash
# Create skill directory
mkdir -p ~/.claude/skills/[skill-name]

# Save SKILL.md
[Write generated content to SKILL.md]

# If complex skill, create workflows
mkdir -p ~/.claude/skills/[skill-name]/workflows
[Write workflow files]
```

### Register in Global Context

**Update**: `~/.claude/global/KAI.md`

Add to `available_skills` section:

```markdown
### [Skill Name] (@skill-name)

**Purpose**: [One-line from research]
**Trigger**: [Keywords]
**Research-based**: ✅ Latest [YEAR] docs
**Confidence**: [XX]%
```

---

## Step 6: Testing

### Test Activation

```
User: "Help me with [keyword that should trigger]"
Expected: Skill activates automatically
```

### Test Content Accuracy

```
User: "@skill-name show best practices"
Expected: Shows research-based best practices
```

### Verify Research Quality

Check that skill content includes:
- [ ] Latest documentation patterns (not outdated)
- [ ] Current year best practices
- [ ] Research confidence score ≥ 80%
- [ ] Proper citations/sources

---

## Comparison: Research-First vs Template-Only

| Aspect | Research-First | Template-Only |
|--------|---------------|--------------|
| **Time** | ~5 minutes | Instant |
| **Accuracy** | Latest 2025 docs | Training data (up to Jan 2025) |
| **Best Practices** | Current industry standards | Historical patterns |
| **Version-Specific** | Detects breaking changes | Generic patterns |
| **Confidence** | Scored (80-95%) | Unscored |
| **Maintenance** | Auto-cached 30 days | Manual updates |

---

## Example: Full Research-First Workflow

**User**: "Create a skill for Playwright"

**Claude**:
```
I'll create a Playwright skill with latest 2025 documentation.

🔬 Researching...
- Playwright latest documentation
- Best practices for TypeScript
- CI/CD integration patterns
- Parallel execution strategies
- Visual regression testing

⏱️  Estimated: 3 minutes
```

**[3 minutes later]**

```
✅ Research Complete!

Found:
- 12 best practices (2025)
- 8 common pitfalls
- 15 code examples
- 92% confidence score

Generating skill structure...
```

**[Generates SKILL.md with research-based content]**

```
✅ Skill Created: ~/.claude/skills/playwright/SKILL.md

Research-Based Features:
- Page Object Model patterns (latest)
- Auto-waiting strategies
- Parallel test execution config
- Visual regression setup

Trigger: @playwright or "playwright testing"

Test it: "Help me write a Playwright test"
```

---

## Troubleshooting

### Research Fails

**Symptom**: Research returns low confidence (<60%) or errors

**Solution**:
1. Check internet connection
2. Verify research skill is working: `/conduct-research --mode quick "test query"`
3. Fallback to template-only: Use `create-new.md` workflow

### Outdated Patterns Despite Research

**Symptom**: Research returns old patterns

**Solution**:
1. Clear research cache: `researcher.clear_cache("framework-name")`
2. Force fresh research: `use_cache=False`
3. Update research queries to include year: "framework 2025"

### Research Takes Too Long

**Symptom**: Research exceeds 5 minutes

**Solution**:
1. Use "quick" mode instead of "standard": 3 agents instead of 9
2. Reduce number of queries: Focus on top 3 most important
3. Cache results for reuse

---

## Next Steps After Skill Creation

1. **Test thoroughly**: Invoke skill multiple ways
2. **Gather feedback**: Use skill for 1 week, note issues
3. **Update if needed**: Re-run research after framework updates
4. **Share**: If useful, consider contributing to PAI community

---

**Workflow Version**: 1.0 (Research-First)
**Created**: 2025-11-15
**Maintenance**: Re-research every 30 days or on major version changes
