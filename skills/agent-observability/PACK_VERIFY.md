# Agent Observability Pack - Verification Checklist

**Version**: 2.0
**Purpose**: Verify correct installation and functionality
**Estimated Time**: 10-15 minutes

---

## 1. File Verification

### 1.1 Core Pack Files

```bash
cd ~/.claude/skills/agent-observability/
ls -la
```

**✅ Required Files**:
- [ ] `SKILL.md` - Skill definition with routing
- [ ] `PACK_README.md` - Pack overview
- [ ] `PACK_INSTALL.md` - Installation guide
- [ ] `PACK_VERIFY.md` - This verification checklist
- [ ] `README.md` - Original skill documentation

**✅ Required Directories**:
- [ ] `apps/` - Server and client applications
- [ ] `hooks/` - Event capture hooks
- [ ] `workflows/` - Workflow documentation

---

### 1.2 Server Application Files

```bash
ls ~/.claude/skills/agent-observability/apps/server/
```

**✅ Expected Files**:
- [ ] `file-ingest.ts` - Main server file
- [ ] `package.json` - Server dependencies
- [ ] `node_modules/` - Installed packages (if installed)

**✅ Key Dependencies** (in package.json):
```bash
cat apps/server/package.json | grep '"ws"'
cat apps/server/package.json | grep '"chokidar"'
```

- [ ] `ws` package listed
- [ ] `chokidar` package listed (optional, Bun has built-in)

---

### 1.3 Client Application Files

```bash
ls ~/.claude/skills/agent-observability/apps/client/
```

**✅ Expected Files**:
- [ ] `src/` - Vue application source
- [ ] `package.json` - Client dependencies
- [ ] `vite.config.ts` - Vite configuration
- [ ] `tailwind.config.js` - TailwindCSS config
- [ ] `node_modules/` - Installed packages (if installed)

**✅ Key Dependencies** (in package.json):
```bash
cat apps/client/package.json | grep '"vue"'
cat apps/client/package.json | grep '"vite"'
```

- [ ] `vue` package listed
- [ ] `vite` package listed

---

### 1.4 Hooks Directory

```bash
ls -la ~/.claude/skills/agent-observability/hooks/
```

**✅ Expected Files**:
- [ ] `capture-all-events.ts` - Main event capture hook

**✅ Hook Permissions**:
```bash
# Linux/Mac: Check executable
ls -la ~/.claude/skills/agent-observability/hooks/capture-all-events.ts
# Should show: -rwxr-xr-x (executable)

# Windows: Verify file exists
Test-Path "$env:USERPROFILE\.claude\skills\agent-observability\hooks\capture-all-events.ts"
# Should return: True
```

- [ ] Hook file exists
- [ ] Hook is executable (Linux/Mac) or readable (Windows)

---

## 2. Environment Verification

### 2.1 PAI_DIR Environment Variable

```bash
# Check PAI_DIR is set
echo $env:PAI_DIR  # Windows PowerShell
echo $PAI_DIR      # Linux/Mac Bash/Zsh

# Verify it points to PAI directory
ls $env:PAI_DIR/skills/  # Windows
ls $PAI_DIR/skills/      # Linux/Mac
```

**✅ Expected**:
- [ ] PAI_DIR is set
- [ ] PAI_DIR points to valid directory
- [ ] PAI_DIR/skills/ contains agent-observability

---

### 2.2 Directory Structure

```bash
# Check event storage directory exists
ls ~/.claude/history/raw-outputs/

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\history\raw-outputs\"
```

**✅ Expected**:
- [ ] `raw-outputs/` directory exists
- [ ] Monthly subdirectory exists (e.g., `2026-01/`)
- [ ] Directory is writable

---

## 3. Configuration Verification

### 3.1 Settings.json Hook Configuration

```bash
# View hooks configuration
cat ~/.claude/settings.json | grep -A 10 '"hooks"'

# Windows PowerShell
Get-Content "$env:USERPROFILE\.claude\settings.json" | Select-String -Pattern "hooks" -Context 0,10
```

**✅ Verify**:
- [ ] `hooks` section exists in settings.json
- [ ] At least `SessionStart` and `Stop` hooks configured
- [ ] Hooks reference `agent-observability/hooks/capture-all-events.ts`
- [ ] Hooks use `${PAI_DIR}` variable or absolute path

**Example Hook Configuration**:
```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "${PAI_DIR}/skills/agent-observability/hooks/capture-all-events.ts --event-type SessionStart"
      }]
    }]
  }
}
```

- [ ] Configuration matches expected format
- [ ] No JSON syntax errors

---

### 3.2 Dependencies Installed

**Server Dependencies**:
```bash
cd ~/.claude/skills/agent-observability/apps/server/
ls node_modules/ | grep ws
```

**✅ Expected**: `ws` package directory exists

**Client Dependencies**:
```bash
cd ~/.claude/skills/agent-observability/apps/client/
ls node_modules/ | grep vue
ls node_modules/ | grep vite
```

**✅ Expected**:
- [ ] `vue` package directory exists
- [ ] `vite` package directory exists

---

## 4. Server Verification

### 4.1 Server Startup

**Open dedicated terminal** (keep running):

```bash
cd ~/.claude/skills/agent-observability/apps/server/
bun run file-ingest.ts
```

**✅ Expected Output**:
```
[file-ingest] Watching: C:\Users\YourUsername\.claude\history\raw-outputs
[file-ingest] WebSocket server listening on port 3001
[file-ingest] Server ready - waiting for client connections
```

**✅ Verification**:
- [ ] Server starts without errors
- [ ] Shows "listening on port 3001"
- [ ] Shows correct raw-outputs path
- [ ] No "EADDRINUSE" or "EACCES" errors

---

### 4.2 Server Port Listening

**In separate terminal**:
```bash
# Check server is listening
netstat -ano | findstr :3001

# Expected output:
# TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    [PID]
```

**✅ Verification**:
- [ ] Port 3001 shows LISTENING state
- [ ] No errors when checking port

---

### 4.3 File Watcher Active

**Check server output** for file watcher initialization:

```
[file-ingest] Watching: /path/to/raw-outputs
[file-ingest] Initialized with 0 existing events
```

**✅ Expected**:
- [ ] File watcher reports correct path
- [ ] No "ENOENT" (directory not found) errors
- [ ] No permission errors

---

## 5. Client Verification

### 5.1 Client Startup

**Open second dedicated terminal** (keep running):

```bash
cd ~/.claude/skills/agent-observability/apps/client/
bun run dev
```

**✅ Expected Output**:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**✅ Verification**:
- [ ] Vite starts without errors
- [ ] Shows URL http://localhost:5173/
- [ ] No build errors
- [ ] No dependency resolution errors

---

### 5.2 Client Port Listening

**In separate terminal**:
```bash
# Check client is listening
netstat -ano | findstr :5173

# Expected output:
# TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING    [PID]
```

**✅ Verification**:
- [ ] Port 5173 shows LISTENING state
- [ ] No port conflicts

---

### 5.3 Dashboard Access

**Open browser** and navigate to http://localhost:5173/

**✅ Expected**:
- [ ] Dashboard loads (no 404 or connection refused)
- [ ] Shows "Agent Observability Dashboard" title
- [ ] Shows connection status indicator
- [ ] No JavaScript errors in browser console (F12 → Console)

---

## 6. WebSocket Connection Verification

### 6.1 Browser Console Check

**In dashboard browser tab**:
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for WebSocket connection messages

**✅ Expected Console Output**:
```
[client] Connecting to ws://localhost:3001
[client] WebSocket connected
[client] Subscribed to events
```

**✅ Verification**:
- [ ] No WebSocket connection errors
- [ ] Status shows "Connected" (green indicator)
- [ ] No CORS errors

---

### 6.2 Server Console Check

**Check server terminal output**:

**✅ Expected Output** (after client connects):
```
[file-ingest] Client connected
[file-ingest] Active connections: 1
```

**✅ Verification**:
- [ ] Server reports client connection
- [ ] Active connections count > 0
- [ ] No connection errors

---

### 6.3 Network Tab Verification

**In browser Developer Tools**:
1. Go to Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection to ws://localhost:3001

**✅ Expected**:
- [ ] WebSocket connection established
- [ ] Status shows "101 Switching Protocols"
- [ ] Frames tab shows bidirectional messages

---

## 7. Event Capture Verification

### 7.1 Test Event Generation

**Open third terminal** (Claude Code session):

```bash
# Start Claude Code
claude-code

# Type a simple command
> echo "Testing agent observability"

# Exit Claude Code
> exit
```

**✅ Expected**: Command executes normally

---

### 7.2 JSONL File Verification

**Check event file was created**:

```bash
# List today's events file
ls ~/.claude/history/raw-outputs/$(date +%Y-%m)/$(date +%Y-%m-%d)_all-events.jsonl

# Windows PowerShell
$today = Get-Date -Format "yyyy-MM-dd"
$month = Get-Date -Format "yyyy-MM"
Get-Item "$env:USERPROFILE\.claude\history\raw-outputs\$month\${today}_all-events.jsonl"
```

**✅ Verification**:
- [ ] JSONL file exists
- [ ] File is non-zero size
- [ ] File modified timestamp is recent

**View file contents**:
```bash
cat ~/.claude/history/raw-outputs/2026-01/2026-01-03_all-events.jsonl

# Windows
Get-Content "$env:USERPROFILE\.claude\history\raw-outputs\2026-01\2026-01-03_all-events.jsonl"
```

**✅ Expected Content**:
```jsonl
{"type":"SessionStart","timestamp":"2026-01-03T12:00:00.000Z","data":{...}}
{"type":"PreToolUse","timestamp":"2026-01-03T12:00:05.000Z","data":{"tool":"Bash",...}}
{"type":"PostToolUse","timestamp":"2026-01-03T12:00:06.000Z","data":{...}}
{"type":"Stop","timestamp":"2026-01-03T12:00:10.000Z","data":{...}}
```

**✅ Verification**:
- [ ] File contains valid JSON lines (one JSON object per line)
- [ ] Events include: SessionStart, PreToolUse, PostToolUse, Stop
- [ ] Events have `type`, `timestamp`, `data` fields
- [ ] Timestamps are valid ISO format

---

### 7.3 Dashboard Real-Time Display

**While Claude Code session is running**, watch dashboard:

**✅ Expected Dashboard Behavior**:
- [ ] Events appear in real-time (within 1-2 seconds)
- [ ] Events show correct type (SessionStart, PreToolUse, etc.)
- [ ] Events display timestamp
- [ ] Events show tool name (Bash, Read, Write, etc.)
- [ ] Auto-scroll works (latest events visible)

**Dashboard Sections to Check**:
- [ ] **Event Timeline**: Shows all events chronologically
- [ ] **Agent Swim Lanes**: Shows agent activity (if multi-agent)
- [ ] **Event Counter**: Shows total events captured
- [ ] **Filters**: Work to show/hide event types

---

## 8. Hook Functionality Verification

### 8.1 Test All Hook Types

**In Claude Code session**, trigger different hooks:

```bash
# SessionStart - automatic when session starts

# PreToolUse + PostToolUse
> echo "test"

# Read tool
> cat some-file.txt

# Write tool
> Write a new file

# Stop - automatic when session ends
> exit
```

**Check JSONL file** for all event types:

```bash
cat ~/.claude/history/raw-outputs/2026-01/2026-01-03_all-events.jsonl | grep '"type"'
```

**✅ Expected Output**:
```
{"type":"SessionStart",...}
{"type":"PreToolUse",...}
{"type":"PostToolUse",...}
{"type":"PreToolUse",...}
{"type":"PostToolUse",...}
{"type":"Stop",...}
```

**✅ Verification**:
- [ ] SessionStart captured
- [ ] PreToolUse captured (for Bash tool)
- [ ] PostToolUse captured (for Bash tool)
- [ ] Stop captured
- [ ] All events have valid structure

---

### 8.2 Hook Error Handling

**Intentionally trigger hook error**:

```bash
# Temporarily break hook (rename file)
mv ~/.claude/skills/agent-observability/hooks/capture-all-events.ts ~/.claude/skills/agent-observability/hooks/capture-all-events.ts.bak

# Run Claude Code command
claude-code -c "echo test"

# Restore hook
mv ~/.claude/skills/agent-observability/hooks/capture-all-events.ts.bak ~/.claude/skills/agent-observability/hooks/capture-all-events.ts
```

**✅ Expected Behavior**:
- [ ] Claude Code still works (hooks don't break core functionality)
- [ ] No events captured while hook is broken
- [ ] Events resume after hook is restored

---

## 9. Multi-Agent Verification

### 9.1 Spawn Multiple Agents

**In Claude Code session**:

```bash
# Use Task tool to spawn agent
> Use the Task tool to research "agent observability best practices"
```

**✅ Expected Dashboard Behavior**:
- [ ] New agent appears in swim lanes
- [ ] Events show different `agent_id` values
- [ ] Swim lanes show parallel activity
- [ ] Each agent has distinct color/visual identifier

---

### 9.2 Agent Swim Lane Visualization

**Check Dashboard Swim Lanes**:

**✅ Verification**:
- [ ] Multiple swim lanes visible (one per agent)
- [ ] Agent names displayed (kai, researcher, etc.)
- [ ] Events aligned chronologically across lanes
- [ ] Visual connections between parent/child agents

---

## 10. Performance Verification

### 10.1 High-Volume Event Test

**Generate many events quickly**:

```bash
# In Claude Code, use loop to generate events
> for i in {1..50}; do echo "Event $i"; done
```

**✅ Expected**:
- [ ] All 50+ events captured to JSONL
- [ ] Dashboard remains responsive
- [ ] No events dropped
- [ ] Memory usage stays reasonable (check server process)

---

### 10.2 Memory Usage

**Check server memory usage**:

```bash
# Linux/Mac
ps aux | grep file-ingest

# Windows
Get-Process | Where-Object {$_.ProcessName -eq "bun"} | Select-Object ProcessName,WS
```

**✅ Expected**:
- [ ] Memory usage < 200 MB (with 1000 events in buffer)
- [ ] Memory stable (not growing unbounded)

---

### 10.3 WebSocket Latency

**Test real-time streaming latency**:

1. Open browser Developer Tools → Network → WS tab
2. Trigger event in Claude Code
3. Watch for event message in WebSocket frames

**✅ Expected**:
- [ ] Event appears in <1 second after trigger
- [ ] No noticeable lag in dashboard updates

---

## 11. Filter and Search Verification

### 11.1 Event Type Filtering

**In Dashboard**:

1. Click event type filter (e.g., "PreToolUse")
2. Verify only PreToolUse events displayed

**✅ Verification**:
- [ ] Filters work correctly
- [ ] Can filter by event type
- [ ] Can filter by agent
- [ ] Can filter by tool name

---

### 11.2 Time Range Filtering

**If implemented in dashboard**:

1. Set time range filter (e.g., "Last 5 minutes")
2. Verify only recent events shown

**✅ Verification**:
- [ ] Time range filtering works
- [ ] Events outside range hidden
- [ ] Filter updates in real-time

---

## 12. Integration Verification

### 12.1 Compatibility with Other Skills

**Test with other PAI skills**:

```bash
# Test with research skill
> /research "AI agent observability patterns"

# Test with fabric skill
> /fabric extract_wisdom from "https://example.com"
```

**✅ Expected**:
- [ ] Other skills work normally
- [ ] Events from all skills captured
- [ ] No interference between observability and other skills

---

### 12.2 Crash Recovery Integration

**Verify compatibility with crash recovery**:

```bash
# Check retroactive categorization doesn't conflict
cd ~/.claude/scripts/
bun retroactive-categorization.ts --dry-run
```

**✅ Expected**:
- [ ] Retroactive categorization still works
- [ ] raw-outputs files readable by both systems
- [ ] No file lock conflicts

---

## Sign-Off Checklist

### Critical Items (Must Pass)

- [ ] ✅ All core pack files present
- [ ] ✅ Server starts without errors
- [ ] ✅ Client starts without errors
- [ ] ✅ WebSocket connection established
- [ ] ✅ Events captured to JSONL files
- [ ] ✅ Events stream to dashboard in real-time
- [ ] ✅ Hooks configured and executing

### Recommended Items (Should Pass)

- [ ] ✅ All hook types capturing events
- [ ] ✅ Multi-agent visualization works
- [ ] ✅ Filters and search functional
- [ ] ✅ Dashboard responsive under load
- [ ] ✅ Memory usage reasonable
- [ ] ✅ Compatible with other PAI skills

### Optional Items (Nice to Have)

- [ ] 🔵 Production build created
- [ ] 🔵 Background server configured
- [ ] 🔵 Custom event types added
- [ ] 🔵 Export functionality tested

---

## Final Validation

**Run comprehensive validation**:

```bash
# 1. Server health check
netstat -ano | findstr :3001 && echo "✅ Server OK" || echo "❌ Server Down"

# 2. Client health check
curl http://localhost:5173 > /dev/null 2>&1 && echo "✅ Client OK" || echo "❌ Client Down"

# 3. Events being captured
[ -f ~/.claude/history/raw-outputs/$(date +%Y-%m)/$(date +%Y-%m-%d)_all-events.jsonl ] && echo "✅ Events OK" || echo "❌ No Events"

# 4. Hook configured
grep -q "capture-all-events" ~/.claude/settings.json && echo "✅ Hooks OK" || echo "❌ Hooks Missing"
```

**✅ Expected**: All checks show "✅ OK"

---

## Health Check Summary

**Status**: [ ] PASS  [ ] FAIL  [ ] PARTIAL

**Issues Found**:
- [ ] None
- [ ] Minor issues (list below)
- [ ] Critical issues (list below)

**Issue Details**:
```
(Document any issues found during verification)
```

**Performance**:
- Server startup time: _____ seconds
- Client startup time: _____ seconds
- Event capture latency: _____ ms
- Dashboard load time: _____ seconds

**Sign-Off**:
- **Date**: _______________
- **Verified By**: _______________
- **Ready for Use**: [ ] YES  [ ] NO  [ ] WITH CAVEATS

---

## Next Steps

### If All Checks Pass ✅

1. Start using agent observability in normal Claude Code sessions
2. Monitor dashboard during complex multi-agent tasks
3. Use event history for debugging and analysis
4. Export insights for documentation or reporting

### If Issues Found ❌

1. Review failed checks above
2. Consult PACK_INSTALL.md troubleshooting section
3. Check server/client console output for errors
4. Verify PAI_DIR and hook configuration
5. Restart server and client
6. Re-run verification after fixes

---

## Maintenance Schedule

**Daily**:
- [ ] Check server and client are running (if auto-start configured)
- [ ] Verify events being captured (check today's JSONL file)

**Weekly**:
- [ ] Review disk space usage (raw-outputs directory)
- [ ] Clean old event files (>90 days)
- [ ] Update dependencies (`bun update`)

**Monthly**:
- [ ] Review captured event patterns for insights
- [ ] Archive old monthly directories
- [ ] Check for agent-observability pack updates

---

## Common Verification Failures

### Dashboard shows "Disconnected"
**Likely Cause**: Server not running or WebSocket blocked
**Fix**: Check server is running on port 3001, verify firewall settings

### No events appearing in JSONL file
**Likely Cause**: Hook not executing or PAI_DIR not set
**Fix**: Verify hook executable, check PAI_DIR environment variable

### Events captured but not streaming to dashboard
**Likely Cause**: File watcher not detecting changes
**Fix**: Restart server, check file watcher permissions

### Swim lanes empty despite events
**Likely Cause**: Events missing agent_id field
**Fix**: Verify hook captures agent context, check event structure

---

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Server won't start | Port conflict | `netstat -ano \| findstr :3001` and kill process |
| Client won't start | Dependencies missing | `bun install` in apps/client/ |
| No WebSocket connection | Firewall blocking | Check Windows Firewall, allow port 3001 |
| Hook not executing | Not executable | `chmod +x hooks/capture-all-events.ts` |
| Events not streaming | File watcher broken | Restart server |
| Dashboard blank | Browser cache | Hard refresh (Ctrl+Shift+R) |

---

**Verification Checklist Version**: 2.0
**Last Updated**: 2026-01-03
**Completion Time**: ⏱️ 10-15 minutes
