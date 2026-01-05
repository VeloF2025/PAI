# Session Persistence Skill

**Purpose**: Automatic multi-project session isolation and memory persistence for Claude Code

---

## What This Skill Does

### Automatic Project Registration

When Claude Code opens in a **new project directory** for the first time:
1. Detects if directory is a project (has `.git`, `package.json`, etc.)
2. Generates unique session ID
3. Creates project memory file
4. Updates PowerShell commands
5. Updates project registry

**No manual configuration needed** for new projects.

### Session Isolation

Each project gets a dedicated session ID that prevents conversation mixing:
- `apex-session-a1b2c3d4` for Apex
- `boss-session-e5f6g7h8` for BOSS
- etc.

When you use project commands (`apex`, `boss`, etc.), Claude Code uses that project's isolated session.

### Memory Persistence

Project-specific memory files track:
- Current state and progress
- Key decisions
- Technical context (stack, patterns, blockers)
- What to continue next session

Memory is **auto-loaded** at session start and **auto-prompted for updates** at session end.

---

## Components

### Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `auto-project-setup.ts` | SessionStart | Detects and registers new projects |
| `load-project-memory.ts` | SessionStart | Loads project memory into context |
| `session-tracker.ts` | SessionStart/End | Tracks active parallel sessions |
| `memory-maintenance-hook.ts` | Stop | Prompts for memory updates |

### Files

```
~/.claude/
├── project-sessions.ps1              # PowerShell commands
├── memories/
│   ├── current.md                    # Active session state
│   ├── archive.md                    # Historical context
│   ├── project-index.md              # All projects overview
│   ├── SESSION-PERSISTENCE-GUIDE.md  # User documentation
│   └── projects/
│       ├── registry.json             # Project registry (source of truth)
│       ├── active-sessions.json      # Tracks active parallel sessions
│       ├── apex.md                   # Apex memory
│       ├── boss.md                   # BOSS memory
│       └── [project].md              # Auto-generated per project
```

### Registry Format

`~/.claude/memories/projects/registry.json`:
```json
{
  "projects": {
    "ProjectName": {
      "path": "C:\\path\\to\\project",
      "sessionId": "projectname-session-abc123",
      "memoryFile": "projectname.md",
      "alias": "proj",
      "registeredAt": "2025-12-15"
    }
  }
}
```

---

## Usage

### For Registered Projects

```powershell
# Start/resume main session
apex
boss
bossex
agri
pai

# Continue last conversation
apex-resume

# Start fresh parallel session
apex-new

# Start labeled parallel session (e.g., for specific feature work)
apex-new bugfix
pai-new refactor-hooks

# List all commands
claude-projects

# Show all active sessions across projects
claude-sessions
```

### Parallel Sessions (Multi-Terminal)

When working on the same project in multiple terminals:

```powershell
# Terminal 1: Main session
apex

# Terminal 2: Working on bugfix
apex-new bugfix

# Terminal 3: Feature work
apex-new feature-auth
```

Each parallel session:
- Has its own session ID (`apex-session-bugfix`, `apex-session-feature-auth`)
- Is tracked in `active-sessions.json`
- Shows other active sessions at start for visibility

Run `claude-sessions` to see all active sessions across all projects:
```
=== Active Claude Sessions ===

Apex:
  [main] - 45m (PID: 12345)
  [bugfix] - 12m (PID: 67890)

PAI:
  [main] - 2h 30m (PID: 11111)
```

### New Projects (Automatic)

1. `cd` to new project directory
2. Run `claude` (or any claude command)
3. Project is auto-registered
4. PowerShell commands available after terminal restart

### Manual Registration

If auto-detection fails, add to registry manually:
```json
{
  "NewProject": {
    "path": "C:\\path\\to\\new-project",
    "sessionId": "newproj-session-xyz789",
    "memoryFile": "new-project.md",
    "alias": "np",
    "registeredAt": "2025-12-15"
  }
}
```

---

## Project Detection Criteria

A directory is considered a project if it contains any of:
- `.git`
- `package.json`
- `Cargo.toml`
- `pyproject.toml`
- `requirements.txt`
- `go.mod`
- `pom.xml`
- `build.gradle`
- `.claude`
- `CLAUDE.md`
- `.vscode`
- `tsconfig.json`
- `composer.json`
- `Gemfile`
- `setup.py`
- `CMakeLists.txt`
- `Makefile`

---

## Memory Update Guidelines

### What to Update

**current.md** (global):
- Tasks completed this turn
- Important decisions
- Context for next turn
- Blockers and questions

**[project].md** (project-specific):
- Progress on this project
- Key decisions for this project
- Technical context (stack, patterns, blockers)
- What to continue next session

### When to Skip

- Trivial queries
- Simple questions that don't change state
- User just said "thanks" or similar

---

## Troubleshooting

### Commands not found
```powershell
. $PROFILE   # Reload PowerShell profile
```

### Project not detected
Check if directory has project indicators (`.git`, `package.json`, etc.)

### Memory not loading
Verify registry.json has correct path and memory file exists.

### Session mixing
Ensure using project commands (`apex`, `boss`) not generic `claude`.

---

## Extending

### Add Detection Criteria

Edit `auto-project-setup.ts` → `isProjectDirectory()` function.

### Modify Memory Template

Edit `auto-project-setup.ts` → `createMemoryFile()` function.

### Custom Aliases

Edit `registry.json` → project's `alias` field.
