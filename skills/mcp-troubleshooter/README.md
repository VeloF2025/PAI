# MCP Troubleshooter - Skill Definition

**Skill Name**: mcp-troubleshooter
**Version**: 2.0.0
**Triggers**: "mcp issues", "fix mcp", "mcp not working", "debug mcp", "mcp troubleshoot"
**Auto-Run**: SessionStart hook (health check mode)

## Purpose

Systematically diagnose and fix MCP (Model Context Protocol) server connection and functionality issues. Provides automated troubleshooting for common MCP problems. **Automatically runs health checks at session startup** to ensure all MCPs are working.

## When to Use

Use this skill when:
- MCP tools are not responding
- MCP server connection timeouts occur
- MCP tools return errors
- Browser automation fails
- User mentions MCP is "not working"

## Capabilities

1. **Automated Health Checks (Session Startup)**
   - Runs automatically at every session start
   - Verifies all PAI-required MCPs are responding
   - Tests chrome-devtools-mcp browser connectivity
   - Reports health status in session startup message
   - Auto-fixes common issues (cache clear, reconnect)
   - Silent mode: only reports if issues found

2. **Diagnose MCP Server Status**
   - Check if MCP servers are running
   - Verify MCP configuration
   - Test server connectivity
   - Check server logs

3. **Fix Common Issues**
   - Restart unresponsive MCP servers
   - Clear corrupted caches
   - Reinstall MCP packages
   - Fix permission issues
   - Remove stale lock files

4. **Verify Installations**
   - Check global MCP installations
   - Check project-level MCP installations
   - Verify MCP versions
   - Test MCP tool availability

5. **Browser Automation Specific**
   - Fix chrome-devtools-mcp issues
   - Fix playwright-mcp issues
   - Clear browser locks
   - Test browser connectivity

## Troubleshooting Protocol

### Phase 0: Automated Health Check (Session Startup - 5 seconds)
**Runs automatically at every session start via SessionStart hook**

1. **PAI MCP Status Check** (Required MCPs via npx)
   - ✅ context7 - Documentation search
   - ✅ sequential-thinking - Step-by-step reasoning
   - ✅ memory - Knowledge graph storage
   - ✅ claude-prompts - Prompt templates
   - ⚠️ playwright - Browser automation (extension required, expected to fail)

2. **Project MCP Status Check**
   - ✅ chrome-devtools-mcp - Browser automation (current project)

3. **Quick Connectivity Test**
   - Test one MCP tool from each active server
   - Verify no timeout errors

4. **Auto-Fix Common Issues**
   - If MCP connection fails: auto-retry once
   - If cache corruption detected: auto-clear npm cache
   - If lock files found: auto-remove

5. **Report Health Status**
   ```
   MCP_HEALTH_CHECK_COMPLETE
   ✅ 4/5 PAI MCPs healthy (playwright expected fail - no extension)
   ✅ chrome-devtools-mcp healthy
   ✅ All critical MCPs operational
   ```

   **Only show detailed report if issues found**

### Phase 1: Quick Diagnostics (30 seconds)
1. Test basic MCP connectivity with `/mcp` command
2. Check if MCP servers are responding
3. List available MCP tools
4. Check for obvious errors in logs

### Phase 2: Common Fixes (2 minutes)
1. Clear npm cache: `npm cache clean --force`
2. Restart MCP servers via `/mcp` reconnect
3. Remove lock files for browser automation
4. Verify package installations

### Phase 3: Deep Troubleshooting (5 minutes)
1. Reinstall problematic MCP packages
2. Check for version conflicts
3. Verify MCP configuration files
4. Test individual MCP tools
5. Check system requirements (Node.js version, etc.)

### Phase 4: Advanced Recovery (10+ minutes)
1. Complete MCP package reinstallation
2. Reset MCP configuration
3. Check for OS-level issues
4. Verify network/firewall settings
5. Create detailed diagnostic report

## Common Issues & Solutions

### Issue: "MCP client failed to start: request timed out"
**Solution**:
1. Update Node.js to latest LTS
2. `npm cache clean --force`
3. `npm uninstall -g <mcp-package>`
4. `npm install -g <mcp-package>@latest`

### Issue: "Extension connection timeout" (Playwright MCP)
**Solution**:
1. Install Playwright MCP Bridge extension
2. Use chrome-devtools-mcp instead (better compatibility)

### Issue: "Browser already in use" (Browser automation)
**Solution**:
1. Remove lock file: `rm ~/.cache/ms-playwright/mcp-chrome/lock`
2. Kill lingering browser processes
3. Restart MCP server

### Issue: "AbortError: This operation was aborted"
**Solution**:
1. Wait for page to fully load before interacting
2. Increase timeout values
3. Check if page is accessible (not 404/500)

### Issue: MCP tools not appearing in Claude Code
**Solution**:
1. Run `/mcp` to check server status
2. Restart Claude Code session
3. Verify MCP configuration in settings
4. Check MCP package installation

## Automated Diagnostic Script

```bash
#!/bin/bash
# MCP Health Check Script

echo "=== MCP HEALTH CHECK ==="
echo ""

# Check Node.js version
echo "1. Node.js Version:"
node --version
echo ""

# Check global MCP packages
echo "2. Global MCP Packages:"
npm list -g --depth=0 | grep mcp
echo ""

# Check MCP server status
echo "3. MCP Server Status:"
# This would be run via /mcp command
echo "Run: /mcp"
echo ""

# Check for lock files
echo "4. Browser Lock Files:"
if [ -f "$HOME/.cache/ms-playwright/mcp-chrome/lock" ]; then
    echo "⚠️  Lock file found (may cause issues)"
else
    echo "✓ No lock files"
fi
echo ""

# Check project-level MCP
echo "5. Project MCP Packages:"
npm list --depth=0 | grep mcp
echo ""

echo "=== END HEALTH CHECK ==="
```

## Usage Examples

### Example 1: Quick MCP Check
```
User: "mcp not working"
Agent: [Triggers mcp-troubleshooter skill]
1. Runs /mcp to check server status
2. Lists available MCP tools
3. Tests a simple MCP tool
4. Reports findings and fixes if needed
```

### Example 2: Browser Automation Issues
```
User: "chrome devtools mcp is timing out"
Agent: [Triggers mcp-troubleshooter skill]
1. Checks for browser lock files
2. Verifies chrome-devtools-mcp installation
3. Tests browser connectivity
4. Provides fix recommendations
```

### Example 3: Complete MCP Reset
```
User: "mcp is completely broken, fix everything"
Agent: [Triggers mcp-troubleshooter skill]
1. Backs up MCP configuration
2. Uninstalls all MCP packages
3. Clears all caches
4. Reinstalls MCP packages
5. Verifies all MCP tools work
6. Creates diagnostic report
```

## Tool Sequence

When troubleshooting MCP issues, use tools in this order:

1. **SlashCommand**: `/mcp` - Check server status
2. **Bash**: Run diagnostic commands
3. **Read**: Check configuration files
4. **Bash**: Apply fixes (cache clear, reinstall, etc.)
5. **SlashCommand**: `/mcp` - Verify fixes worked
6. **Write**: Create diagnostic report

## Success Criteria

MCP is considered "fixed" when:
- ✅ `/mcp` shows all servers connected
- ✅ MCP tools respond without errors
- ✅ Browser automation works (if applicable)
- ✅ No timeout or connection errors
- ✅ MCP tools available in tool list

## Output Format

Always provide:
1. **Diagnosis**: What's wrong
2. **Root Cause**: Why it happened
3. **Fix Applied**: What was done
4. **Verification**: Proof it works
5. **Prevention**: How to avoid in future

## Automated Health Check System

**NEW in v2.0.0**: Automatic health monitoring at session startup

### How It Works

The mcp-troubleshooter skill now includes an **automated health check** that runs at every session start via the SessionStart hook.

**Location**: `~/.claude/hooks/mcp-health-check.ts`
**Hook**: Line 278 in `~/.claude/settings.json`

### What Gets Checked Automatically

1. **PAI MCPs** (5 required):
   - context7 (documentation search)
   - sequential-thinking (reasoning)
   - memory (knowledge graph)
   - claude-prompts (templates)
   - playwright (browser automation - expected to fail without extension)

2. **Project MCPs**:
   - chrome-devtools-mcp (current project)

3. **Auto-Fixes Applied**:
   - npm cache corruption → auto-clear cache
   - MCP connection timeout → auto-retry once
   - Browser lock files → auto-remove (planned)

### Health Status Output

**Healthy** (silent mode):
```
MCP_HEALTH_CHECK_COMPLETE
✅ All MCPs operational (6 checked)
```

**Degraded** (issues auto-fixed):
```
MCP_HEALTH_CHECK_REPORT
⚠️ Issues found but auto-fixed
Auto-Fixes Applied: 1
```

**Critical** (manual intervention needed):
```
MCP_HEALTH_CHECK_REPORT
❌ Critical MCP failures detected
⚠️ CRITICAL: Run "mcp troubleshoot" for detailed diagnostics
```

### Manual Troubleshooting

If the automated health check reports critical issues, trigger full troubleshooting:
- Say: "mcp troubleshoot"
- Say: "fix mcp"
- Say: "debug mcp"

This runs the complete 4-phase troubleshooting protocol.

### Testing the Health Check

**Manual Test**:
```bash
bun ~/.claude/hooks/mcp-health-check.ts
```

**Expected**: Health report with exit code 0 (healthy), 1 (degraded), or 2 (critical)

### Documentation

Full documentation: `MCP_AUTOMATED_HEALTH_CHECK.md` in project root

## Integration with PAI

This skill integrates with:
- **SessionStart Hook**: Automated health check at startup
- **mcp-auto-reconnect**: Pre-warms MCP packages before health check
- **Veritas**: Truth-enforcing (no guessing at solutions)
- **NLNH Protocol**: State confidence in diagnosis
- **Zero Tolerance**: No incomplete fixes

## Related Skills

- `validate` - Test MCP tools after fixes
- `monitor` - Check MCP server health ongoing
- `create-skill` - Create custom MCP server skills

## Maintenance

Update this skill when:
- New MCP packages are released
- New common issues are discovered
- MCP protocol changes
- Better troubleshooting methods found

---

**Created**: 2025-12-20
**Last Updated**: 2025-12-20
**Skill Type**: Diagnostic/Repair
**Complexity**: Medium
**Estimated Fix Time**: 2-10 minutes
