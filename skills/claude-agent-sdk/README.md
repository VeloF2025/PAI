# Claude Agent SDK Specialist

Expert skill for setting up, configuring, debugging, and maintaining autonomous Claude Agent SDK deployments.

## Activation Triggers

Use this skill when user mentions:
- "claude agent sdk", "claude-code-sdk", "agent sdk"
- "autonomous agent", "autonomous coding"
- "oauth authentication" for Claude
- "agent setup", "sdk setup"
- "buffer overflow" in agent context
- "agent crashes", "agent errors"
- "security hooks", "pretooluse hooks"

## Core Knowledge

### Authentication (CRITICAL)

The Claude Agent SDK uses **OAuth authentication**, NOT API keys.

**WRONG** (causes "Invalid API key" error):
```python
os.environ["ANTHROPIC_API_KEY"] = "sk-ant-..."
from dotenv import load_dotenv
load_dotenv()  # Breaks OAuth if .env has ANTHROPIC_API_KEY
```

**CORRECT**:
```bash
# First: Authenticate via CLI
claude auth login
```
```python
# Then: SDK reads token automatically - NO env var needed
from claude_code_sdk import ClaudeSDKClient
client = ClaudeSDKClient(options=...)
```

Token location:
- Windows: `%APPDATA%\claude\credentials.json`
- Linux/Mac: `~/.claude/credentials.json`

### Windows-Specific Fixes

**1. PATH for Claude CLI**:
```python
import os
npm_bin = r"C:\Users\<USERNAME>\AppData\Roaming\npm"
os.environ["PATH"] = npm_bin + os.pathsep + os.environ.get("PATH", "")
```

**2. Unicode encoding**:
```python
import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
```

### Buffer Overflow Prevention

The SDK has a **1MB JSON message buffer limit**. Enforce with hooks:

| Problem | Solution |
|---------|----------|
| File reads >500KB | Hook blocks, suggests offset/limit |
| PNG screenshots | Hook requires `type: "jpeg"` |
| Full-page screenshots | Hook blocks, suggests browser_snapshot |

**File size hook**:
```python
MAX_FILE_SIZE = 500 * 1024  # 500KB

async def file_size_hook(input_data, tool_use_id=None, context=None):
    if input_data.get("tool_name") != "Read":
        return {}
    file_path = input_data.get("tool_input", {}).get("file_path", "")
    try:
        if Path(file_path).stat().st_size > MAX_FILE_SIZE:
            return {"decision": "block", "reason": "File too large. Use offset/limit."}
    except:
        pass
    return {}
```

**Screenshot hook**:
```python
async def screenshot_hook(input_data, tool_use_id=None, context=None):
    if input_data.get("tool_name") != "mcp__playwright__browser_take_screenshot":
        return {}
    tool_input = input_data.get("tool_input", {})
    if tool_input.get("fullPage"):
        return {"decision": "block", "reason": "Use browser_snapshot instead."}
    if tool_input.get("type", "png") != "jpeg":
        return {"decision": "block", "reason": "Use type='jpeg'."}
    return {}
```

### Security Hooks Pattern

```python
from claude_code_sdk.types import HookMatcher

hooks={
    "PreToolUse": [
        HookMatcher(matcher="Bash", hooks=[bash_allowlist_hook]),
        HookMatcher(matcher="Read", hooks=[file_size_hook]),
        HookMatcher(
            matcher="mcp__playwright__browser_take_screenshot",
            hooks=[screenshot_hook],
        ),
    ],
},
```

### Client Creation Template

```python
from claude_code_sdk import ClaudeCodeOptions, ClaudeSDKClient
from claude_code_sdk.types import HookMatcher
import json

def create_client(project_dir, model="claude-sonnet-4-20250514"):
    security_settings = {
        "sandbox": {"enabled": True, "autoAllowBashIfSandboxed": True},
        "permissions": {
            "defaultMode": "acceptEdits",
            "allow": [
                "Read(./**)", "Write(./**)", "Edit(./**)",
                "Glob(./**)", "Grep(./**)", "Bash(*)",
                "mcp__playwright__*",
            ],
        },
    }

    settings_file = project_dir / ".claude_settings.json"
    project_dir.mkdir(parents=True, exist_ok=True)
    settings_file.write_text(json.dumps(security_settings, indent=2))

    return ClaudeSDKClient(
        options=ClaudeCodeOptions(
            model=model,
            system_prompt="You are an expert developer.",
            allowed_tools=[
                "Read", "Write", "Edit", "Glob", "Grep", "Bash",
                "mcp__playwright__browser_navigate",
                "mcp__playwright__browser_snapshot",
                "mcp__playwright__browser_click",
                "mcp__playwright__browser_type",
                "mcp__playwright__browser_take_screenshot",
            ],
            hooks={
                "PreToolUse": [
                    HookMatcher(matcher="Bash", hooks=[bash_hook]),
                    HookMatcher(matcher="Read", hooks=[file_size_hook]),
                    HookMatcher(
                        matcher="mcp__playwright__browser_take_screenshot",
                        hooks=[screenshot_hook],
                    ),
                ],
            },
            max_turns=1000,
            cwd=str(project_dir.resolve()),
            settings=str(settings_file.resolve()),
        )
    )
```

## Troubleshooting Guide

### Error: "Invalid API key"
**Cause**: `ANTHROPIC_API_KEY` env var is set
**Fix**:
```bash
# Windows
set ANTHROPIC_API_KEY=
# Remove from any .env files

# Then authenticate properly
claude auth login
```

### Error: "claude not found"
**Cause**: Claude CLI not in PATH
**Fix**:
```python
npm_bin = r"C:\Users\<USERNAME>\AppData\Roaming\npm"
os.environ["PATH"] = npm_bin + os.pathsep + os.environ.get("PATH", "")
```

### Error: "Failed to decode JSON: buffer size exceeded"
**Cause**: Tool returned >1MB data
**Fix**: Add PreToolUse hooks to block large operations

### Error: "'charmap' codec can't decode"
**Cause**: Unicode in output on Windows
**Fix**:
```python
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
```

### Agent crashes on screenshots
**Cause**: PNG screenshots too large
**Fix**: Add screenshot hook requiring JPEG format

### Agent asks for permissions repeatedly
**Cause**: Settings file not applied
**Fix**: Pass absolute path to settings parameter:
```python
settings=str(settings_file.resolve())
```

## Capabilities

When this skill is activated, I can:

1. **Setup new autonomous agent projects**
   - Create directory structure
   - Generate security hooks
   - Configure client.py
   - Set up prompt templates

2. **Debug authentication issues**
   - Diagnose OAuth vs API key problems
   - Fix PATH issues
   - Verify credential files

3. **Implement security hooks**
   - Bash command allowlists
   - File size limits
   - Screenshot safety
   - Custom validation

4. **Prevent buffer overflow crashes**
   - Add appropriate hooks
   - Configure safe defaults
   - Document limits in prompts

5. **Optimize agent performance**
   - Tune max_turns
   - Configure tool permissions
   - Set up state persistence

## Reference Implementation

Full working example at:
`C:\Jarvis\AI Workspace\BOSS Exchange\autonomous-coding\`

Key files:
- `autonomous_agent_demo.py` - Entry point
- `agent.py` - Session loop
- `client.py` - SDK client with hooks
- `security.py` - Hook implementations
- `prompts/coding_prompt.md` - Agent instructions

## Quick Setup Checklist

- [ ] `claude auth login` completed
- [ ] `pip install claude-code-sdk` installed
- [ ] No `ANTHROPIC_API_KEY` in environment or .env
- [ ] PATH includes npm bin (Windows)
- [ ] stdout encoding set to UTF-8 (Windows)
- [ ] Security hooks implemented for Bash, Read, Screenshot
- [ ] Settings file with sandbox + permissions
- [ ] max_turns configured appropriately
