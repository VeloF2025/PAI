# Agent Integration with Ref.tools

## Purpose

Enable all Claude Code agents to leverage Ref.tools for documentation-driven development.

## Agent Types and Ref.tools Usage

### 1. Coding Agent

**When to use Ref.tools:**
- Before implementing any external API integration
- When encountering unfamiliar library methods
- When debugging API-related errors

**Workflow:**
```
1. Identify external dependency
2. Search documentation: mcp__Ref__ref_search_documentation("library method usage")
3. Read relevant page if needed
4. Implement following documented patterns
5. Validate implementation matches docs
```

### 2. Spec Writer Agent

**When to use Ref.tools:**
- Documenting API contracts
- Specifying integration requirements
- Writing technical ADRs

**Workflow:**
```
1. Identify technology being specified
2. Search for official patterns: mcp__Ref__ref_search_documentation("API design patterns")
3. Include documentation references in specs
4. Ensure specs align with library capabilities
```

### 3. Implementation Verifier Agent

**When to use Ref.tools:**
- Validating API usage correctness
- Checking for deprecated patterns
- Verifying configuration options

**Workflow:**
```
1. Identify external dependencies in code
2. Search for current best practices
3. Compare implementation with docs
4. Flag deviations or deprecated usage
```

### 4. Orchestrator Agent

**When to use Ref.tools:**
- Routing documentation tasks to appropriate agents
- Caching documentation context for parallel agents
- Coordinating multi-library integrations

**Workflow:**
```
1. Analyze task for documentation needs
2. Pre-fetch relevant documentation
3. Distribute context to sub-agents
4. Aggregate documentation references
```

## Integration Points

### Pre-Implementation Hook

Before any agent writes code involving external dependencies:

```typescript
// Automatic in ref-tools-integration.ts hook
if (needsDocumentation(task)) {
  const docs = await searchDocumentation(topic);
  injectContext(docs);
}
```

### Post-Implementation Validation

After code is written:

```typescript
// Validate implementation matches documentation
const dependencies = extractDependencies(code);
for (const dep of dependencies) {
  const docs = await searchDocumentation(dep);
  validateUsage(code, docs);
}
```

## MCP Tools Reference

### ref_search_documentation

Search indexed technical documentation:

```json
{
  "tool": "mcp__Ref__ref_search_documentation",
  "input": {
    "query": "React Server Components data fetching"
  }
}
```

Returns: Relevant documentation snippets (max ~2k tokens)

### ref_read_url

Read full page content:

```json
{
  "tool": "mcp__Ref__ref_read_url",
  "input": {
    "url": "https://react.dev/reference/rsc/server-components"
  }
}
```

Returns: Focused page content (max ~5k tokens)

### ref_web_search

Fallback web search:

```json
{
  "tool": "mcp__Ref__ref_web_search",
  "input": {
    "query": "Next.js 15 new features"
  }
}
```

Returns: Web search results with links

## Best Practices

### Query Optimization

**Good queries:**
- "Prisma findMany with pagination and cursor"
- "Next.js dynamic routes catch-all"
- "TypeScript satisfies vs as const"

**Poor queries:**
- "Prisma" (too broad)
- "How do I" (too vague)
- "Next.js everything" (unfocused)

### Token Efficiency

1. Start with search, not full reads
2. Read only the most relevant page
3. Use session caching (automatic)
4. Avoid redundant searches

### Error Handling

```typescript
try {
  const docs = await searchDocumentation(topic);
  if (!docs.results.length) {
    // Try web search fallback
    const webResults = await webSearch(topic);
    // Or proceed with caution
  }
} catch (error) {
  // Don't block on documentation failures
  logWarning("Documentation lookup failed, proceeding without");
}
```

## Session Context

The ref-tools-integration hook maintains session context:

- **Cache**: Recent searches cached in `~/.claude/cache/ref-tools/`
- **Logs**: Usage logged to `~/.claude/logs/ref-tools/`
- **Deduplication**: Same query returns cached results

## Metrics

Track documentation usage:

```json
{
  "searches_per_session": 5,
  "cache_hit_rate": 0.3,
  "avg_tokens_per_search": 1800,
  "fallback_rate": 0.1
}
```

## Troubleshooting

### No results

1. Check if library is indexed
2. Try alternative terminology
3. Use web search fallback
4. Check for typos in query

### Stale results

1. Include version in query
2. Check official changelog
3. Cross-reference with web search

### Rate limiting

1. Space out requests
2. Use session caching
3. Batch related queries
