# Global vs. Local PAI Configuration

**Understanding What Gets Used Where**

## TL;DR Answer to Your Question

**YES** ✅ - All enhancements, changes, and validations in this repo WILL be used globally when you call PAI from any project or PC, as long as you run the setup script to copy files to `~/.claude/`.

---

## How PAI Works: Two-Layer Architecture

### Layer 1: Global PAI Infrastructure (Active Everywhere)

**Location**: `~/.claude/` (user home directory)

These files are **ALWAYS active** in every Claude Code session, regardless of which project you're in:

```
~/.claude/
├── skills/          ← All 41 packs (including new icons!)
├── hooks/           ← All automation hooks
├── protocols/       ← All quality protocols (DGTS, NLNH, etc.)
├── commands/        ← Slash commands
├── memories/        ← Persistent memory across projects
├── bin/pai          ← PAI launcher (bash/PowerShell)
└── settings.json    ← Global Claude Code settings
```

**Key Point**: When you work in **ANY** project on **ANY** PC, Claude Code loads these files automatically.

### Layer 2: Universal Triggers (Active Everywhere)

**Location**: `C:\Jarvis\CLAUDE.md` (or `/path/to/CLAUDE.md` on Linux/macOS)

This file contains global triggers that work in **every** Claude Code session:
- **@PAI** / **@kai** - Load full PAI context
- **CPD** - Commit, Push, Deploy workflow
- **RYR** - Remember Your Rules
- **@Veritas** - Truth-enforcing mode
- **@Archon** - Project-specific agents

**Configured via**: Claude Desktop config (`claude_desktop_config.json`)

---

## What Gets Used Globally vs. Locally

### ✅ GLOBAL (Used Everywhere)

| Component | Location | Used When |
|-----------|----------|-----------|
| **All 41 Packs** | `~/.claude/skills/` | Any project, any PC |
| **Pack Icons** | `~/.claude/skills/*/icon.png` | Pack discovery UI |
| **All Hooks** | `~/.claude/hooks/` | Every Claude Code session |
| **All Protocols** | `~/.claude/protocols/` | Progressive disclosure on-demand |
| **Slash Commands** | `~/.claude/commands/` | Type `/command-name` |
| **Memory System** | `~/.claude/memories/` | Persistent context |
| **PAI Launcher** | `~/.claude/bin/pai` | Run `pai` anywhere |
| **Global Triggers** | `C:\Jarvis\CLAUDE.md` | Every session via config |
| **Model Routing** | `~/.claude/hooks/model-router.ts` | Auto-detect complexity |
| **Proactive Scanner** | `~/.claude/hooks/proactive-scanner.ts` | Every commit |

### 📂 PROJECT-SPECIFIC (Only in Specific Repos)

| Component | Location | Used When |
|-----------|----------|-----------|
| **Project CLAUDE.md** | `<project>/CLAUDE.md` | Only in that project |
| **Project .agent-os/** | `<project>/.agent-os/` | Project-specific agents |
| **Project .antihall/** | `<project>/.antihall/` | Project validation |

---

## How Global Sync Works

### On Your Current PC (Where You're Developing)

**Repo ⇄ Global Directory Sync**:

```
C:\Jarvis\AI Workspace\Personal_AI_Infrastructure\.claude\
  ↓ (You make changes here)
  ↓ (Commit to GitHub)
  ↓
GitHub Repository (source of truth)
  ↓
  ↓ (Pull on other PCs)
  ↓
~/.claude/ (global directory)
  ↓ (Copied via setup-new-pc.ps1)
  ↓
Active in ALL Claude Code sessions
```

### On a New PC or Different Project

**Initial Setup** (one-time):

```bash
# Step 1: Clone your PAI repo
git clone [YOUR_REPO_URL]
cd Personal_AI_Infrastructure

# Step 2: Run setup script (copies .claude/ → ~/.claude/)
.\setup-new-pc.ps1  # Windows
# or
./setup-new-pc.sh   # Linux/macOS

# Step 3: Done! PAI now active globally
```

**Result**: All enhancements from the repo are now in `~/.claude/` and active everywhere.

---

## Keeping Global .claude/ In Sync

### Method 1: Manual Copy (Current Approach)

After making changes in the repo:

```bash
# Copy updated files to global directory
cp -r .claude/skills/* ~/.claude/skills/
cp -r .claude/hooks/* ~/.claude/hooks/
cp -r .claude/protocols/* ~/.claude/protocols/
```

### Method 2: Symbolic Link (Advanced)

**Option A: Link entire .claude directory**:
```bash
# Windows (as Administrator)
cmd /c mklink /D "%USERPROFILE%\.claude" "C:\Jarvis\AI Workspace\Personal_AI_Infrastructure\.claude"

# Linux/macOS
ln -s "$(pwd)/.claude" ~/.claude
```

**Option B: Link individual directories**:
```bash
# Windows
cmd /c mklink /D "%USERPROFILE%\.claude\skills" "C:\Jarvis\AI Workspace\Personal_AI_Infrastructure\.claude\skills"

# Linux/macOS
ln -s "$(pwd)/.claude/skills" ~/.claude/skills
```

**Benefit**: Changes in repo immediately reflected in `~/.claude/` (no copy needed).

**Risk**: If you delete repo, you lose global config (use with caution).

### Method 3: Automated Sync Script (Recommended)

Create a script that runs after every commit:

```powershell
# sync-to-global.ps1
param([string]$Direction = "repo-to-global")

$RepoClaudeDir = "C:\Jarvis\AI Workspace\Personal_AI_Infrastructure\.claude"
$GlobalClaudeDir = "$env:USERPROFILE\.claude"

if ($Direction -eq "repo-to-global") {
    Write-Host "Syncing repo → global..."
    Copy-Item "$RepoClaudeDir\skills\*" -Destination "$GlobalClaudeDir\skills\" -Recurse -Force
    Copy-Item "$RepoClaudeDir\hooks\*" -Destination "$GlobalClaudeDir\hooks\" -Recurse -Force
    Copy-Item "$RepoClaudeDir\protocols\*" -Destination "$GlobalClaudeDir\protocols\" -Recurse -Force
} elseif ($Direction -eq "global-to-repo") {
    Write-Host "Syncing global → repo..."
    Copy-Item "$GlobalClaudeDir\skills\*" -Destination "$RepoClaudeDir\skills\" -Recurse -Force
    Copy-Item "$GlobalClaudeDir\hooks\*" -Destination "$RepoClaudeDir\hooks\" -Recurse -Force
    Copy-Item "$GlobalClaudeDir\protocols\*" -Destination "$RepoClaudeDir\protocols\" -Recurse -Force
}

Write-Host "✅ Sync complete"
```

**Usage**:
```bash
# After making changes in repo
.\sync-to-global.ps1 repo-to-global

# Or add to post-commit hook
```

---

## Verification Checklist

### ✅ Confirm Global PAI is Active

**Test 1: Check .claude directory exists**:
```bash
ls -la ~/.claude/
```

**Test 2: Verify icon generation worked globally**:
```bash
ls -lh ~/.claude/skills/kai/icon.png
# Expected: 20KB PNG file
```

**Test 3: Check all 41 packs have icons**:
```bash
find ~/.claude/skills/ -name "icon.png" | wc -l
# Expected: 41
```

**Test 4: Global trigger works in ANY project**:
```bash
# Open Claude Code in a different project
cd ~/Desktop  # or any non-PAI directory
claude

# Type in Claude:
@pai
# Expected: Full PAI context loads
```

**Test 5: Cross-platform compatibility**:
```bash
# Check path resolution in icon generator
cat ~/.claude/../scripts/generate-pack-icons.ts | grep "SKILLS_DIR"
# Expected: process.env.HOME || process.env.USERPROFILE
```

---

## What Happens When You Push Changes

### Scenario: You Added Pack Icons (Recent Work)

**What you did**:
1. Created `scripts/generate-pack-icons.ts` in repo
2. Ran script → Generated 41 icons in `~/.claude/skills/*/icon.png` (global directory)
3. Committed script to repo: `scripts/generate-pack-icons.ts`

**What happens on another PC**:

```bash
# On new PC after cloning repo:
git clone [YOUR_REPO_URL]
cd Personal_AI_Infrastructure

# Icon generation script is in the repo
ls scripts/generate-pack-icons.ts  # ✅ Exists

# But icons don't exist yet in global directory
ls ~/.claude/skills/kai/icon.png   # ❌ Not found

# Solution: Run the script to generate icons
bun run scripts/generate-pack-icons.ts
# Result: All 41 icons created in ~/.claude/skills/

# Or: Copy icons from repo if you committed them
cp .claude/skills/*/icon.png ~/.claude/skills/*/
```

---

## Recommendations for Your Workflow

### Option 1: Commit Icons to Repo (Simplest)

**Pros**:
- New PCs get icons immediately via `git clone`
- No need to run generator on each PC
- Icons version-controlled

**Cons**:
- Binary files in Git (41 × 20KB = ~820KB total)
- Git repo slightly larger

**How to do it**:
```bash
cd "C:\Jarvis\AI Workspace\Personal_AI_Infrastructure"

# Add all icons to repo
git add .claude/skills/*/icon.png

# Commit
git commit -m "feat(icons): Add 256x256 PNG icons for all 41 packs

Binary assets for Pack v2.0 compliance"

# Push
git push
```

**On new PC**:
```bash
git clone [YOUR_REPO_URL]
./setup-new-pc.ps1  # Copies icons to ~/.claude/
# Done! Icons active globally
```

### Option 2: Generate Icons on Setup (Current Approach)

**Pros**:
- No binary files in Git
- Generator script is version-controlled
- Can regenerate icons anytime

**Cons**:
- Must run generator on each new PC
- Requires Canvas system dependencies

**On new PC**:
```bash
git clone [YOUR_REPO_URL]
./setup-new-pc.ps1  # Sets up PAI

# Generate icons
bun run scripts/generate-pack-icons.ts

# Done! Icons created in ~/.claude/
```

### Option 3: Hybrid Approach (Recommended)

**Commit icons to repo** for convenience, but **keep generator script** for customization:

```bash
# Icons in repo for quick setup
git add .claude/skills/*/icon.png

# Generator script for customization
# (already committed)

# On new PC:
git clone [YOUR_REPO_URL]
./setup-new-pc.ps1
# Icons copied automatically from repo
# Can regenerate with custom colors using script
```

---

## Summary: Your Question Answered

> **"Can we confirm that all enhancements, changes, validations that are in PAI in this repo that's working will also be used globally if I call on PAI on another project or another PC even?"**

**Answer**: **YES** ✅, with one setup step:

1. **On Current PC** (where you're developing):
   - Changes made in repo (`C:\Jarvis\AI Workspace\Personal_AI_Infrastructure\.claude/`)
   - Repo commits pushed to GitHub ✅

2. **On New PC** (or different project on same PC):
   - Clone repo from GitHub
   - Run `setup-new-pc.ps1` (copies `.claude/` → `~/.claude/`)
   - **Result**: All enhancements now active globally

3. **Global Activation Verified**:
   - ✅ All 41 packs with icons
   - ✅ All hooks (proactive scanner, model routing, etc.)
   - ✅ All protocols (DGTS, NLNH, Zero Tolerance, etc.)
   - ✅ Cross-platform compatibility (Linux/macOS/Windows)
   - ✅ Icon generation system
   - ✅ Pack dependency management
   - ✅ Observability dashboard
   - ✅ Global triggers (@PAI, CPD, RYR, @Veritas, @Archon)

**The repository is your source of truth. The global `~/.claude/` directory is where PAI runs from.**

---

## Next Steps

### Recommended Actions Before Push

1. **✅ Commit icons to repo** (820KB total, reasonable):
   ```bash
   git add .claude/skills/*/icon.png
   git commit -m "feat(icons): Add Pack v2.0 icon assets (41 packs)"
   ```

2. **✅ Update setup script** to verify icon sync:
   ```powershell
   # Add to setup-new-pc.ps1:
   Write-Host "🎨 Verifying pack icons..."
   $iconCount = (Get-ChildItem -Path "$env:USERPROFILE\.claude\skills\*\icon.png").Count
   Write-Host "  ✅ Found $iconCount pack icons"
   ```

3. **✅ Test on different project** (same PC):
   ```bash
   cd ~/Desktop
   claude
   # Type: @pai
   # Verify: All icons visible, all features work
   ```

4. **✅ Document in PAI-TRANSFER-CHECKLIST.md**:
   - Add note about icon assets
   - Update verification steps

---

**Version**: 1.0
**Last Updated**: 2026-01-06
**Maintainer**: Hein van Vuuren (@kai)
