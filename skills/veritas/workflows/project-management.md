# Project Management Workflow

**Purpose:** Manage Veritas projects - list, search, create, update, delete.

**Triggers:** "list projects", "create project", "update project", "delete project", "find projects", "project features"

## Tools Used

### 1. find_projects
Search and list projects, or get a specific project by ID.

**Parameters:**
- `project_id` (optional): Get specific project
- `search` (optional): Search term to filter projects

**API Call:**
```bash
# List all projects
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "find_projects", "arguments": {}}'

# Get specific project
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "find_projects", "arguments": {"project_id": "abc123"}}'

# Search projects
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "find_projects", "arguments": {"search": "veritas"}}'
```

**Convenience Endpoint:**
```bash
curl "http://localhost:8282/api/veritas/mcp/projects?search=veritas"
```

### 2. manage_project
Create, update, or delete projects.

**Parameters:**
- `action` (required): "create", "update", or "delete"
- `project_id` (required for update/delete): Project identifier
- `data` (required for create/update): Project data object

**Create Project:**
```bash
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "manage_project",
    "arguments": {
      "action": "create",
      "data": {
        "name": "My New Project",
        "description": "Project description",
        "features": ["rag", "tasks"]
      }
    }
  }'
```

**Update Project:**
```bash
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "manage_project",
    "arguments": {
      "action": "update",
      "project_id": "abc123",
      "data": {
        "description": "Updated description"
      }
    }
  }'
```

**Delete Project:**
```bash
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "manage_project",
    "arguments": {
      "action": "delete",
      "project_id": "abc123"
    }
  }'
```

### 3. get_project_features
Get features array for a specific project.

**Parameters:**
- `project_id` (required): Project identifier

**API Call:**
```bash
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "get_project_features",
    "arguments": {"project_id": "abc123"}
  }'
```

## Workflow Steps

### Listing Projects
1. Call `find_projects` with no arguments
2. Parse response array
3. Display project names, descriptions, IDs

### Creating Project
1. Gather required data (name, description)
2. Optional: Specify features array
3. Call `manage_project` with action="create"
4. Return created project with server-generated ID

### Updating Project
1. Get project_id from user
2. Gather fields to update
3. Call `manage_project` with action="update"
4. Return updated project

### Deleting Project
1. Get project_id from user
2. Confirm deletion
3. Call `manage_project` with action="delete"
4. Return success confirmation

## Best Practices

- ✅ Always search before creating to avoid duplicates
- ✅ Use descriptive project names
- ✅ Set appropriate features array
- ✅ Confirm before deleting
- ❌ Don't create projects without descriptions
- ❌ Don't delete without verifying ID

---

**Complexity:** Low to Medium
**Execution Time:** <500ms per operation
