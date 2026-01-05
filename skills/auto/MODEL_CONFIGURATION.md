# Model Configuration Guide

## Overview

This guide explains how to use different Claude models for planning vs execution in both the `/auto` workflow and manual planning mode.

---

## Part 1: `/auto` Workflow Configuration

### ✅ CONFIGURED - Models by Stage

The `/auto` skill is now configured to use different models for each stage:

| Stage | Task | Model | Reason |
|-------|------|-------|--------|
| **Stage 1** | PAI Planning (PRD/PRP/ADR) | **Opus 4.5** | Better reasoning for architecture decisions |
| **Stage 2** | ACH Autonomous Coding | **Sonnet 4.5** | Speed + cost efficiency for implementation |
| **Stage 3** | Final Validation | **Sonnet 4.5** | Fast validation checks |

### Configuration File

**Location**: `C:\Users\HeinvanVuuren\.claude\skills\auto\config\auto-config.yaml`

```yaml
# Model Configuration
models:
  planning: claude-opus-4-5      # Stage 1: PAI Planning
  coding: claude-sonnet-4-5      # Stage 2: ACH Autonomous Coding
  validation: claude-sonnet-4-5  # Stage 3: Final Validation
```

### How It Works

When you run:
```
/auto "Build a task management app"
```

The workflow will automatically:
1. **Stage 1** - Use Opus 4.5 to create PRD, PRP, ADR, and app_spec.txt
2. **Stage 2** - Switch to Sonnet 4.5 for fast autonomous coding
3. **Stage 3** - Continue with Sonnet 4.5 for validation

### Customization

You can override these settings per-project by creating `.auto-config.local.yaml` in your project root:

```yaml
# Project-specific overrides
models:
  planning: claude-sonnet-4-5  # Use Sonnet for planning in this project
  coding: claude-opus-4-5      # Use Opus for coding (slower but higher quality)
```

---

## Part 2: Manual Planning Mode

### Option A: Change Global Model Setting (Temporary)

When you want to enter planning mode manually:

**Before planning**:
1. Update `.claude/settings.json` line 367:
   ```json
   "model": "opus"
   ```
2. Enter planning mode (EnterPlanMode or natural language)
3. Complete your planning

**After planning**:
1. Update `.claude/settings.json` back to:
   ```json
   "model": "sonnet"
   ```
2. Continue with implementation

### Option B: Use a Planning Slash Command (RECOMMENDED)

Create a custom slash command that enters plan mode with Opus automatically.

**Create**: `C:\Users\HeinvanVuuren\.claude\commands\plan-opus.md`

```markdown
# Plan with Opus 4.5

IMPORTANT: Switch to Opus 4.5 model for this planning session.

You are now in planning mode. Analyze the user's request and create a comprehensive implementation plan:

1. Explore the codebase thoroughly
2. Identify all relevant files and dependencies
3. Design the implementation approach
4. Consider architectural trade-offs
5. Create a detailed step-by-step plan

After creating the plan, use ExitPlanMode to return to implementation.

User request: {prompt}
```

**Usage**:
```
/plan-opus Design a caching strategy for the API
```

Then manually switch back to Sonnet after planning is complete.

### Option C: Automatic Model Switching Hook (✅ IMPLEMENTED)

The hook has been created and registered. It automatically switches models when entering/exiting plan mode.

**Create**: `C:\Users\HeinvanVuuren\.claude\hooks\plan-mode-model-switcher.ts`

```typescript
#!/usr/bin/env bun
/**
 * Automatically switch to Opus for planning mode, Sonnet for implementation
 */

import * as fs from 'fs';
import * as path from 'path';

const settingsPath = 'C:/Users/HeinvanVuuren/.claude/settings.json';

// Check if EnterPlanMode is being called
const args = process.argv.slice(2);
const isEnteringPlanMode = args.includes('EnterPlanMode');
const isExitingPlanMode = args.includes('ExitPlanMode');

if (isEnteringPlanMode) {
  // Switch to Opus for planning
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  settings.model = 'opus';
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  console.log('🔄 Switched to Opus 4.5 for planning mode');
} else if (isExitingPlanMode) {
  // Switch back to Sonnet for implementation
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  settings.model = 'sonnet';
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  console.log('🔄 Switched back to Sonnet 4.5 for implementation');
}
```

**Add to** `.claude/settings.json` hooks:

```json
"PreToolUse": [
  {
    "matcher": "EnterPlanMode",
    "hooks": [
      {
        "type": "command",
        "command": "bun C:/Users/HeinvanVuuren/.claude/hooks/plan-mode-model-switcher.ts EnterPlanMode"
      }
    ]
  }
],
"PostToolUse": [
  {
    "matcher": "ExitPlanMode",
    "hooks": [
      {
        "type": "command",
        "command": "bun C:/Users/HeinvanVuuren/.claude/hooks/plan-mode-model-switcher.ts ExitPlanMode"
      }
    ]
  }
]
```

---

## Model Comparison

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| **Opus 4.5** | Slower | Higher | Architecture design, complex planning, critical decisions |
| **Sonnet 4.5** | Faster | Lower | Implementation, validation, routine tasks |
| **Haiku 4** | Fastest | Lowest | Simple operations, quick checks |

---

## Current Status

✅ **FULLY CONFIGURED**:
- `/auto` workflow uses Opus for planning, Sonnet for coding
- Config file: `auto-config.yaml` with model settings
- Auto-orchestrator passes models to each stage
- **Manual planning mode**: Automatic hook implemented (Option C)
- Hook automatically switches to Opus on EnterPlanMode
- Hook automatically switches back to Sonnet on ExitPlanMode
- Hooks registered in `.claude/settings.json` (lines 150-155, 217-222)

---

## Testing

### Test `/auto` with Opus planning:
```
/auto "Build a simple todo app with drag and drop"
```

Check logs for:
```
🤖 [Workflow Orchestrator] Autonomous mode ENABLED
   - Planning model: opus
```

### Test manual planning (if using Option C):
```
Can you plan out how to implement user authentication?
```

Claude should automatically switch to Opus, create the plan, then switch back to Sonnet.

---

## Troubleshooting

**Issue**: `/auto` workflow not using Opus for planning

**Solution**: Check `auto-config.yaml` has:
```yaml
models:
  planning: claude-opus-4-5
```

**Issue**: Manual planning mode still uses Sonnet

**Solution**: Manually change `settings.json` or implement Option C hook

**Issue**: Opus is too slow/expensive

**Solution**: Override with Sonnet:
```yaml
models:
  planning: claude-sonnet-4-5  # Use Sonnet for faster planning
```

---

## Cost Optimization

**Strategy 1**: Use Opus only for complex projects
- Simple projects: Override with Sonnet
- Complex projects: Keep Opus default

**Strategy 2**: Use Opus for architecture, Sonnet for updates
- Initial planning: Opus (better architecture)
- Iterations/updates: Sonnet (faster)

**Strategy 3**: Hybrid approach
- PRD/ADR: Opus (critical decisions)
- PRP/Tasks: Sonnet (implementation details)
  - (Requires modifying PAI workflow to use different models per phase)

---

**Last Updated**: 2025-12-08
**Status**: FULLY IMPLEMENTED ✅
- Opus 4.5 configured for `/auto` planning globally
- Manual planning mode automatic model switching active (Option C)
