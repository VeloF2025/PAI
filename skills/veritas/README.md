# Veritas Skill - Knowledge Management & Project Automation

## Overview

The Veritas skill provides access to 14 MCP tools for knowledge management, RAG search, project automation, and task tracking through a clean HTTP API interface.

## Quick Start

### Prerequisites
Ensure Veritas Docker containers are running:
```bash
docker compose -f docker-compose.veritas.yml up -d
```

### Verify Connection
```bash
curl http://localhost:8282/api/veritas/mcp/status
```

Expected response:
```json
{
  "connected": true,
  "backend_url": "http://veritas-server:8282/api",
  "tools_count": 14
}
```

## Skill Activation

The skill activates on these natural language triggers:
- "search veritas"
- "find documentation"
- "list projects"
- "create task"
- "browse knowledge base"
- "code examples"

## Available Workflows

### 1. RAG Search (`rag-search.md`)
**Purpose:** Search knowledge base and find code examples
**Common Commands:**
```bash
# Search documentation
"Search Veritas for FastAPI authentication patterns"

# Find code examples
"Find Python async function examples in Veritas"

# List available sources
"What documentation is available in Veritas?"
```

### 2. RAG Browse (`rag-browse.md`)
**Purpose:** Browse documentation structure and read full pages
**Common Commands:**
```bash
# Browse documentation
"Show me all pages in the FastAPI docs"

# Read specific page
"Read the full content of page X"
```

### 3. Project Management (`project-management.md`)
**Purpose:** Manage projects (list, create, update, delete)
**Common Commands:**
```bash
# List projects
"List all Veritas projects"

# Create project
"Create a new project called 'AI Research'"

# Get project features
"What features does project X have?"
```

### 4. Task Management (`task-management.md`)
**Purpose:** Track and manage tasks
**Common Commands:**
```bash
# List tasks
"Show me all tasks in doing status"

# Create task
"Create a task to implement feature X"

# Filter tasks
"Show tasks for project ABC"
```

### 5. Document Management (`document-management.md`)
**Purpose:** Manage project documents
**Common Commands:**
```bash
# List documents
"List all documents"

# Create document
"Create a new API specification document"
```

### 6. Version Control (`version-control.md`)
**Purpose:** Track and restore versions
**Common Commands:**
```bash
# View history
"Show version history for project X"

# Restore version
"Restore to version v123"
```

## API Endpoints

### Status & Discovery
```bash
# Check status
GET http://localhost:8282/api/veritas/mcp/status

# List all tools
GET http://localhost:8282/api/veritas/mcp/tools

# Connect to backend
POST http://localhost:8282/api/veritas/mcp/connect
```

### Convenience Endpoints
```bash
# Knowledge search
GET /api/veritas/mcp/knowledge/search?query=FastAPI&limit=5

# Code search
GET /api/veritas/mcp/knowledge/code-search?query=async&language=python

# Knowledge sources
GET /api/veritas/mcp/knowledge/sources

# Projects
GET /api/veritas/mcp/projects?search=veritas

# Tasks
GET /api/veritas/mcp/tasks?status=doing&project_id=abc123
```

### Generic Tool Call
```bash
POST /api/veritas/mcp/call
Content-Type: application/json

{
  "tool_name": "rag_search_knowledge_base",
  "arguments": {
    "query": "How to implement RAG?",
    "limit": 5
  }
}
```

## Tool Categories

### RAG & Knowledge Base (5 tools)
1. `rag_get_available_sources` - List knowledge sources
2. `rag_search_knowledge_base` - Semantic search
3. `rag_search_code_examples` - Find code snippets
4. `rag_list_pages_for_source` - List pages in source
5. `rag_read_full_page` - Read full page content

### Project Management (3 tools)
6. `find_projects` - Search/list projects
7. `manage_project` - Create/update/delete projects
8. `get_project_features` - Get project features

### Task Management (2 tools)
9. `find_tasks` - Search/filter tasks
10. `manage_task` - Create/update/delete tasks

### Document Management (2 tools)
11. `find_documents` - Search/list documents
12. `manage_document` - Create/update/delete documents

### Version Control (2 tools)
13. `find_versions` - Get version history
14. `manage_version` - Create/restore versions

## Integration Examples

### With Other Skills

**Research Workflow:**
```bash
# 1. Search Veritas knowledge base
veritas -> rag_search_knowledge_base("API design patterns")

# 2. Search web for additional context
research -> perplexity-researcher("API design best practices")

# 3. Combine findings
synthesize results
```

**Code Generation Workflow:**
```bash
# 1. Find code examples
veritas -> rag_search_code_examples("async HTTP client")

# 2. Generate similar code
use examples as reference for new implementation

# 3. Store in project
veritas -> manage_document(code_spec)
```

## File Structure

```
veritas/
├── skill.md                      # Main skill definition
├── README.md                     # This file
├── workflows/                    # Workflow implementations
│   ├── rag-search.md            # Knowledge search
│   ├── rag-browse.md            # Documentation browsing
│   ├── project-management.md    # Project CRUD
│   ├── task-management.md       # Task tracking
│   ├── document-management.md   # Document CRUD
│   └── version-control.md       # Version history
└── assets/                       # (Reserved for future use)
```

## Troubleshooting

### Connection Issues
**Problem:** `Failed to connect to Veritas backend`
**Solution:**
```bash
# Check if Docker containers are running
docker compose -f docker-compose.veritas.yml ps

# Start if not running
docker compose -f docker-compose.veritas.yml up -d

# Check logs
docker logs veritas-server --tail 50
```

### Tool Not Found
**Problem:** `Unknown MCP tool: tool_name`
**Solution:**
```bash
# List all available tools
curl http://localhost:8282/api/veritas/mcp/tools
```

### No Search Results
**Problem:** Empty results from RAG search
**Solution:**
- Check if knowledge base has content (list sources)
- Try broader search terms
- Verify source is indexed and processed

## Performance Notes

- **RAG searches:** 1-3 seconds (depends on query complexity)
- **Project queries:** <500ms
- **Task operations:** <200ms
- **Document operations:** <300ms
- **Version operations:** <500ms

## Security Notes

- Currently no authentication required (local deployment only)
- Production deployments should add API key authentication
- All endpoints accessible via localhost only by default

## Version History

- **v1.0.0** (2025-11-15): Initial release with all 14 MCP tools
  - RAG search and browsing workflows
  - Project, task, document management
  - Version control integration
  - Full PAI skill integration

## Contributing

To extend this skill:
1. Add new workflow in `workflows/` directory
2. Update `skill.md` with new trigger phrases
3. Test with Veritas API
4. Update this README

## References

- **MCP Integration Guide:** `PAI_VERITAS_MCP_INTEGRATION.md`
- **Veritas API:** `python/src/server/api_routes/veritas_mcp_api.py`
- **MCP Client:** `python/src/server/services/veritas_mcp_client.py`
- **MCP Protocol:** https://spec.modelcontextprotocol.io/
