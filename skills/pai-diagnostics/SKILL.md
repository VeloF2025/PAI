---
name: pai-diagnostics
description: |
  PAI health diagnostics and system state checker.

  Validates PAI installation, identifies issues, and suggests improvements.
  Run with `/pai-status` or ask "check PAI state".

  **Diagnostic Categories:**
  - Installation & Environment
  - Hook System (60+ hooks)
  - MCP Servers (6 configured)
  - Skill System (37 skills)
  - History & Observability
  - Memory System
  - Protocol System
---

# PAI Diagnostics Skill

## Quick Check

Run the diagnostic tool:

```bash
bun ~/.claude/skills/pai-diagnostics/check-pai-state.ts
```

## What It Checks

### 1. Installation & Environment
- PAI_DIR environment variable
- Core directories exist
- Settings files valid

### 2. Hook System
- All hook types configured
- Hook files executable
- No broken hook references

### 3. MCP Servers
- All MCPs connected
- API keys configured
- Server health

### 4. Skill System
- Skill directories valid
- SKILL.md files present
- Workflow files exist

### 5. History & Observability
- Raw output capture working
- Event files being written
- Dashboard server accessible

### 6. Memory System
- Memory files exist
- Current/archive structure
- Project index valid

### 7. Protocol System
- Protocol files present
- No missing references

## Output Format

```
PAI HEALTH CHECK
================
✅ Installation: OK
✅ Hooks: 60/60 configured
✅ MCPs: 6/6 connected
⚠️ History: No events in last 24h
✅ Memory: OK
✅ Protocols: 12/12 present

ISSUES FOUND:
- Event capture may not be running

RECOMMENDATIONS:
1. Check bun.exe is in PATH
2. Restart Claude Code to reinitialize hooks
```

## Invocation

- `/pai-status` - Quick status
- `/pai-diagnostics` - Full diagnostic
- "check PAI state" - Natural language trigger
