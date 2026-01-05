# Agent Observability Pack - Installation Guide

**Version**: 2.0
**Estimated Time**: 15-20 minutes
**Difficulty**: Intermediate

---

## Pack v2.0 Source Files

This pack follows Dan Miesler's Pack v2.0 structure with real code files in `src/`:

**Applications** (`src/apps/`):
- `client/` - Vue.js observability dashboard (frontend)
- `server/` - Express.js WebSocket server (backend)

**Hooks** (`src/hooks/`):
- `capture-all-events.ts` - Event capture hook for Claude Code

**Workflows** (`src/workflows/`):
- `start.md` - Workflow to start the observability system

**History Structure** (`src/history-structure/`):
- `raw-outputs/` - JSONL event logs storage
- Example event files and documentation

These files are referenced in the installation steps below.

---

## Prerequisites

### Required

- [ ] **Bun runtime** installed (`bun --version >= 1.0`)
- [ ] **Node.js** installed (`node --version >= 18.0`)
- [ ] **Git** installed (`git --version`)
- [ ] **PAI directory** exists at `~/.claude/`
- [ ] **Disk space**: Minimum 200 MB for dependencies + logs

### Recommended

- [ ] **Modern browser** (Chrome, Firefox, Edge - for dashboard viewing)
- [ ] **Network access** to localhost ports 3000 (client) and 3001 (server)

### Check Prerequisites

```bash
# Verify Bun
bun --version
# Should show: 1.0.0 or higher

# Verify Node.js
node --version
# Should show: 18.0.0 or higher

# Check PAI directory
ls ~/.claude/skills/
# Should list: CORE, agent-observability, and other skills
```

---

## Installation Steps

### Step 1: Install Hook

The capture hook must be installed in Claude Code settings.

```bash
# Check if settings file exists
ls ~/.claude/settings.json

# If missing, create from example
cp ~/.claude/skills/agent-observability/settings.json.example ~/.claude/settings.json
```

**Edit `~/.claude/settings.json`** and add the hook:

```json
{
  "hooks": {
    "tool:before": "~/.claude/skills/agent-observability/src/hooks/capture-all-events.ts",
    "tool:after": "~/.claude/skills/agent-observability/src/hooks/capture-all-events.ts"
  }
}
```

**✅ Expected**: Hook configuration in settings.json

---

### Step 2: Install Server Dependencies

```bash
cd ~/.claude/skills/agent-observability/src/apps/server/

# Install dependencies
bun install

# Verify installation
ls node_modules/
```

**✅ Expected**: Dependencies installed successfully

---

### Step 3: Install Client Dependencies

```bash
cd ~/.claude/skills/agent-observability/src/apps/client/

# Install dependencies
bun install

# Verify installation
ls node_modules/
```

**✅ Expected**: Dependencies installed successfully

---

### Step 4: Initialize History Directory

```bash
# Create history structure
mkdir -p ~/.claude/history/agent-events/

# Link to skill's history structure (optional)
ln -s ~/.claude/history/agent-events ~/.claude/skills/agent-observability/src/history-structure/raw-outputs/
```

**✅ Expected**: History directory created

---

### Step 5: Start the Server

Open a new terminal:

```bash
cd ~/.claude/skills/agent-observability/src/apps/server/

# Start server
bun run src/index.ts
```

**✅ Expected Output**:
```
Server running on http://localhost:3001
WebSocket server ready
File watcher active
```

**Keep this terminal running** - server must be active during Claude Code sessions.

---

### Step 6: Start the Client

Open another terminal:

```bash
cd ~/.claude/skills/agent-observability/src/apps/client/

# Start Vite dev server
bun run dev
```

**✅ Expected Output**:
```
VITE v5.x.x ready
Local: http://localhost:3000/
```

**Keep this terminal running** - client provides the dashboard UI.

---

### Step 7: Open Dashboard

```bash
# Open in browser
open http://localhost:3000
# Or manually navigate to http://localhost:3000
```

**✅ Expected**: Vue.js dashboard loads successfully

---

### Step 8: Test Event Capture

In Claude Code, run any command:

```bash
# Example command to trigger events
ls
```

**✅ Expected**:
1. Events appear in terminal running server
2. Dashboard updates with new events
3. JSONL file created in `~/.claude/history/agent-events/`

---

## Configuration

### Hook Configuration

Edit `~/.claude/settings.json` to customize hook behavior:

```json
{
  "hooks": {
    "tool:before": "~/.claude/skills/agent-observability/src/hooks/capture-all-events.ts",
    "tool:after": "~/.claude/skills/agent-observability/src/hooks/capture-all-events.ts",
    "tool:error": "~/.claude/skills/agent-observability/src/hooks/capture-all-events.ts"
  }
}
```

### Server Configuration

Edit `src/apps/server/src/index.ts` to change:
- WebSocket port (default: 3001)
- File watch paths
- CORS settings

### Client Configuration

Edit `src/apps/client/vite.config.ts` to change:
- Client port (default: 3000)
- Proxy settings
- Build options

---

## Troubleshooting

### Issue: "Hook not capturing events"

**Solution**:
```bash
# Verify hook path in settings.json
cat ~/.claude/settings.json | grep capture-all-events

# Make hook executable
chmod +x ~/.claude/skills/agent-observability/src/hooks/capture-all-events.ts

# Restart Claude Code
```

### Issue: "Server won't start - port in use"

**Solution**:
```bash
# Find process on port 3001
lsof -i :3001

# Kill the process (replace PID)
kill -9 <PID>

# Or change server port in src/apps/server/src/index.ts
```

### Issue: "Client shows connection error"

**Solution**:
1. Verify server is running: `curl http://localhost:3001/health`
2. Check firewall settings
3. Verify WebSocket connection in browser dev tools

### Issue: "No events showing in dashboard"

**Solution**:
1. Check server terminal for incoming events
2. Verify hook is installed in settings.json
3. Check browser console for errors
4. Verify JSONL files are being created in history directory

---

## Post-Installation Verification

Once installation is complete, proceed to **VERIFY.md** to run the verification checklist.

---

## Uninstallation

```bash
# Stop server and client (Ctrl+C in terminals)

# Remove hook from settings.json
# Edit ~/.claude/settings.json and remove capture-all-events lines

# Remove dependencies
rm -rf ~/.claude/skills/agent-observability/src/apps/server/node_modules
rm -rf ~/.claude/skills/agent-observability/src/apps/client/node_modules

# Optional: Remove event logs
rm -rf ~/.claude/history/agent-events/
```

---

## Next Steps

1. ✅ Complete installation (all steps above)
2. ➡️ **Run verification checklist** (VERIFY.md)
3. ➡️ Trigger some events in Claude Code and watch them in dashboard
4. ➡️ Explore filters, themes, and live updates

---

## Support

**Issues?** Check:
1. This troubleshooting section
2. `~/.claude/skills/agent-observability/README.md` for architecture details
3. `~/.claude/skills/agent-observability/SETUP.md` for detailed setup guide

---

**Installation Guide Version**: 2.0
**Last Updated**: 2026-01-05
**Estimated Completion**: ✅ 15-20 minutes
