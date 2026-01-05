# Agent Observability Pack - Real-Time Agent Monitoring

**Version**: 2.0 (Pack Format)
**Last Updated**: 2026-01-02
**Complexity**: Very High

---

## Overview

The Agent Observability Pack provides real-time visualization and monitoring of Claude Code agent interactions. Watch multiple agents work in parallel with swim lane visualization, event filtering, live charts, and comprehensive session tracking through a web dashboard.

**What makes this special:** Unlike traditional logging systems, this provides real-time visual feedback showing how agents think, collaborate, and execute tasks. Perfect for debugging complex multi-agent workflows, understanding agent behavior patterns, and optimizing PAI performance.

**Inspired by [@indydevdan](https://github.com/indydevdan)**'s pioneering work on multi-agent observability.

---

## What's Included

### Skills
- **agent-observability** - Skill definition with usage patterns

### Applications
- **Server (Bun + WebSocket)** - Event ingestion, in-memory buffering, real-time streaming
- **Client (Vue 3 + Vite)** - Interactive dashboard with swim lanes, charts, filtering

### Hooks
- **capture-all-events.ts** - Universal event capture hook (all Claude Code events)

### Workflows
- **start.md** - How to start and use the dashboard

### Configuration
- **settings.json.example** - Hook configuration template for integration
- **History structure** - JSONL file organization in `~/.claude/history/raw-outputs/`

---

## Architecture

### High-Level Flow

```
Claude Code → Hooks → JSONL Files → File Watcher → In-Memory Buffer → WebSocket → Dashboard
```

### Detailed Architecture

```
┌─────────────────┐
│  Claude Code    │  Multiple agents (kai, designer, engineer, etc.)
│   (with hooks)  │
└────────┬────────┘
         │
         │ PreToolUse, PostToolUse, SessionStart, Stop, etc.
         ▼
┌─────────────────┐
│ capture-all-    │  Hook fires on every event
│ events.ts       │  Appends to daily JSONL file
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ ~/.claude/history/raw-outputs/      │
│ 2026-01/2026-01-02_all-events.jsonl │  Daily JSONL files (1 JSON per line)
└────────┬────────────────────────────┘
         │
         │ Bun filesystem watcher (fs.watch)
         ▼
┌─────────────────┐
│ file-ingest.ts  │  Server (port 3001)
│  (Bun server)   │  - Reads JSONL files
│                 │  - Keeps last 1000 events in memory
│                 │  - Streams new events via WebSocket
└────────┬────────┘
         │
         │ WebSocket connection (ws://localhost:3001)
         ▼
┌─────────────────┐
│  Vue 3 Client   │  Dashboard (port 5173)
│  (Vite + Tail)  │  - Agent swim lanes
│                 │  - Event timeline
│                 │  - Tool usage charts
│                 │  - Filtering/search
└─────────────────┘
```

### Key Components

1. **Event Capture (capture-all-events.ts)**
   - Hooks into all Claude Code events
   - Appends to daily JSONL file
   - Enriches with timestamp, source agent, session ID
   - Runs on every: tool use, session start/stop, errors

2. **File Ingestion (apps/server)**
   - Bun server with filesystem watcher
   - Monitors `~/.claude/history/raw-outputs/` for changes
   - Maintains in-memory buffer (last 1000 events)
   - WebSocket server for real-time streaming

3. **Dashboard (apps/client)**
   - Vue 3 + TypeScript + Vite
   - TailwindCSS for styling
   - Recharts for visualization
   - Real-time WebSocket client

---

## Key Features

### 🔴 Real-Time Event Streaming
- **Sub-second latency** - Events appear as they happen
- **WebSocket streaming** - No polling, pure push notifications
- **Auto-reconnection** - Recovers from connection drops
- **Backfill on connect** - Gets last 1000 events immediately

### 📊 Agent Swim Lanes
- **Parallel agent visualization** - See multiple agents working simultaneously
- **Color-coded agents** - kai, designer, engineer, pentester, researcher
- **Event flow** - Chronological event cards per agent
- **Session grouping** - Events grouped by session ID

### 🔍 Advanced Filtering
- **By agent** - Focus on specific agent (kai, designer, etc.)
- **By event type** - PreToolUse, PostToolUse, SessionStart, Stop, etc.
- **By session** - Isolate events from specific session
- **By tool** - See all uses of Read, Write, Bash, etc.
- **By time range** - Last hour, last day, custom range

### 📈 Live Analytics
- **Tool usage charts** - Which tools are used most
- **Agent activity** - Events per agent over time
- **Session metrics** - Duration, tool count, success rate
- **Error tracking** - Failed tool uses, exceptions

### 💾 Filesystem-Based Storage
- **JSONL format** - One JSON object per line
- **Daily files** - Organized by month: `2026-01/2026-01-02_all-events.jsonl`
- **Human-readable** - Grep-able, tail-able, standard JSON
- **No database** - No SQLite, PostgreSQL, etc.
- **Crash-safe** - Events written immediately, no buffer loss

### 🎯 Zero Configuration
- **Auto-discovery** - Finds JSONL files automatically
- **No schema** - Works with any event structure
- **Backwards compatible** - Reads old event files
- **Hot reload** - Picks up new files without restart

---

## Use Cases

### 1. Debug Multi-Agent Workflows
**Scenario:** Complex task with 5+ agents collaborating

**Benefit:**
- See which agent is stuck or waiting
- Identify bottlenecks (agent A waiting for agent B)
- Track event flow across agent boundaries
- Spot duplicate work or inefficiencies

**Example:**
```
User: "Build full-stack app with separate frontend and backend agents"

Dashboard shows:
├─ kai (orchestrator) - SessionStart
│  └─ Task tool → spawn frontend agent
│  └─ Task tool → spawn backend agent
├─ designer (frontend)
│  ├─ Read component files
│  ├─ Write new components
│  └─ Stop (success)
└─ engineer (backend)
   ├─ Read API files
   ├─ Write new endpoints
   ├─ Bash (run tests)
   └─ Stop (success)
```

**Insight:** See both agents working in parallel, completion times, handoffs

### 2. Profile Tool Usage Patterns
**Scenario:** Optimize PAI for faster execution

**Benefit:**
- Identify most-used tools (optimize those first)
- Find unnecessary tool calls (Read same file multiple times)
- Discover tool sequences (always Read then Edit)
- Track tool execution times

**Example:**
```
Chart shows:
Read: 234 uses (40% of all tools)
Edit: 189 uses (32%)
Bash: 98 uses (17%)
Write: 45 uses (8%)
Glob: 12 uses (2%)

Insight: Optimize Read and Edit tools for biggest impact
```

### 3. Monitor Long-Running Sessions
**Scenario:** Complex refactoring taking 20+ minutes

**Benefit:**
- Confirm agent is still working (not stuck)
- Estimate completion time from event rate
- Catch infinite loops or repeated failures
- Know when to intervene

**Example:**
```
Dashboard shows:
Session started: 14:30:00
Last event: 14:47:23 (17 minutes ago)
Events: 847 total
Rate: ~50 events/minute (steady)

Status: Actively working (events flowing)
```

### 4. Understand Agent Decision-Making
**Scenario:** Agent made unexpected choice

**Benefit:**
- Replay session events to see decision process
- Identify which files agent read before decision
- See what tools agent tried before success
- Learn from successful agent strategies

**Example:**
```
Agent debugged error by:
1. Read error.log (found stack trace)
2. Grep codebase for error class
3. Read identified file
4. Edit fix
5. Bash run tests
6. Success

Insight: Agent uses Grep to find error location (smart!)
```

### 5. Quality Assurance Before Deploy
**Scenario:** About to deploy major changes

**Benefit:**
- Review all files modified in session
- Confirm no unexpected changes
- Verify test execution and results
- Ensure no errors occurred

**Example:**
```
Filter: EventType = PostToolUse, Status = success
Files modified:
✅ src/api/auth.ts (Edit)
✅ src/components/Login.tsx (Edit)
✅ tests/auth.test.ts (Write)
✅ All tests passed (Bash)

Status: Safe to deploy
```

---

## Dependencies

### Runtime Requirements
- **Bun** 1.0.0+ - JavaScript runtime for both server and client
- **Node.js** 18+ (if using npm instead of Bun)
- **PAI_DIR environment variable** - Must be set to `~/.claude/`

### Server Dependencies (apps/server)
- `bun` - Runtime and filesystem watcher
- `ws` - WebSocket server
- Standard Node.js `fs` and `path` modules

### Client Dependencies (apps/client)
- `vue` - Frontend framework (v3.x)
- `vite` - Build tool and dev server
- `typescript` - Type safety
- `tailwindcss` - CSS framework
- `recharts` - Chart library
- `@vueuse/core` - Vue utilities
- `socket.io-client` - WebSocket client

### PAI Skills (Optional)
- **CORE** - System identity
- **research** - For analyzing agent patterns
- None required - works standalone

---

## Differences from indydevdan's Approach

| Feature | indydevdan | Our Approach | Trade-off |
|---------|-----------|--------------|-----------|
| **Data Storage** | SQLite database | Filesystem JSONL | DB: Full query power, FS: Simplicity |
| **Event Capture** | API calls | Direct file writes | API: Centralized, FS: Distributed |
| **Persistence** | Full history | Last 1000 + JSONL files | DB: Queryable, FS: Lightweight |
| **Real-time** | Database polling | File watching + WebSocket | Poll: Simple, Watch: Efficient |
| **Dependencies** | SQLite, API server | Bun filesystem | DB: Mature, Bun: Modern/fast |
| **Setup** | Database schema | Directory creation | DB: Schema migrations, FS: None |
| **Historical Queries** | SQL queries | Grep JSONL files | SQL: Powerful, Grep: Unix-friendly |

**Why We Chose Filesystem:**
- ✅ Tight integration with Claude Code hooks (no API calls)
- ✅ No database migrations or schema management
- ✅ Human-readable JSONL (can manually inspect with `tail`, `grep`, `jq`)
- ✅ Lightweight - only loads what's needed
- ✅ Crash-safe - events written immediately
- ✅ Works offline - no external services

**When indydevdan's Approach is Better:**
- 📊 Complex historical queries (SQL vs. grepping JSONL)
- 🔍 Advanced analytics (aggregate queries, joins)
- 💾 Guaranteed long-term persistence (SQLite is rock-solid)
- 📈 Large-scale deployments (100K+ events/day)

**Both approaches are valid!** Choose based on your needs.

---

## Integration Points

### Reads From
- `~/.claude/history/raw-outputs/` - JSONL event files
- `~/.claude/settings.json` - Hook configuration (optional, for setup)

### Writes To
- `~/.claude/history/raw-outputs/YYYY-MM/YYYY-MM-DD_all-events.jsonl`
- Server log files (if logging enabled)

### Hooks Into
- **All Claude Code events** via hooks:
  - PreToolUse, PostToolUse
  - SessionStart, SessionEnd
  - Stop, SubagentStop
  - UserPromptSubmit
  - Custom events (extensible)

### No Database
- **Does NOT use**: SQLite, PostgreSQL, MySQL, MongoDB
- **Does NOT require**: Database server, schema migrations
- **Data format**: Plain text JSONL (JSON Lines)

---

## Configuration

### PAI_DIR Environment Variable

**Required** - Must be set before running:

```bash
# Add to ~/.zshrc or ~/.bashrc
export PAI_DIR="$HOME/.claude"
```

### Hook Configuration

Add to `~/.claude/settings.json` (see `settings.json.example` for complete template):

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type PreToolUse"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type PostToolUse"
      }]
    }],
    "SessionStart": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type SessionStart"
      }]
    }],
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type Stop"
      }]
    }]
  }
}
```

**Minimal config** (just tool use):
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type PreToolUse"
      }]
    }]
  }
}
```

---

## File Structure

### Event Storage

```
~/.claude/history/raw-outputs/
├── 2026-01/
│   ├── 2026-01-01_all-events.jsonl  (Jan 1st events)
│   ├── 2026-01-02_all-events.jsonl  (Jan 2nd events)
│   └── 2026-01-03_all-events.jsonl  (Jan 3rd events)
└── 2026-02/
    └── 2026-02-01_all-events.jsonl  (Feb 1st events)
```

### JSONL Format

Each line is a complete JSON object:

```jsonl
{"source_app":"kai","session_id":"pai-session-xyz","hook_event_type":"PreToolUse","payload":{"tool":"Read","file":"src/app.ts"},"timestamp":1704153600000,"timestamp_pst":"2026-01-02 10:00:00 PST"}
{"source_app":"kai","session_id":"pai-session-xyz","hook_event_type":"PostToolUse","payload":{"tool":"Read","success":true},"timestamp":1704153601000,"timestamp_pst":"2026-01-02 10:00:01 PST"}
```

### Application Structure

```
skills/agent-observability/
├── apps/
│   ├── server/              # Bun WebSocket server
│   │   ├── src/
│   │   │   └── index.ts     # File watcher + WebSocket
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── client/              # Vue 3 dashboard
│       ├── src/
│       │   ├── App.vue      # Main dashboard
│       │   ├── components/  # UI components
│       │   └── main.ts
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.js
├── hooks/
│   └── capture-all-events.ts    # Universal event capture
├── workflows/
│   └── start.md                  # Usage instructions
├── PACK_README.md                # This file
├── PACK_INSTALL.md               # Installation guide
├── PACK_VERIFY.md                # Verification checklist
├── SKILL.md                      # Skill definition
└── settings.json.example         # Hook configuration template
```

---

## Performance Characteristics

### Memory Usage
- **Server**: ~50MB baseline + ~5MB per 1000 events in buffer
- **Client**: ~80MB for Vue app + chart libraries
- **Total**: ~150MB for full stack

### Latency
- **Event capture**: <5ms (file append)
- **Event delivery**: <50ms (file watch → WebSocket)
- **Dashboard update**: <100ms (WebSocket → Vue render)
- **End-to-end**: <200ms (tool use → visible on dashboard)

### Throughput
- **Events/second**: 100+ (tested with parallel agents)
- **Concurrent sessions**: 10+ (limited by Claude Code, not observability)
- **File size**: ~1KB per event, ~1MB for 1000 events
- **Daily volume**: ~50MB for heavy usage (5000 events/day)

### Scaling
- **In-memory buffer**: Last 1000 events (configurable)
- **File retention**: Unlimited (JSONL files never deleted automatically)
- **Historical access**: Grep JSONL files directly
- **Cleanup**: Manual (delete old monthly directories)

---

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ Internet Explorer: Not supported

---

## Security Considerations

### Local Only
- **Dashboard**: Binds to localhost:5173 (not accessible from network)
- **Server**: Binds to localhost:3001 (not accessible from network)
- **No authentication**: Assumes trusted local environment

### Data Exposure
- **JSONL files contain**:
  - File paths you're working with
  - Tool arguments (may include sensitive data)
  - Session IDs and timestamps
- **Recommendation**: Don't commit JSONL files to public repos
- **Add to .gitignore**: `~/.claude/history/raw-outputs/`

### WebSocket Security
- **Unencrypted**: ws:// not wss:// (localhost only, acceptable)
- **No auth**: Any process on your machine can connect
- **Production**: Use reverse proxy with auth if exposing externally

---

## Troubleshooting

See **PACK_INSTALL.md** for comprehensive troubleshooting.

**Common issues:**
- Events not appearing → Check PAI_DIR is set
- Server won't start → Port 3001 in use or Bun not installed
- Client won't connect → Ensure server running first

---

## Credits

**Inspired by [@indydevdan](https://github.com/indydevdan)** - Thank you for pioneering multi-agent observability for Claude Code! 🙏

Our implementation takes a different approach (filesystem vs. database) but the core vision is the same: make agent behavior visible and understandable.

---

## Future Enhancements (Not Yet Implemented)

- 📤 Export to CSV/JSON
- 🔔 Alert system (notify on errors, long-running tasks)
- 🎥 Session replay (step-by-step event playback)
- 📊 Advanced analytics dashboard
- 🔗 Integration with other PAI skills (e.g., trigger research skill from dashboard)
- 💾 Configurable retention (auto-delete old JSONL files)

---

## Quick Start

See **PACK_INSTALL.md** for complete installation.
See **PACK_VERIFY.md** for verification checklist.

**30-second start:**
```bash
# 1. Set PAI_DIR
export PAI_DIR="$HOME/.claude"

# 2. Start server
cd ~/.claude/skills/agent-observability/apps/server && bun run dev

# 3. Start client (new terminal)
cd ~/.claude/skills/agent-observability/apps/client && bun run dev

# 4. Open dashboard
open http://localhost:5173
```

---

**PACK Version**: 2.0
**Created**: 2026-01-02
**Complexity**: Very High (Full-stack app with real-time streaming)
**Estimated Setup Time**: 15-20 minutes
