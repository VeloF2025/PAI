# Agent Observability Pack - Installation Guide

**Version**: 2.0
**Estimated Time**: 15-20 minutes
**Difficulty**: Intermediate

---

## Prerequisites

### Required

- [ ] **Bun runtime** installed (`bun --version`)
  - Alternative: Node.js 18+ works but Bun recommended for performance
- [ ] **PAI directory** exists at `~/.claude/` (or custom PAI_DIR)
- [ ] **Disk space**: Minimum 100 MB for event storage
- [ ] **Network ports available**: 3001 (server), 5173 (client)

### Recommended

- [ ] **Clean PAI installation** with working hooks system
- [ ] **Terminal multiplexer** (tmux/screen) or multiple terminal windows
- [ ] **Modern browser** (Chrome, Firefox, Edge) for dashboard

### Check Prerequisites

```bash
# Verify Bun
bun --version
# Should show: 1.0.0 or higher

# Alternative: Verify Node.js
node --version
# Should show: 18.0.0 or higher

# Check PAI directory
ls ~/.claude/skills/
# Should list: CORE, agent-observability, and other skills

# Check available ports
netstat -ano | findstr :3001
netstat -ano | findstr :5173
# Should show: Nothing (ports available)

# Verify hooks system
cat ~/.claude/settings.json | grep hooks
# Should show: hooks configuration exists
```

---

## Installation Steps

### Step 1: Verify Pack Files Exist

```bash
# Check agent-observability directory
ls ~/.claude/skills/agent-observability/

# You should see:
# - SKILL.md (existing skill definition)
# - PACK_README.md (this pack's overview)
# - PACK_INSTALL.md (this file)
# - PACK_VERIFY.md (verification checklist)
# - apps/ (server and client applications)
# - hooks/ (capture-all-events.ts)
# - workflows/ (workflow documentation)
```

**✅ Expected**: All pack files and directories present
**❌ If missing**: Download agent-observability pack from PAI repository

---

### Step 2: Set PAI_DIR Environment Variable

**Why**: Server and hooks need to know where PAI root directory is located.

```bash
# For Windows (PowerShell)
$env:PAI_DIR = "C:\Users\YourUsername\.claude"

# Add to PowerShell profile for persistence
echo '$env:PAI_DIR = "C:\Users\YourUsername\.claude"' >> $PROFILE

# For Linux/Mac (Bash/Zsh)
export PAI_DIR="$HOME/.claude"

# Add to shell profile for persistence
echo 'export PAI_DIR="$HOME/.claude"' >> ~/.bashrc  # or ~/.zshrc

# Verify
echo $env:PAI_DIR  # Windows
echo $PAI_DIR      # Linux/Mac
```

**✅ Expected**: PAI_DIR points to your PAI installation directory

---

### Step 3: Create Required Directories

```bash
# Create event storage directory
mkdir -p ~/.claude/history/raw-outputs/$(date +%Y-%m)

# Windows PowerShell alternative
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\history\raw-outputs\2026-01"

# Verify creation
ls ~/.claude/history/raw-outputs/
```

**✅ Expected**: Monthly subdirectory created (e.g., `2026-01/`)

---

### Step 4: Install Server Dependencies

```bash
# Navigate to server directory
cd ~/.claude/skills/agent-observability/apps/server/

# Install dependencies with Bun (recommended)
bun install

# Alternative: Install with npm
npm install

# Verify installation
ls node_modules/
# Should show: ws, chokidar, and other packages
```

**✅ Expected**: Dependencies installed without errors

**Package Summary**:
- `ws` - WebSocket server
- `chokidar` - File watcher (Bun has built-in but chokidar is fallback)

---

### Step 5: Install Client Dependencies

```bash
# Navigate to client directory
cd ~/.claude/skills/agent-observability/apps/client/

# Install dependencies with Bun (recommended)
bun install

# Alternative: Install with npm
npm install

# Verify installation
ls node_modules/
# Should show: vue, vite, tailwindcss, and other packages
```

**✅ Expected**: Dependencies installed without errors

**Package Summary**:
- `vue` - Frontend framework
- `vite` - Build tool and dev server
- `tailwindcss` - CSS framework
- Chart libraries for visualizations

---

### Step 6: Configure Hooks in Settings

**Important**: The hook must be executable and configured to fire on all events.

```bash
# Make hook executable (Linux/Mac)
chmod +x ~/.claude/skills/agent-observability/hooks/capture-all-events.ts

# Verify executable
ls -la ~/.claude/skills/agent-observability/hooks/
```

**Edit `~/.claude/settings.json`** to add hooks:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type SessionStart"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type PreToolUse"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type PostToolUse"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type Stop"
          }
        ]
      }
    ]
  }
}
```

**⚠️ Note**: If you already have hooks configured, add these to your existing hooks array rather than replacing.

**Minimal Configuration** (SessionStart and Stop only):
```json
{
  "hooks": {
    "SessionStart": [{ "matcher": "*", "hooks": [{ "type": "command", "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type SessionStart" }] }],
    "Stop": [{ "matcher": "*", "hooks": [{ "type": "command", "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type Stop" }] }]
  }
}
```

**✅ Expected**: Hooks configured in settings.json

---

### Step 7: Test Server Startup

**Open first terminal** (keep this running):

```bash
# Navigate to server directory
cd ~/.claude/skills/agent-observability/apps/server/

# Start server with Bun
bun run file-ingest.ts

# Alternative: Start with Node.js
node file-ingest.ts

# Expected output:
# [file-ingest] Watching: C:\Users\YourUsername\.claude\history\raw-outputs
# [file-ingest] WebSocket server listening on port 3001
# [file-ingest] Server ready - waiting for client connections
```

**✅ Expected**: Server starts without errors, shows "listening on port 3001"

**❌ If errors**: See troubleshooting section

---

### Step 8: Test Client Startup

**Open second terminal** (keep this running):

```bash
# Navigate to client directory
cd ~/.claude/skills/agent-observability/apps/client/

# Start client dev server
bun run dev

# Alternative: Start with npm
npm run dev

# Expected output:
# VITE v5.x.x  ready in XXX ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

**✅ Expected**: Vite dev server starts, shows URL http://localhost:5173/

**Open browser** and navigate to http://localhost:5173/

**✅ Expected**: Dashboard loads, shows "Waiting for events..."

---

### Step 9: Verify WebSocket Connection

**In browser dashboard**, check:
- [ ] Status indicator shows "Connected" (green)
- [ ] Console shows no WebSocket errors (F12 → Console tab)

**Expected browser console output**:
```
[client] Connecting to ws://localhost:3001
[client] WebSocket connected
[client] Subscribed to events
```

**Server terminal should show**:
```
[file-ingest] Client connected
[file-ingest] Active connections: 1
```

**✅ Expected**: Client and server connected successfully

---

### Step 10: Test Event Capture

**Open third terminal** (Claude Code session):

```bash
# Start a new Claude Code session
claude-code

# Type a simple command
> echo "Testing agent observability"
```

**Check Dashboard** (http://localhost:5173/):
- [ ] New event appears in real-time
- [ ] Event shows type "PreToolUse" or "PostToolUse"
- [ ] Event includes tool name (Bash), timestamp, session_id

**Check JSONL file**:
```bash
# View today's events file
cat ~/.claude/history/raw-outputs/$(date +%Y-%m)/$(date +%Y-%m-%d)_all-events.jsonl

# Windows PowerShell
Get-Content "$env:USERPROFILE\.claude\history\raw-outputs\2026-01\2026-01-03_all-events.jsonl"
```

**✅ Expected**: Events captured to JSONL file AND streaming to dashboard

---

## Configuration Customization

### PAI_DIR Location

**If PAI installed in non-standard location**:

```bash
# Set custom PAI_DIR
export PAI_DIR="/custom/path/to/pai"

# Update settings.json hooks to use absolute paths instead of ${PAI_DIR}
# OR ensure PAI_DIR is set in all terminal sessions
```

---

### Hook Configuration Options

**Full Observability** (all events):
```json
{
  "hooks": {
    "SessionStart": [...],
    "PreToolUse": [...],
    "PostToolUse": [...],
    "Stop": [...],
    "UserMessage": [...],
    "AssistantResponse": [...]
  }
}
```

**Minimal Observability** (session boundaries only):
```json
{
  "hooks": {
    "SessionStart": [...],
    "Stop": [...]
  }
}
```

**Tool-Focused** (tool usage only):
```json
{
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...]
  }
}
```

---

### Event Filtering in Client

**Edit `apps/client/src/config.ts`**:

```typescript
export const config = {
  // Filter out low-value events
  ignoreEventTypes: ['HeartBeat', 'KeepAlive'],

  // Limit buffer size
  maxBufferSize: 1000,

  // Auto-scroll behavior
  autoScroll: true
};
```

---

## Troubleshooting

### Issue: "PAI_DIR not set" error

**Symptoms**: Hook fails with error about PAI_DIR

**Solution**:
```bash
# Verify PAI_DIR is set
echo $env:PAI_DIR  # Windows
echo $PAI_DIR      # Linux/Mac

# If empty, set it:
export PAI_DIR="$HOME/.claude"

# Add to shell profile for persistence
echo 'export PAI_DIR="$HOME/.claude"' >> ~/.bashrc
```

---

### Issue: "Port 3001 already in use"

**Symptoms**: Server fails to start with "EADDRINUSE" error

**Solution**:
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill specific process (Windows)
taskkill /PID [PID_NUMBER] /F

# Linux/Mac
lsof -ti:3001 | xargs kill
```

**Alternative**: Change server port in `apps/server/file-ingest.ts`:
```typescript
const PORT = 3002; // Change from 3001
```

---

### Issue: "No events appearing in dashboard"

**Symptoms**: Dashboard shows "Waiting for events..." but events are happening

**Diagnosis Steps**:
1. **Check hook is executing**:
   ```bash
   # Verify JSONL file is being written
   ls -lah ~/.claude/history/raw-outputs/$(date +%Y-%m)/

   # Should show file modified recently
   ```

2. **Check hook is executable**:
   ```bash
   chmod +x ~/.claude/skills/agent-observability/hooks/capture-all-events.ts
   ```

3. **Check PAI_DIR in settings.json**:
   - Settings.json must use `${PAI_DIR}` variable OR absolute path
   - Verify PAI_DIR resolves correctly

4. **Check server is watching correct directory**:
   - Server output should show: `Watching: /correct/path/to/raw-outputs`

5. **Restart server and client**:
   - Stop both (Ctrl+C)
   - Start server first, then client
   - Check WebSocket connection re-establishes

---

### Issue: "Server crashes on startup"

**Symptoms**: Server starts then immediately exits

**Solution**:
```bash
# Check Bun installation
bun --version

# Reinstall dependencies
cd ~/.claude/skills/agent-observability/apps/server/
rm -rf node_modules
bun install

# Run with verbose logging
DEBUG=* bun run file-ingest.ts
```

---

### Issue: "Client won't connect to server"

**Symptoms**: Dashboard shows "Disconnected" (red status)

**Diagnosis**:
1. **Verify server is running**:
   ```bash
   netstat -ano | findstr :3001
   # Should show LISTENING
   ```

2. **Check WebSocket URL in client**:
   ```typescript
   // apps/client/src/main.ts or equivalent
   const ws = new WebSocket('ws://localhost:3001');
   // Ensure matches server port
   ```

3. **Check firewall**:
   - Windows Firewall may block WebSocket connections
   - Add exception for port 3001

4. **Check browser console**:
   - F12 → Console tab
   - Look for WebSocket errors with specific error codes

---

### Issue: "Events not streaming (file exists but dashboard empty)"

**Symptoms**: JSONL file has events, but dashboard shows nothing

**Solution**:
1. **Check file watcher is active**:
   - Server output should show: `[file-ingest] Watching: ...`

2. **Trigger file change**:
   ```bash
   # Append a test event to force file watcher
   echo '{"type":"Test","timestamp":"2026-01-03T12:00:00.000Z"}' >> ~/.claude/history/raw-outputs/2026-01/2026-01-03_all-events.jsonl
   ```

3. **Check in-memory buffer**:
   - Server loads last 1000 events on startup
   - If file has >1000 events, older ones won't show

4. **Restart server** (forces file re-read)

---

### Issue: "TypeScript errors in hooks"

**Symptoms**: Hook fails with TypeScript compilation errors

**Solution**:
```bash
# Ensure Bun is up to date
bun upgrade

# Verify hook syntax
bun run --check ~/.claude/skills/agent-observability/hooks/capture-all-events.ts

# If using Node.js, compile TypeScript first
npm install -g tsx
tsx ~/.claude/skills/agent-observability/hooks/capture-all-events.ts --help
```

---

### Issue: "Dashboard loads but shows no swim lanes"

**Symptoms**: Dashboard connected, events captured, but swim lanes empty

**Solution**:
1. **Check event format**:
   ```bash
   # View JSONL to verify agent_id exists
   cat ~/.claude/history/raw-outputs/2026-01/2026-01-03_all-events.jsonl

   # Events must include agent_id field for swim lanes
   ```

2. **Generate multi-agent events**:
   - Swim lanes require multiple agents
   - Use Task tool to spawn agents
   - Single-agent sessions show flat timeline

3. **Check filter settings**:
   - Dashboard may be filtering out events
   - Clear filters and refresh

---

## Post-Installation Verification

Once installation is complete, proceed to **PACK_VERIFY.md** to run the comprehensive verification checklist.

**Quick Verification Commands**:

```bash
# 1. Server running?
netstat -ano | findstr :3001

# 2. Client running?
curl http://localhost:5173

# 3. Events being captured?
ls -lah ~/.claude/history/raw-outputs/$(date +%Y-%m)/

# 4. Dashboard accessible?
# Open http://localhost:5173/ in browser

# 5. WebSocket connected?
# Check browser console (F12) for "WebSocket connected"
```

**✅ All checks passing?** → Proceed to PACK_VERIFY.md

**❌ Issues?** → Review troubleshooting section above

---

## Optional: Production Deployment

**For production use** (not development):

### Build Client for Production

```bash
cd ~/.claude/skills/agent-observability/apps/client/

# Build optimized client
bun run build

# Output: dist/ directory with static files

# Serve with static file server
npx serve dist -p 5173
```

### Run Server as Background Process

```bash
cd ~/.claude/skills/agent-observability/apps/server/

# Linux/Mac: Use pm2 or systemd
pm2 start file-ingest.ts --name agent-obs-server

# Windows: Use nssm or Windows Service
# See: https://nssm.cc/
```

### Reverse Proxy (Optional)

**If exposing dashboard remotely**, use nginx/Caddy:

```nginx
# nginx config
server {
    listen 80;
    server_name agent-obs.local;

    location / {
        proxy_pass http://localhost:5173;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**⚠️ Security Warning**: Dashboard has no authentication. Only expose on trusted networks.

---

## Uninstallation (If Needed)

```bash
# Stop server and client
# Ctrl+C in their terminals

# Remove hooks from settings.json
# Edit ~/.claude/settings.json and remove agent-observability hooks

# Remove event storage (optional - saves disk space)
rm -rf ~/.claude/history/raw-outputs/

# Remove server dependencies (optional)
cd ~/.claude/skills/agent-observability/apps/server/
rm -rf node_modules/

# Remove client dependencies (optional)
cd ~/.claude/skills/agent-observability/apps/client/
rm -rf node_modules/

# Keep skill files for future use
# Files in ~/.claude/skills/agent-observability/ are small and harmless when inactive
```

**Note**: Uninstalling doesn't delete historical event JSONL files unless you explicitly remove `raw-outputs/`.

---

## Next Steps

1. ✅ Complete installation (all steps above)
2. ➡️ **Run verification checklist** (PACK_VERIFY.md)
3. ➡️ Start capturing events (use Claude Code normally)
4. ➡️ Explore dashboard features (swim lanes, filtering, analytics)
5. ➡️ Review captured events for insights

---

## Support

**Issues?** Check:
1. This troubleshooting section
2. `~/.claude/skills/agent-observability/PACK_README.md` for architecture details
3. `~/.claude/skills/agent-observability/workflows/` for detailed workflow guides
4. Server/client console output for specific error messages

**Common Pitfalls**:
- PAI_DIR not set → Hook can't find files
- Port conflicts → Server can't bind to 3001
- Hooks not executable → Permission denied errors
- WebSocket blocked → Firewall or browser security

---

**Installation Guide Version**: 2.0
**Last Updated**: 2026-01-03
**Estimated Completion**: ✅ 15-20 minutes
