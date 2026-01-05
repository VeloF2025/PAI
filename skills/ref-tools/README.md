---
name: ref-tools
description: |
  Intelligent documentation lookup for development workflows.

  Use Ref.tools MCP to search and read technical documentation for any API, library, framework, or service. Token-efficient documentation retrieval that finds exactly what you need without wasting context.

  **When to use this skill:**
  - Implementing new API integrations
  - Learning library/framework patterns
  - Debugging unknown error messages
  - Validating best practices
  - Understanding configuration options

  **MCP Tools Available:**
  - `mcp__Ref__ref_search_documentation` - Search technical docs
  - `mcp__Ref__ref_read_url` - Read full documentation pages
  - `mcp__Ref__ref_web_search` - Web search fallback

  **Triggers:** "lookup docs", "search documentation", "find API reference", "@ref-tools"
---

# Ref.tools Documentation Skill

## Overview

This skill provides intelligent documentation lookup during development. It leverages the Ref.tools MCP server to search and retrieve API documentation, library references, and technical guides in a token-efficient manner.

## How It Works

Ref.tools is designed to match how AI models search while using minimal context:

1. **Smart Search**: Searches through indexed documentation to find exactly what you need
2. **Token Efficiency**: Returns only the most relevant 5k tokens, dropping irrelevant sections
3. **Session Awareness**: Never returns duplicate results within a session
4. **Link Following**: Can read full pages when you need deeper context

## Available Commands

### Search Documentation

```
Search for [topic] documentation
```

Example queries:
- "Search for React useEffect cleanup documentation"
- "Find Next.js API routes authentication"
- "Look up PostgreSQL JSONB operators"

### Read URL

When search results include relevant links, you can read full pages:

```
Read the documentation at [URL]
```

### Web Search Fallback

If documentation isn't indexed, use web search:

```
Web search for [topic]
```

## Best Practices

1. **Be Specific**: "React useEffect dependency array" vs just "React hooks"
2. **Include Context**: "Firebase auth with Next.js App Router"
3. **Version Specific**: "TypeScript 5.0 satisfies operator"
4. **Error Messages**: Include exact error text when debugging

## Integration with Agents

### Coding Agent Integration

The coding agent automatically uses Ref.tools when:
- Implementing features involving external APIs
- Encountering unknown library methods
- Validating implementation patterns

### Validation Integration

Documentation lookup is integrated with validation workflows to ensure:
- API usage matches documentation
- Best practices are followed
- Configuration options are correct

## Examples

### Example 1: API Integration

**User**: Implement Stripe checkout integration

**Agent Workflow**:
1. `mcp__Ref__ref_search_documentation("Stripe checkout session API")`
2. Reviews results, finds relevant section
3. `mcp__Ref__ref_read_url("https://stripe.com/docs/api/checkout/sessions")`
4. Implements checkout with correct parameters

### Example 2: Framework Pattern

**User**: Add authentication middleware to Express app

**Agent Workflow**:
1. `mcp__Ref__ref_search_documentation("Express middleware authentication")`
2. Gets pattern examples
3. Implements following documented patterns

### Example 3: Error Resolution

**User**: Getting "NEXT_REDIRECT is not a function" error

**Agent Workflow**:
1. `mcp__Ref__ref_search_documentation("Next.js redirect server component")`
2. Discovers correct import: `import { redirect } from 'next/navigation'`
3. Fixes the import

## Token Efficiency

Ref.tools is optimized for minimal context usage:

| Approach | Tokens Used |
|----------|-------------|
| Standard web fetch | 20,000+ |
| Ref.tools search | ~2,000 |
| Ref.tools read (focused) | ~5,000 |

This means you can look up multiple documentation sources without exhausting context.

## Configuration

The Ref.tools MCP server is configured globally in `~/.claude.json`:

```json
{
  "mcpServers": {
    "Ref": {
      "type": "http",
      "url": "https://api.ref.tools/mcp",
      "headers": {
        "x-ref-api-key": "your-api-key"
      }
    }
  }
}
```

## Troubleshooting

### No results found

- Try different search terms
- Use web search fallback
- Check if the library is less common

### Stale documentation

- Include version numbers in search
- Prefer official documentation sources
- Cross-reference with web search

### Token limit exceeded

- Break searches into smaller topics
- Read only the most relevant page sections
- Use session caching (automatic)

## Credits

Powered by [Ref.tools](https://ref.tools) - The one-stop-shop for keeping coding agents up-to-date on documentation.

## Related Skills

- `fabric` - Pattern-based text processing
- `research` - Multi-source research workflows
- `create-skill` - Create new skills from workflows
