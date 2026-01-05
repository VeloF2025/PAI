# Documentation Lookup Workflow

## Purpose

Efficiently lookup technical documentation for any API, library, or framework using Ref.tools MCP.

## Trigger Conditions

Use this workflow when:
- Implementing features with external libraries
- Debugging unknown API behaviors
- Validating configuration patterns
- Learning new frameworks

## Workflow Steps

### Step 1: Identify Documentation Need

Analyze the current task to determine what documentation is needed:
- **API Integration**: Search for API reference docs
- **Library Usage**: Search for library documentation
- **Error Resolution**: Search for error message context
- **Best Practices**: Search for pattern documentation

### Step 2: Search Documentation

Use the Ref.tools search tool with a specific query:

```
mcp__Ref__ref_search_documentation({
  "query": "[specific topic] [context]"
})
```

**Good queries:**
- "React useEffect cleanup function memory leak"
- "Next.js server actions form handling"
- "Prisma many-to-many relations with explicit join table"

**Avoid:**
- Too broad: "React" (too general)
- Too narrow: "function handleClick in component" (implementation specific)

### Step 3: Evaluate Results

Review search results for:
- Relevance to current task
- Official vs community documentation
- Version compatibility
- Code examples present

### Step 4: Read Full Documentation (if needed)

When search results reference a helpful page:

```
mcp__Ref__ref_read_url({
  "url": "[documentation URL from search results]"
})
```

### Step 5: Apply Documentation

Use the documentation to:
- Implement correct API usage
- Follow recommended patterns
- Handle edge cases
- Add proper error handling

### Step 6: Validate Implementation

Cross-reference implementation with documentation:
- Method signatures match
- Required parameters included
- Return types handled
- Error cases covered

## Example Workflow

### Task: Add Supabase authentication to Next.js app

**Step 1**: Identify need - Supabase Auth API with Next.js App Router

**Step 2**: Search documentation
```
mcp__Ref__ref_search_documentation("Supabase auth Next.js App Router server components")
```

**Step 3**: Results show `@supabase/ssr` package for Next.js App Router

**Step 4**: Read full page
```
mcp__Ref__ref_read_url("https://supabase.com/docs/guides/auth/server-side/nextjs")
```

**Step 5**: Implement following documented pattern:
- Create Supabase client for server components
- Handle session cookies
- Implement middleware for route protection

**Step 6**: Validate:
- Cookie options match documentation
- Middleware pattern correct
- Client/server separation proper

## Integration with Validation

This workflow integrates with the validation system:

1. **Pre-Implementation**: Search docs before writing code
2. **During Implementation**: Validate patterns match docs
3. **Post-Implementation**: Verify correct API usage

## Token Budget

Target token usage for documentation lookup:
- Initial search: ~500 tokens
- Results analysis: ~1,500 tokens
- Full page read: ~5,000 tokens
- **Total per lookup**: ~7,000 tokens

Keep lookups focused to stay within budget.

## Fallback Strategy

If Ref.tools search doesn't find results:

1. Try alternative search terms
2. Use web search: `mcp__Ref__ref_web_search("query")`
3. Check official documentation manually
4. Consider if library is too niche for indexing

## Output

After completing documentation lookup, provide:

1. **Summary** of what was found
2. **Key patterns** to follow
3. **Code examples** from documentation
4. **Caveats** or edge cases to handle
