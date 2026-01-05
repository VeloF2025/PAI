# Task Management Workflow

**Purpose:** Track and manage tasks with filters and status updates.

**Triggers:** "list tasks", "create task", "update task", "task status", "find tasks"

## Tools

### find_tasks - Search and filter tasks
**Parameters:**
- `task_id` (optional): Get specific task
- `project_id` (optional): Filter by project
- `status` (optional): Filter by status (todo/doing/review/done)
- `search` (optional): Search term

```bash
# List all tasks
curl "http://localhost:8282/api/veritas/mcp/tasks"

# Filter by status
curl "http://localhost:8282/api/veritas/mcp/tasks?status=doing"

# Filter by project
curl "http://localhost:8282/api/veritas/mcp/tasks?project_id=abc123"
```

### manage_task - Create/update/delete tasks
**Parameters:**
- `action`: "create", "update", "delete"
- `task_id`: Required for update/delete
- `data`: Task data for create/update

```bash
# Create task
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "manage_task",
    "arguments": {
      "action": "create",
      "data": {
        "title": "Implement feature X",
        "project_id": "abc123",
        "status": "todo",
        "assignee": "User"
      }
    }
  }'
```

## Best Practices
- ✅ Use status filters for focused task lists
- ✅ Link tasks to projects
- ✅ Set appropriate assignees (User, Archon, AI IDE Agent)
- ❌ Don't create duplicate tasks

---
**Complexity:** Low | **Execution Time:** <200ms
