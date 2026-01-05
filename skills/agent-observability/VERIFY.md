# Agent Observability Pack - Verification Checklist

**Purpose**: Verify that Agent Observability is correctly installed and functioning.

---

## Prerequisites Verification

- [ ] **Bun runtime** installed and working (`bun --version`)
- [ ] **Node.js** installed and working (`node --version`)
- [ ] **PAI directory** exists at `~/.claude/`
- [ ] **Hook file** exists at `~/.claude/skills/agent-observability/src/hooks/capture-all-events.ts`

---

## Installation Verification

### 1. Hook Configuration

- [ ] Hook is installed in `~/.claude/settings.json`
- [ ] Hook path references `src/hooks/capture-all-events.ts`
- [ ] Hook is executable (`chmod +x` completed)

**Verify**:
```bash
cat ~/.claude/settings.json | grep capture-all-events
```

**✅ Expected**: Hook path appears in tool:before and tool:after

---

### 2. Server Dependencies

- [ ] Server dependencies installed (`src/apps/server/node_modules/` exists)
- [ ] Server can start without errors
- [ ] Server listens on port 3001

**Verify**:
```bash
cd ~/.claude/skills/agent-observability/src/apps/server/
bun run src/index.ts
```

**✅ Expected**:
```
Server running on http://localhost:3001
WebSocket server ready
```

---

### 3. Client Dependencies

- [ ] Client dependencies installed (`src/apps/client/node_modules/` exists)
- [ ] Client dev server can start
- [ ] Client accessible at http://localhost:3000

**Verify**:
```bash
cd ~/.claude/skills/agent-observability/src/apps/client/
bun run dev
```

**✅ Expected**:
```
VITE v5.x.x ready
Local: http://localhost:3000/
```

---

### 4. History Directory

- [ ] History directory created (`~/.claude/history/agent-events/`)
- [ ] Directory is writable
- [ ] Symlink created (optional)

**Verify**:
```bash
ls -la ~/.claude/history/agent-events/
```

**✅ Expected**: Directory exists and is empty initially

---

## Functional Verification

### 5. Event Capture

- [ ] Run a command in Claude Code (e.g., `ls`)
- [ ] Events appear in server terminal
- [ ] JSONL file created in history directory
- [ ] JSONL file contains valid event data

**Verify**:
```bash
# Run command in Claude Code
ls

# Check history directory
ls -la ~/.claude/history/agent-events/

# View JSONL content
cat ~/.claude/history/agent-events/*.jsonl | head -5
```

**✅ Expected**: JSONL file exists with JSON events (one per line)

---

### 6. Dashboard Connection

- [ ] Dashboard loads at http://localhost:3000
- [ ] No console errors in browser dev tools
- [ ] WebSocket connects to server
- [ ] Events appear in dashboard

**Verify**:
1. Open http://localhost:3000 in browser
2. Open browser dev tools (F12)
3. Check Console tab for errors
4. Check Network tab for WebSocket connection

**✅ Expected**: Green status indicator, WebSocket connected

---

### 7. Live Updates

- [ ] Run another command in Claude Code
- [ ] Dashboard updates in real-time
- [ ] Event timeline shows new events
- [ ] Filters work correctly

**Verify**:
1. Keep dashboard open
2. Run `echo "test"` in Claude Code
3. Watch dashboard for updates

**✅ Expected**: New events appear within 1-2 seconds

---

## Code Quality Verification

### 8. TypeScript Compilation

- [ ] Server TypeScript compiles without errors
- [ ] Client TypeScript compiles without errors

**Verify**:
```bash
# Server
cd ~/.claude/skills/agent-observability/src/apps/server/
bun build src/index.ts

# Client
cd ~/.claude/skills/agent-observability/src/apps/client/
bun run build
```

**✅ Expected**: No TypeScript errors

---

### 9. Code Linting (if ESLint configured)

- [ ] No linting errors in server code
- [ ] No linting errors in client code

**Verify**:
```bash
# If ESLint is configured
cd ~/.claude/skills/agent-observability/src/apps/server/
bun run lint

cd ~/.claude/skills/agent-observability/src/apps/client/
bun run lint
```

**✅ Expected**: Zero errors (warnings acceptable)

---

## Pack v2.0 Structure Verification

### 10. Directory Structure

- [ ] `src/` directory exists
- [ ] `src/apps/client/` contains Vue.js app
- [ ] `src/apps/server/` contains Express server
- [ ] `src/hooks/` contains capture hook
- [ ] `src/workflows/` contains workflow documentation
- [ ] `src/history-structure/` contains example logs

**Verify**:
```bash
ls -la ~/.claude/skills/agent-observability/src/
```

**✅ Expected**: All subdirectories present

---

### 11. Required Files

- [ ] `README.md` exists and explains the pack
- [ ] `INSTALL.md` exists (this file's sibling)
- [ ] `VERIFY.md` exists (this file)
- [ ] `SKILL.md` exists (skill definition)

**Verify**:
```bash
ls ~/.claude/skills/agent-observability/*.md
```

**✅ Expected**: All 4 markdown files present

---

## Final Checklist

- [ ] All prerequisites verified ✅
- [ ] All installation steps verified ✅
- [ ] All functional tests passed ✅
- [ ] All code quality checks passed ✅
- [ ] Pack v2.0 structure verified ✅

---

## Troubleshooting Verification Issues

### Hook not working
- Re-check settings.json syntax (valid JSON)
- Restart Claude Code after hook installation
- Check hook file permissions

### Events not appearing
- Verify server is running
- Check server terminal for errors
- Confirm WebSocket connection in browser
- Try clearing browser cache

### Dashboard not loading
- Check client terminal for build errors
- Verify port 3000 is not in use
- Check browser console for JavaScript errors

---

## Success Criteria

**All checks must pass** for successful verification:

✅ Hook captures events from Claude Code
✅ Server receives and broadcasts events
✅ Client displays events in real-time
✅ JSONL logs are created correctly
✅ No TypeScript/build errors
✅ Pack v2.0 structure complete

---

**Verification Complete!** 🎉

Your Agent Observability pack is ready to use. Run commands in Claude Code and watch the dashboard for real-time observability.

---

**Verification Guide Version**: 2.0
**Last Updated**: 2026-01-05
