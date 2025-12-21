# Environment Variables for MCP Servers

This file documents required environment variables for MCP servers.

## Required Environment Variables

### 1. GITHUB_PAT
**Used by**: `github` MCP server
**Description**: GitHub Personal Access Token for repository automation
**Setup**:

```powershell
# Add to your PowerShell profile (permanent)
$env:GITHUB_PAT = "gho_YourTokenHere"

# Or add to System/User environment variables via Windows Settings
```

**Current Status**: ⚠️ **REQUIRED** - Set this environment variable before using GitHub MCP tools

### 2. Other MCP Servers
All other MCP servers in the configuration do not require environment variables:
- ✅ context7
- ✅ sequential-thinking
- ✅ memory
- ✅ naabu (uses HTTP with API key in config)
- ✅ Ref
- ✅ playwright
- ✅ chrome-devtools
- ✅ claude-prompts
- ✅ boss-ghost-mcp

---

## Security Best Practices

1. **Never commit tokens to Git** - Use environment variables instead
2. **Use ${VAR_NAME}** syntax in .mcp.json for environment variable references
3. **Keep tokens in**:
   - Windows environment variables (System/User)
   - PowerShell profile ($PROFILE)
   - .env files (add to .gitignore)

4. **Don't use**:
   - Hardcoded tokens in JSON files
   - Tokens in any tracked files

---

## Quick Setup

```powershell
# 1. Set environment variable (choose one method):

# Method A: Temporary (current session only)
$env:GITHUB_PAT = "gho_YourTokenHere"

# Method B: Permanent (add to PowerShell profile)
Add-Content $PROFILE "`n`$env:GITHUB_PAT = 'gho_YourTokenHere'"

# Method C: System-wide (Windows Settings)
# Settings > System > About > Advanced system settings > Environment Variables

# 2. Verify it's set
echo $env:GITHUB_PAT

# 3. Restart Claude Code to pick up the new environment variable
```

---

*Security Note: The GitHub token was redacted from .mcp.json in commit 5f1aa86*
*Date: 2025-12-21*
