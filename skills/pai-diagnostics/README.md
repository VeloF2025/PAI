# PAI Diagnostics Pack

**Version**: 1.0.0
**Author**: PAI
**Category**: validation

## Overview

Comprehensive health diagnostics for your PAI installation. Validates all subsystems, identifies issues, and provides actionable recommendations for fixes.

## What's Included

- **Tool**: `check-pai-state.ts` - Main diagnostic script
- **Skill**: `/pai-status` command integration
- **Documentation**: Full diagnostic coverage

## Architecture

```
PAI Diagnostics
├── check-pai-state.ts ──> Reads PAI structure
│                          Validates 8 subsystems
│                          Generates health report
└── Output:
    ✅ Installation
    ✅ Hooks (45 across 8 types)
    ✅ MCPs (7 servers)
    ✅ Skills (38 total)
    ✅ History
    ✅ Memory
    ✅ Protocols
    ✅ Observability
```

## Key Features

- **8 Diagnostic Categories**: Installation, Hooks, MCPs, Skills, History, Memory, Protocols, Observability
- **Visual Health Report**: Color-coded status indicators (✅ ⚠️ ❌)
- **Actionable Recommendations**: Specific fixes for each issue found
- **JSON Output**: Programmatic access for automation
- **Verbose Mode**: Detailed information for debugging

## Use Cases

1. **Post-Installation**: Verify PAI installed correctly
2. **Troubleshooting**: Identify broken hooks or missing files
3. **Pre-Commit**: Ensure system health before making changes
4. **Maintenance**: Regular health checks to catch issues early

## Dependencies

- Bun runtime
- PAI_DIR environment variable
- Claude Code CLI

## Next Steps

1. Read `INSTALL.md` for installation instructions
2. Complete the `VERIFY.md` checklist
3. Run `/pai-status` to check your PAI health!

## Example Output

```
PAI HEALTH CHECK
================
✅ Installation   All core directories present (6/6)
✅ Hooks          45 hooks configured across 8 event types
✅ MCPs           7 MCPs configured
✅ Skills         37/38 skills with SKILL.md
⚠️ History        No events in last 24h
✅ Memory         7 project memories
✅ Protocols      12 protocols available
✅ Observability  Dashboard ready

⚡ PAI is functional with minor issues
```
