# RAG Browse Workflow

**Purpose:** Browse documentation structure and read full page content.

**Triggers:** "browse docs", "list pages", "read documentation", "show pages for", "read full page"

## Tools Used

### 1. rag_list_pages_for_source
List all pages/documents in a specific knowledge source.

**Parameters:**
- `source_id` (required): Source identifier

**API Call:**
```bash
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "rag_list_pages_for_source",
    "arguments": {"source_id": "123"}
  }'
```

### 2. rag_read_full_page
Retrieve complete page content with metadata.

**Parameters (one required):**
- `page_id` (optional): Page ID from database
- `url` (optional): Page URL to fetch

**API Call:**
```bash
# By page ID
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "rag_read_full_page",
    "arguments": {"page_id": "456"}
  }'

# By URL
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "rag_read_full_page",
    "arguments": {"url": "https://docs.example.com/page"}
  }'
```

## Workflow Steps

### Step 1: Identify Source
- First, list available sources using `rag_get_available_sources`
- User can specify source by name or ID

### Step 2: List Pages
- Call `rag_list_pages_for_source` with source ID
- Display pages with titles and URLs

### Step 3: Read Full Content
- When user selects a page, call `rag_read_full_page`
- Can use either page_id or direct URL

### Step 4: Present Content
- Display full page text
- Show metadata (title, URL, source, timestamp)
- Provide navigation options (next/prev page)

## Example Usage

### Example: Browse FastAPI Documentation
```bash
# Step 1: Get source ID
curl "http://localhost:8282/api/veritas/mcp/knowledge/sources"

# Step 2: List pages for source
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "rag_list_pages_for_source", "arguments": {"source_id": "fastapi-docs"}}'

# Step 3: Read specific page
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "rag_read_full_page", "arguments": {"page_id": "123"}}'
```

## Best Practices

- ✅ List pages before reading to find relevant content
- ✅ Use page_id when available (faster than URL lookup)
- ✅ Cache source IDs for repeated browsing
- ❌ Don't read all pages sequentially (use search instead)

---

**Complexity:** Low
**Execution Time:** <1 second per operation
