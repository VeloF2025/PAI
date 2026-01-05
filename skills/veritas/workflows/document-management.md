# Document Management Workflow

**Purpose:** Manage project documents - search, create, update, delete.

**Triggers:** "list documents", "create document", "find documents", "update document"

## Tools

### find_documents - Search and list documents
**Parameters:**
- `document_id` (optional): Get specific document
- `search` (optional): Search term

```bash
# List all documents
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "find_documents", "arguments": {}}'

# Search documents
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "find_documents", "arguments": {"search": "api spec"}}'
```

### manage_document - CRUD operations
**Parameters:**
- `action`: "create", "update", "delete"
- `document_id`: Required for update/delete
- `data`: Document data for create/update

```bash
# Create document
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "manage_document",
    "arguments": {
      "action": "create",
      "data": {
        "title": "API Specification",
        "content": "API documentation content...",
        "project_id": "abc123"
      }
    }
  }'
```

## Best Practices
- ✅ Link documents to projects
- ✅ Use descriptive titles
- ✅ Search before creating
- ❌ Don't duplicate documents

---
**Complexity:** Low | **Execution Time:** <300ms
