# Version Control Workflow

**Purpose:** Track version history and restore previous versions.

**Triggers:** "version history", "restore version", "list versions", "track versions"

## Tools

### find_versions - Get version history
**Parameters:**
- `version_id` (optional): Get specific version
- `entity_type` (optional): Filter by type (project/task/document)

```bash
# List all versions
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "find_versions", "arguments": {}}'

# Get specific version
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "find_versions", "arguments": {"version_id": "v123"}}'
```

### manage_version - Create/restore versions
**Parameters:**
- `action`: "create", "restore"
- `version_id`: Required for restore
- `data`: Version data for create

```bash
# Create version
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "manage_version",
    "arguments": {
      "action": "create",
      "data": {
        "entity_type": "project",
        "entity_id": "abc123",
        "snapshot": {...}
      }
    }
  }'

# Restore version
curl -X POST http://localhost:8282/api/veritas/mcp/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "manage_version",
    "arguments": {
      "action": "restore",
      "version_id": "v123"
    }
  }'
```

## Best Practices
- ✅ Create versions before major changes
- ✅ Review diffs before restoring
- ✅ Document version changes
- ❌ Don't restore without confirmation

---
**Complexity:** Medium | **Execution Time:** <500ms
