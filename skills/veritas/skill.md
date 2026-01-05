---
name: veritas
description: |
  Access Veritas AI knowledge management and project automation tools through MCP.
  Provides RAG search, code examples, project management, task tracking, document
  management, and version control capabilities.

  USE WHEN user mentions 'veritas', 'knowledge search', 'rag search',
  'code examples', 'project management', 'task tracking', 'search docs',
  'find documentation', 'search knowledge base', 'veritas tools'
---

# Veritas Knowledge & Project Management

**Purpose:** This skill provides access to Veritas AI's 14 MCP tools for knowledge management, RAG search, project automation, and task tracking through a clean HTTP API interface.

## Architecture Overview

Veritas exposes tools through MCP (Model Context Protocol) that can be accessed via HTTP API:

```
PAI → Veritas MCP API → Veritas Backend → Database
     (port 8282)       (port 8282)       (PostgreSQL)
```

## Available Tool Categories

### 1. RAG & Knowledge Base (5 tools)
- Search knowledge base semantically
- Find code examples and snippets
- Browse documentation sources
- Read full page content
- List available knowledge sources

### 2. Project Management (3 tools)
- List and search projects
- Create, update, delete projects
- Get project features and configuration

### 3. Task Management (2 tools)
- Find tasks with filters
- Create, update, delete tasks

### 4. Document Management (2 tools)
- Search and list documents
- Manage document lifecycle

### 5. Version Control (2 tools)
- Track version history
- Create and restore versions

## API Endpoint

All Veritas tools are accessed through:
```
http://localhost:8282/api/veritas/mcp
```

## Routing Logic

Natural language automatically routes to the appropriate workflow:

```
User Intent → Skill Activation → Workflow Selection → Tool Execution

Example Flow:
"Search the knowledge base for FastAPI best practices"
    ↓ (matches trigger: "search", "knowledge")
veritas skill loads
    ↓ (analyzes intent: RAG search)
rag-search.md workflow selected
    ↓
Tool executes via API
```

## Included Workflows

### 1. rag-search.md
**Purpose:** Search knowledge base and find code examples
**Trigger:** "search knowledge", "find docs", "code examples", "rag search"
**Tools Used:**
- `rag_search_knowledge_base`
- `rag_search_code_examples`
- `rag_get_available_sources`

### 2. rag-browse.md
**Purpose:** Browse documentation structure and read pages
**Trigger:** "browse docs", "list pages", "read documentation"
**Tools Used:**
- `rag_list_pages_for_source`
- `rag_read_full_page`

### 3. project-management.md
**Purpose:** Manage projects and their features
**Trigger:** "list projects", "create project", "update project"
**Tools Used:**
- `find_projects`
- `manage_project`
- `get_project_features`

### 4. task-management.md
**Purpose:** Track and manage tasks
**Trigger:** "list tasks", "create task", "update task status"
**Tools Used:**
- `find_tasks`
- `manage_task`

### 5. document-management.md
**Purpose:** Manage project documents
**Trigger:** "list documents", "create document", "update document"
**Tools Used:**
- `find_documents`
- `manage_document`

### 6. version-control.md
**Purpose:** Track and restore versions
**Trigger:** "version history", "restore version", "list versions"
**Tools Used:**
- `find_versions`
- `manage_version`

## Usage Examples

### Knowledge Search
```
User: "Search the Veritas knowledge base for information about RAG implementation"
→ Activates veritas skill
→ Executes rag-search.md workflow
→ Calls rag_search_knowledge_base tool
→ Returns relevant documentation chunks
```

### Code Examples
```
User: "Find Python code examples for FastAPI"
→ Activates veritas skill
→ Executes rag-search.md workflow
→ Calls rag_search_code_examples tool
→ Returns code snippets with context
```

### Project Management
```
User: "List all Veritas projects"
→ Activates veritas skill
→ Executes project-management.md workflow
→ Calls find_projects tool
→ Returns project list with metadata
```

### Task Tracking
```
User: "Show me all tasks in 'doing' status"
→ Activates veritas skill
→ Executes task-management.md workflow
→ Calls find_tasks with status filter
→ Returns filtered task list
```

## API Integration Details

### Connection
First verify Veritas is running:
```bash
curl http://localhost:8282/api/veritas/mcp/status
```

Response:
```json
{
  "connected": true,
  "backend_url": "http://veritas-server:8282/api",
  "tools_count": 14
}
```

### Tool Discovery
List all available tools:
```bash
curl http://localhost:8282/api/veritas/mcp/tools
```

### Tool Execution
Generic tool call pattern:
```bash
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "rag_search_knowledge_base",
    "arguments": {
      "query": "How to implement RAG?",
      "limit": 5
    }
  }'
```

### Convenience Endpoints
Simplified endpoints for common operations:
```bash
# Search knowledge base
curl "http://localhost:8282/api/veritas/mcp/knowledge/search?query=FastAPI&limit=5"

# Search code examples
curl "http://localhost:8282/api/veritas/mcp/knowledge/code-search?query=async%20function&language=python"

# List knowledge sources
curl "http://localhost:8282/api/veritas/mcp/knowledge/sources"

# List projects
curl "http://localhost:8282/api/veritas/mcp/projects"

# List tasks
curl "http://localhost:8282/api/veritas/mcp/tasks?status=doing"
```

## Best Practices

### When to Use Veritas
- ✅ Searching technical documentation
- ✅ Finding code examples and patterns
- ✅ Managing projects and tasks
- ✅ Tracking document versions
- ✅ Browsing knowledge base structure

### When NOT to Use Veritas
- ❌ General web search (use web search tools instead)
- ❌ File system operations (use file tools)
- ❌ Code execution (use appropriate runtime)
- ❌ External API calls (use HTTP tools)

### Performance Tips
- Use specific search queries for better RAG results
- Filter tasks by status or project for faster queries
- Use convenience endpoints when possible
- Cache frequently accessed data

## Error Handling

### Common Issues

**Connection Failed:**
```
Error: Failed to connect to Veritas backend
Solution: Ensure Veritas Docker containers are running:
  docker compose -f docker-compose.veritas.yml up -d
```

**Tool Not Found:**
```
Error: Unknown MCP tool: invalid_tool_name
Solution: Use /tools endpoint to list valid tool names
```

**Invalid Arguments:**
```
Error: HTTP 400: Missing required parameter 'query'
Solution: Check tool documentation for required parameters
```

## Integration Points

### With Other Skills
- **research skill**: Use Veritas for codebase-specific research
- **fabric skill**: Process Veritas knowledge with Fabric patterns
- **prompting skill**: Enhance prompts with Veritas context

### With Agents
Agents can invoke specific Veritas workflows:
```python
# Example agent integration
veritas_result = await call_skill_workflow(
    skill="veritas",
    workflow="rag-search",
    params={"query": "authentication patterns", "limit": 3}
)
```

### With Commands
Create custom slash commands that use Veritas:
```bash
# Example: /search-docs <query>
curl "http://localhost:8282/api/veritas/mcp/knowledge/search?query=$1&limit=10"
```

## Technical Details

### Docker Services
Veritas runs as Docker Compose services:
- `veritas-server` - FastAPI backend (port 8282)
- `veritas-db` - PostgreSQL database (port 5432)
- `veritas-mcp` - MCP server (port 8061) [reference only]

### Network Configuration
Services communicate on `veritas_veritas-network`:
- Internal: `http://veritas-server:8282`
- External: `http://localhost:8282`

### Authentication
Currently no authentication required for local deployment.
Production deployments should add API key authentication.

## Documentation

### Veritas Documentation
- **MCP Integration**: `PAI_VERITAS_MCP_INTEGRATION.md`
- **API Routes**: `python/src/server/api_routes/veritas_mcp_api.py`
- **MCP Client**: `python/src/server/services/veritas_mcp_client.py`

### External References
- **MCP Protocol**: https://spec.modelcontextprotocol.io/
- **FastMCP**: https://github.com/jlowin/fastmcp
- **Veritas Repository**: (Internal tool)

## Monitoring & Debugging

### Check Tool Status
```bash
# MCP client status
curl http://localhost:8282/api/veritas/mcp/status

# Backend health
curl http://localhost:8282/health

# Docker logs
docker logs veritas-server --tail 50
```

### Tool Performance
- RAG searches: ~1-3 seconds
- Project queries: <500ms
- Task operations: <200ms
- Document operations: <300ms

## Future Enhancements

Planned improvements:
- [ ] Streaming responses for long RAG searches
- [ ] Batch tool execution for multiple calls
- [ ] WebSocket support for real-time updates
- [ ] Authentication and rate limiting
- [ ] Result caching for repeated queries

---

**Status:** Production ready - All 14 tools tested and operational
**Version:** 1.0.0
**Last Updated:** 2025-11-15
