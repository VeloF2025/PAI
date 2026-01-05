# RAG Search Workflow

**Purpose:** Search Veritas knowledge base using semantic search and find relevant code examples.

**Triggers:** "search knowledge", "find docs", "code examples", "rag search", "search veritas", "find information"

## Tools Used

### 1. rag_search_knowledge_base
Search knowledge base semantically using RAG (Retrieval-Augmented Generation).

**Parameters:**
- `query` (required): Search query text
- `limit` (optional): Maximum number of results (default: 5)

**API Call:**
```bash
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "rag_search_knowledge_base",
    "arguments": {
      "query": "How to implement authentication?",
      "limit": 5
    }
  }'
```

**Convenience Endpoint:**
```bash
curl "http://localhost:8282/api/veritas/mcp/knowledge/search?query=authentication&limit=5"
```

### 2. rag_search_code_examples
Find code snippets and examples in the knowledge base.

**Parameters:**
- `query` (required): Code search query
- `language` (optional): Programming language filter (e.g., "python", "typescript")

**API Call:**
```bash
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "rag_search_code_examples",
    "arguments": {
      "query": "async function example",
      "language": "typescript"
    }
  }'
```

**Convenience Endpoint:**
```bash
curl "http://localhost:8282/api/veritas/mcp/knowledge/code-search?query=async%20function&language=typescript"
```

### 3. rag_get_available_sources
List all knowledge sources in the database.

**Parameters:** None

**API Call:**
```bash
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "rag_get_available_sources",
    "arguments": {}
  }'
```

**Convenience Endpoint:**
```bash
curl "http://localhost:8282/api/veritas/mcp/knowledge/sources"
```

## Workflow Steps

### Step 1: Determine Search Type
Analyze user query to determine if they want:
- General documentation search → Use `rag_search_knowledge_base`
- Code examples specifically → Use `rag_search_code_examples`
- List of available sources → Use `rag_get_available_sources`

### Step 2: Prepare Search Query
For knowledge base search:
- Extract key terms from user query
- Keep query focused (3-10 words optimal)
- Include technical terms and concepts

For code search:
- Extract programming language if mentioned
- Focus on code patterns or functionality
- Include framework/library names if relevant

### Step 3: Execute Search
Call the appropriate tool via API:
```python
import httpx

async def search_knowledge(query: str, limit: int = 5):
    """Search Veritas knowledge base."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "http://localhost:8282/api/veritas/mcp/knowledge/search",
            params={"query": query, "limit": limit}
        )
        return response.json()

async def search_code(query: str, language: str = None):
    """Search for code examples."""
    params = {"query": query}
    if language:
        params["language"] = language

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "http://localhost:8282/api/veritas/mcp/knowledge/code-search",
            params=params
        )
        return response.json()
```

### Step 4: Process Results
Parse the response and extract:
- Document titles and URLs
- Relevance scores
- Content snippets
- Metadata (source, timestamp, etc.)

### Step 5: Present to User
Format results in a readable way:
```
Found X results in Veritas knowledge base:

1. [Title/URL]
   Relevance: [score]
   [Content snippet...]

2. [Title/URL]
   Relevance: [score]
   [Content snippet...]
```

## Example Usage

### Example 1: General Documentation Search
**User Query:** "Search Veritas for information about FastAPI authentication"

**Execution:**
```bash
curl "http://localhost:8282/api/veritas/mcp/knowledge/search?query=FastAPI%20authentication&limit=5"
```

**Expected Response:**
```json
{
  "results": [
    {
      "title": "FastAPI Security Guide",
      "url": "https://docs.example.com/fastapi/security",
      "score": 0.89,
      "content": "FastAPI provides several security utilities including OAuth2, JWT tokens..."
    }
  ]
}
```

### Example 2: Code Examples Search
**User Query:** "Find Python async function examples"

**Execution:**
```bash
curl "http://localhost:8282/api/veritas/mcp/knowledge/code-search?query=async%20function&language=python"
```

**Expected Response:**
```json
{
  "examples": [
    {
      "language": "python",
      "code": "async def fetch_data():\n    async with httpx.AsyncClient() as client:\n        ...",
      "context": "Async HTTP request example",
      "source": "httpx documentation"
    }
  ]
}
```

### Example 3: List Available Sources
**User Query:** "What documentation sources are available in Veritas?"

**Execution:**
```bash
curl "http://localhost:8282/api/veritas/mcp/knowledge/sources"
```

**Expected Response:**
```json
{
  "sources": [
    {
      "id": "1",
      "name": "FastAPI Documentation",
      "url": "https://fastapi.tiangolo.com",
      "pages": 156
    },
    {
      "id": "2",
      "name": "Python Best Practices",
      "url": "https://docs.python.org",
      "pages": 234
    }
  ]
}
```

## Best Practices

### Search Query Optimization
- ✅ Use specific technical terms
- ✅ Include framework/library names
- ✅ Keep queries focused (3-10 words)
- ✅ Use natural language for concepts
- ❌ Don't use very generic terms
- ❌ Don't include filler words
- ❌ Don't make queries too long

### Result Handling
- ✅ Check relevance scores
- ✅ Read content snippets before opening URLs
- ✅ Use multiple searches if needed
- ✅ Filter by language for code searches
- ❌ Don't rely on single search
- ❌ Don't ignore low-score results entirely

### Performance
- Default limit (5) is good for most queries
- Increase limit for broader research (up to 20)
- Use code search for implementation details
- Use knowledge search for concepts

## Error Handling

### No Results Found
```json
{
  "results": [],
  "message": "No relevant documents found"
}
```
**Action:** Try broader search terms or check available sources

### Connection Error
```
Error: Failed to connect to Veritas backend
```
**Action:** Verify Veritas Docker containers are running:
```bash
docker compose -f docker-compose.veritas.yml ps
```

### Invalid Query
```json
{
  "error": "Query parameter required"
}
```
**Action:** Ensure query is not empty and properly URL-encoded

## Integration Examples

### With Fabric Skill
Combine Veritas search with Fabric processing:
```bash
# Search for documentation
results=$(curl -s "http://localhost:8282/api/veritas/mcp/knowledge/search?query=API%20design&limit=5")

# Process with Fabric pattern
echo "$results" | fabric -p extract_wisdom
```

### With Research Skill
Use Veritas as a research source:
```bash
# Research workflow step
1. Search Veritas knowledge base
2. Search web for additional context
3. Combine and synthesize findings
```

---

**Complexity:** Low to Medium
**Execution Time:** 1-3 seconds per search
**Success Rate:** ~95% for indexed content
