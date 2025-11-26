# PAI Troubleshooting Guide

Quick solutions for common PAI issues.

---

## MCP Server Issues

### "No MCP servers configured"

**Symptom**: `/mcp` shows no servers

**Solution**:
```bash
# Re-add MCP servers
claude mcp add context7 -- bunx -y @upstash/context7-mcp@latest
claude mcp add memory -- bunx -y @modelcontextprotocol/server-memory
claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking
claude mcp add playwright -- bunx -y @playwright/mcp@latest
claude mcp add github -- bunx -y @modelcontextprotocol/server-github

# Verify
claude mcp list
```

### MCP Server "Failed to connect"

**Symptom**: `claude mcp list` shows ✗ Failed to connect

**Solutions**:
1. **Check package name** - Try `npx` instead of `bunx` or vice versa
2. **Network issue** - Check internet connection
3. **Restart Claude Code** - Close and reopen terminal

```bash
# Remove and re-add the failing server
claude mcp remove [server-name]
claude mcp add [server-name] -- [correct-command]
```

### Veritas MCP not connecting

**Symptom**: Veritas MCP shows failed but others work

**Solution**: Veritas requires Docker to be running:
```bash
cd "C:/Jarvis/AI Workspace/Veritas"
docker compose -f docker-compose.veritas.yml up -d

# Check health
curl http://localhost:8061/health
```

---

## Skills Issues

### Skill not activating

**Symptom**: Skill doesn't trigger when expected

**Solutions**:
1. **Check triggers** - Read the skill's SKILL.md for exact trigger phrases
2. **Explicit activation** - Use `skill: "skill-name"` tool call
3. **Verify skill exists** - Check `.claude/skills/[skill-name]/SKILL.md`

### Fabric skill not working

**Symptom**: Fabric patterns unavailable

**Solution**: Clone the fabric repository:
```bash
cd ~/.claude/skills/fabric
git clone https://github.com/danielmiessler/fabric.git fabric-repo
```

---

## Hook Issues

### Hooks not running

**Symptom**: SessionStart/Edit/Commit hooks don't execute

**Solutions**:
1. **Check settings.json** - Verify hooks are configured
2. **Check file paths** - Ensure hook files exist at specified paths
3. **Check permissions** - Hooks need execute permission

```bash
# Verify hooks in settings
cat ~/.claude/settings.json | grep -A 20 "hooks"
```

### Hook errors breaking workflow

**Symptom**: Hook throws error and blocks operations

**Solution**: Hooks should fail silently. If blocking:
1. Check hook code for unhandled exceptions
2. Add try/catch around risky operations
3. Set `"blocking": false` in hook config (if supported)

---

## Docker/Veritas Issues

### Veritas services not starting

**Symptom**: `docker compose up` fails

**Solutions**:
```bash
# Check Docker is running
docker ps

# Check for port conflicts
netstat -ano | findstr :8282
netstat -ano | findstr :8061

# Force rebuild
docker compose -f docker-compose.veritas.yml build --no-cache
docker compose -f docker-compose.veritas.yml up -d
```

### Veritas memory not persisting

**Symptom**: Past executions not found in similarity search

**Solutions**:
1. **Check PostgreSQL** - Database must be running
2. **Check Redis** - Caching requires Redis
3. **Check DATABASE_URL** - Environment variable must be set

```bash
# Check database connection
docker compose -f docker-compose.veritas.yml logs veritas-server | grep -i database
```

---

## Validation Issues

### Validation always failing

**Symptom**: Pre-commit or post-edit validation blocks everything

**Solutions**:
1. **Check actual errors** - Read the validation output carefully
2. **Disable temporarily** - Comment out hook in settings.json
3. **Fix root cause** - Usually console.log, TypeScript errors, or catch blocks

Common fixes:
```typescript
// Replace console.log
import { log } from '@/lib/logger';
log.info('message', data, 'component');

// Fix catch blocks
catch (error: unknown) {  // Not just catch (error)
  const err = error instanceof Error ? error : new Error(String(error));
}
```

### DGTS blocking agent

**Symptom**: "Agent blocked due to gaming behavior"

**Solution**: DGTS detected suspicious patterns. Review:
1. Are tests actually testing real functionality?
2. Are any validation rules commented out?
3. Are functions returning mock data?

Fix the gaming pattern and wait for auto-unblock (2 hours) or request manual unblock.

---

## Performance Issues

### Slow skill activation

**Symptom**: Skills take 30+ seconds to load

**Solutions**:
1. **Use Tier 1 only** - Ensure skills don't load full content upfront
2. **Lazy loading** - Load resources on-demand
3. **Check context size** - Large SKILL.md files slow everything

### High token usage

**Symptom**: Running out of context quickly

**Solutions**:
1. **Enable context compression** - Check context-compression-hook.ts
2. **Use deferred loading** - Don't load all tools at once
3. **Summarize long outputs** - Use hooks to compress results

---

## Voice System Issues

### Voice notifications not working

**Symptom**: No voice announcements

**Solutions**:
1. **Check voice server** - `curl http://localhost:8888/health`
2. **macOS only** - Voice system is macOS-specific currently
3. **ElevenLabs API key** - Must be configured

```bash
# Start voice server manually
cd ~/.claude/voice-server
bun run start
```

### Wrong voice playing

**Symptom**: Voice doesn't match agent

**Solution**: Check voice ID mapping in CORE/SKILL.md:
```yaml
# Voice IDs
kai: [voice-id]
engineer: [voice-id]
researcher: [voice-id]
```

---

## Git Issues

### Committing from wrong directory

**Symptom**: PAI files committed to wrong repo

**Prevention**: Always run `git remote -v` before committing

**Solution**:
```bash
# Revert last commit (if not pushed)
git reset --soft HEAD~1

# Move files to correct repo
# Re-commit from correct directory
```

### Sensitive data in commit

**Symptom**: API keys, tokens, or private data committed

**Solution**:
```bash
# If not pushed yet
git reset --soft HEAD~1
# Remove sensitive files
git add .
git commit -m "Safe commit"

# If already pushed - USE BFG or git-filter-repo
# Rotate all exposed credentials immediately
```

---

## Quick Health Check

Run this to verify PAI is healthy:

```bash
# 1. MCP servers
claude mcp list

# 2. Git status
cd ~/.claude && git status

# 3. Docker (if using Veritas)
docker ps | grep veritas

# 4. Voice server (macOS)
curl -s http://localhost:8888/health || echo "Voice server not running"

# 5. Veritas API (if Docker running)
curl -s http://localhost:8282/health || echo "Veritas not running"
```

---

## Getting Help

1. **Check documentation**: `~/.claude/documentation/`
2. **Review skill files**: Each skill has usage instructions
3. **Check logs**: `docker compose logs` for Veritas issues
4. **GitHub issues**: Report bugs at PAI repository

---

## Emergency Reset

If PAI is completely broken:

```bash
# 1. Backup current config
cp -r ~/.claude ~/.claude.backup

# 2. Reset MCP servers
claude mcp list | grep -E "^\w" | xargs -I {} claude mcp remove {}

# 3. Re-add essential servers
claude mcp add context7 -- bunx -y @upstash/context7-mcp@latest
claude mcp add memory -- bunx -y @modelcontextprotocol/server-memory

# 4. Restart Claude Code
# Close all terminals and reopen
```
