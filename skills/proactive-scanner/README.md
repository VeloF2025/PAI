# Proactive Scanner Skill

Universal project scanner that proactively identifies actionable suggestions including TODOs, code quality issues, security concerns, and missing tests.

## Capabilities

1. **Universal Project Detection**: Auto-detects language, framework, package manager, and test framework
2. **Pattern Scanning**: Identifies TODOs, quality issues, security vulnerabilities, and missing tests
3. **Suggestion Queue**: Persists and tracks suggestions across sessions
4. **Context Injection**: Provides summaries for conversation context

## Commands

### Scan a Project
```bash
bun ~/.claude/proactive/cli.ts scan [path]
```
Scans the project and saves results to the queue.

### Show All Suggestions
```bash
bun ~/.claude/proactive/cli.ts show [path]
```
Shows all pending suggestions for a project.

### Show High Priority
```bash
bun ~/.claude/proactive/cli.ts high [path]
```
Shows only high priority (7+) suggestions.

### Filter by Type
```bash
bun ~/.claude/proactive/cli.ts type <todo|quality|security|testing> [path]
```
Shows suggestions filtered by type.

### Get Context Summary
```bash
bun ~/.claude/proactive/cli.ts context [path]
```
Gets a brief context summary suitable for injection.

### Manage Suggestions
```bash
bun ~/.claude/proactive/cli.ts dismiss <id> [path]  # Dismiss a suggestion
bun ~/.claude/proactive/cli.ts act <id> [path]      # Mark as acted upon
```

### List Tracked Projects
```bash
bun ~/.claude/proactive/cli.ts projects
```

### Cleanup Old Data
```bash
bun ~/.claude/proactive/cli.ts cleanup
```

## Suggestion Types

| Type | Description | Priority Range |
|------|-------------|----------------|
| TODO | TODO, FIXME, HACK, XXX comments | 4-9 |
| Quality | Console.log, debugger, empty catch | 3-8 |
| Security | Hardcoded secrets, SQL injection, XSS | 5-10 |
| Testing | Missing test files | 5 |

## Confidence Scoring

- **0.9-1.0**: Very high confidence (certain detection)
- **0.7-0.9**: High confidence (likely issue)
- **0.5-0.7**: Medium confidence (possible issue)
- **< 0.5**: Filtered out by default

## Integration

The scanner automatically runs on session start via the `proactive-scanner.ts` hook:
- Scans the working directory
- Merges with existing suggestions
- Outputs summary to context

## Configuration

Edit `~/.claude/proactive/config.json`:

```json
{
  "enabled": true,
  "scanOnStart": true,
  "minTimeBetweenScans": 30,
  "outputToContext": true,
  "maxSuggestions": 5
}
```

## File Structure

```
~/.claude/proactive/
  config.json              # Scanner configuration
  cli.ts                   # CLI interface
  scanner/
    index.ts               # Main orchestrator
    detect-project.ts      # Project auto-detection
    types.ts               # Shared interfaces
    patterns/
      todos.ts             # TODO/FIXME scanner
      quality.ts           # Code quality scanner
      security.ts          # Security scanner
      testing.ts           # Missing tests scanner
  suggestions/
    queue.ts               # Queue management
    data/                  # Persisted queue files
```

## When to Use

- Starting work on a project: Run scan to see what needs attention
- Before commits: Check high priority suggestions
- Code review: Review security and quality suggestions
- Test coverage: Check testing suggestions for missing tests
